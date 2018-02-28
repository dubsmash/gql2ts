"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var graphql_1 = require("graphql");
var src_1 = require("../../util/src");
var src_2 = require("../../language-typescript/src");
var run = function (schemaInput, optionsInput) {
    var _a = optionsInput.formats, generateEnumName = _a.generateEnumName, generateInterfaceName = _a.generateInterfaceName, generateTypeName = _a.generateTypeName, printType = _a.printType, formatInput = _a.formatInput, wrapList = _a.wrapList, formatEnum = _a.formatEnum, typeBuilder = _a.typeBuilder, gID = _a.generateInterfaceDeclaration, interfaceBuilder = _a.interfaceBuilder, addSemicolon = _a.addSemicolon, enumTypeBuilder = _a.enumTypeBuilder;
    var TYPE_MAP = __assign({}, src_2.DEFAULT_TYPE_MAP, (optionsInput.typeMap || {}));
    function isScalar(type) {
        return type instanceof graphql_1.GraphQLScalarType || !!type._scalarConfig;
    }
    var generateRootDataName = function (schema) {
        var rootNamespaces = [];
        var queryType = schema.getQueryType();
        var mutationType = schema.getMutationType();
        var subscriptionType = schema.getSubscriptionType();
        if (queryType) {
            rootNamespaces.push(generateInterfaceName(queryType.name));
        }
        if (mutationType) {
            rootNamespaces.push(generateInterfaceName(mutationType.name));
        }
        if (subscriptionType) {
            rootNamespaces.push(generateInterfaceName(subscriptionType.name));
        }
        return rootNamespaces.join(' | ');
    };
    var generateRootTypes = function (schema) { return "  export interface GraphQLResponseRoot {\n    data?: " + generateRootDataName(schema) + ";\n    errors?: Array<GraphQLResponseError>;\n  }\n\n  export interface GraphQLResponseError {\n    message: string;            // Required for all errors\n    locations?: Array<GraphQLResponseErrorLocation>;\n    [propName: string]: any;    // 7.2.2 says 'GraphQL servers may provide additional entries to error'\n  }\n\n  export interface GraphQLResponseErrorLocation {\n    line: number;\n    column: number;\n  }"; };
    var generateDescription = function (description, jsDoc) {
        if (jsDoc === void 0) { jsDoc = []; }
        return (description || jsDoc.length) ? "/**\n      " + [description].concat(jsDoc.map(function (_a) {
            var tag = _a.tag, value = _a.value;
            return "      @" + tag + " " + value;
        })).filter(function (x) { return !!x; }).join('\n') + "\n    */" : '';
    };
    var wrapWithDescription = function (declaration, description) {
        return "  " + generateDescription(description) + "\n  " + declaration;
    };
    function isInputField(field) {
        return !!field.astNode && field.astNode.kind === 'InputValueDefinition';
    }
    var buildDocTags = function (field) {
        var tags = [];
        if (isInputField(field)) {
            if (field.defaultValue) {
                tags.push({ tag: 'default', value: field.defaultValue });
            }
        }
        else {
            if (field.isDeprecated) {
                tags.push({ tag: 'deprecated', value: field.deprecationReason || '' });
            }
        }
        return tags;
    };
    var generateTypeDeclaration = function (description, name, possibleTypes) { return wrapWithDescription(addSemicolon(typeBuilder(name, possibleTypes)) + '\n\n', description); };
    var typeNameDeclaration = function (name) { return addSemicolon("__typename: \"" + name + "\""); };
    var generateInterfaceDeclaration = function (_a, declaration, fields, additionalInfo, isInput) {
        var name = _a.name, description = _a.description;
        if (!isInput && !optionsInput.ignoreTypeNameDeclaration) {
            fields = [typeNameDeclaration(name)].concat(fields);
        }
        return additionalInfo + wrapWithDescription(interfaceBuilder(declaration, gID(fields.map(function (f) { return "    " + f; }), '  ')), description);
    };
    var generateEnumDeclaration = function (description, name, enumValues) {
        if (!enumTypeBuilder) {
            console.warn('Missing `enumTypeBuilder` from language file and falling back to using a type for enums. This new option was added in v1.5.0');
        }
        return wrapWithDescription((enumTypeBuilder || typeBuilder)(generateEnumName(name), formatEnum(enumValues)), description);
    };
    /**
     * TODO
     * - add support for custom types (via optional json file or something)
     * - allow this to return metadata for Non Null types
     */
    var resolveInterfaceName = function (type) {
        if (src_1.isList(type)) {
            return wrapList(resolveInterfaceName((type).ofType));
        }
        else if (src_1.isNonNullable(type)) {
            return "!" + resolveInterfaceName((type).ofType);
        }
        else if (isScalar(type)) {
            return TYPE_MAP[type.name] || TYPE_MAP.__DEFAULT;
        }
        else if (graphql_1.isAbstractType(type)) {
            return generateTypeName(type.name);
        }
        else if (src_1.isEnum(type)) {
            return generateEnumName(type.name);
        }
        else {
            return generateInterfaceName(type.name);
        }
    };
    var fieldToDefinition = function (field, isInput, supportsNullability) {
        var interfaceName = resolveInterfaceName(field.type);
        var isNotNull = interfaceName.includes('!');
        var showNullabiltyAttribute = !isNotNull && supportsNullability;
        if (isNotNull) {
            /**
             * should probably refactor this at some point to have
             * `resolveInterfaceName` return better metadata
             * global regex replace is ugly
             */
            interfaceName = interfaceName.replace(/\!/g, '');
        }
        return formatInput(field.name, isInput && (showNullabiltyAttribute || !isNotNull), printType(interfaceName, !showNullabiltyAttribute));
    };
    var findRootType = function (type) {
        if (src_1.isList(type) || src_1.isNonNullable(type)) {
            return findRootType(type.ofType);
        }
        return type;
    };
    var filterField = function (field, ignoredTypes) {
        var nestedType = findRootType(field.type);
        return !ignoredTypes.has(nestedType.name) && (!optionsInput.excludeDeprecatedFields || !field.isDeprecated);
    };
    function isUnion(type) {
        return type instanceof graphql_1.GraphQLUnionType || (!!type._types && type._types.length > 1);
    }
    var generateAbstractTypeDeclaration = function (type, ignoredTypes, interfaceMap) {
        var poss = (isUnion(type)) ? type.getTypes() : interfaceMap.get(type) || [];
        var possibleTypes = poss
            .filter(function (t) { return !ignoredTypes.has(t.name); })
            .map(function (t) { return generateInterfaceName(t.name); });
        return generateTypeDeclaration(type.description, generateTypeName(type.name), possibleTypes.join(' | '));
    };
    var typeToInterface = function (type, ignoredTypes, supportsNullability, interfaceMap) {
        if (isScalar(type)) {
            return null;
        }
        if (isUnion(type)) {
            return generateAbstractTypeDeclaration(type, ignoredTypes, interfaceMap);
        }
        if (src_1.isEnum(type)) {
            return generateEnumDeclaration(type.description, type.name, type.getValues());
        }
        var isInput = type instanceof graphql_1.GraphQLInputObjectType;
        if (!type.getFields)
            console.dir(type);
        var f1 = (type.getFields ? type.getFields() : {});
        var f = Object.keys(f1).map(function (k) { return f1[k]; });
        var fields = f
            .filter(function (field) { return filterField(field, ignoredTypes); })
            .map(function (field) { return [generateDescription(field.description, buildDocTags(field)), fieldToDefinition(field, isInput, supportsNullability)]; })
            .reduce(function (acc, val) { return acc.concat(val.filter(function (x) { return x; })); }, [])
            .filter(function (field) { return field; });
        var interfaceDeclaration = generateInterfaceName(type.name);
        var additionalInfo = '';
        if (graphql_1.isAbstractType(type)) {
            additionalInfo = generateAbstractTypeDeclaration(type, ignoredTypes, interfaceMap);
        }
        return generateInterfaceDeclaration(type, interfaceDeclaration, fields, additionalInfo, isInput);
    };
    var typesToInterfaces = function (schema, options) {
        var ignoredTypes = new Set(options.ignoredTypes);
        var interfaces = [];
        interfaces.push(generateRootTypes(schema)); // add root entry point & errors
        var supportsNullability = !options.legacy;
        var types = schema.getTypeMap();
        var typeArr = Object.keys(types).map(function (k) { return types[k]; });
        var interfaceMap = new Map();
        typeArr.forEach(function (type) {
            if (type instanceof graphql_1.GraphQLObjectType) {
                type.getInterfaces().forEach(function (iface) {
                    if (interfaceMap.has(iface)) {
                        interfaceMap.set(iface, (interfaceMap.get(iface)).concat([type]));
                    }
                    else {
                        interfaceMap.set(iface, [type]);
                    }
                });
            }
        });
        var typeInterfaces = typeArr
            .filter(function (type) { return !type.name.startsWith('__'); }) // remove introspection types
            .filter(function (type) {
            return !ignoredTypes.has(type.name);
        })
            .map(function (type) {
            return typeToInterface(type, ignoredTypes, supportsNullability, interfaceMap);
        })
            .filter(function (type) { return type; }); // remove empty ones
        return interfaces
            .concat(typeInterfaces) // add typeInterfaces to return object
            .join('\n\n'); // add newlines between interfaces
    };
    return typesToInterfaces(schemaInput, optionsInput);
};
exports.schemaToInterfaces = function (schema, options, formatters) {
    if (options === void 0) { options = {}; }
    if (formatters === void 0) { formatters = {}; }
    return run(src_1.schemaFromInputs(schema), __assign({}, options, { formats: __assign({}, src_2.DEFAULT_OPTIONS, formatters) }));
};
exports.generateNamespace = function (namespace, schema, options, overrides) {
    if (options === void 0) { options = {}; }
    if (overrides === void 0) { overrides = {}; }
    var formatters = __assign({}, src_2.DEFAULT_OPTIONS, overrides);
    return formatters.postProcessor(formatters.generateNamespace(namespace, exports.schemaToInterfaces(schema, options, formatters)));
};
