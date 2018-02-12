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
var subtype_1 = require("./subtype");
var doIt = function (schema, query, typeMap, providedOptions) {
    if (typeMap === void 0) { typeMap = {}; }
    if (providedOptions === void 0) { providedOptions = {}; }
    var TypeMap = __assign({}, src_2.DEFAULT_TYPE_MAP, typeMap);
    var _a = __assign({}, src_2.DEFAULT_OPTIONS, providedOptions), wrapList = _a.wrapList, wrapPartial = _a.wrapPartial, generateSubTypeInterfaceName = _a.generateSubTypeInterfaceName, printType = _a.printType, formatInput = _a.formatInput, generateFragmentName = _a.generateFragmentName, generateQueryName = _a.generateQueryName, interfaceBuilder = _a.interfaceBuilder, typeBuilder = _a.typeBuilder, typeJoiner = _a.typeJoiner, generateInterfaceDeclaration = _a.generateInterfaceDeclaration, exportFunction = _a.exportFunction, postProcessor = _a.postProcessor, generateInputName = _a.generateInputName, addExtensionsToInterfaceName = _a.addExtensionsToInterfaceName;
    var getSubtype = subtype_1.GenerateSubtypeCache();
    var parsedSchema = src_1.schemaFromInputs(schema);
    var parsedSelection = graphql_1.parse(query);
    var handleInputObject = function (type, isNonNull) {
        var variables = Object.keys(type.getFields()).map(function (k) { return type.getFields()[k]; });
        var variableDeclarations = variables.map(function (v) { return formatInput(v.name, true, convertToType(v.type)); });
        var builder = generateInterfaceDeclaration(variableDeclarations.map(function (v) { return v; }));
        return printType(builder, isNonNull);
    };
    var handleEnum = function (type, isNonNull) {
        var decl = type.getValues().map(function (_a) {
            var value = _a.value;
            return "'" + value + "'";
        }).join(' | ');
        return printType(decl, isNonNull);
    };
    var handleNamedTypeInput = function (type, isNonNull) {
        if (type.kind === 'NamedType' && type.name.kind === 'Name' && type.name.value) {
            var newType = parsedSchema.getType(type.name.value);
            if (newType instanceof graphql_1.GraphQLEnumType) {
                return handleEnum(newType, isNonNull);
            }
            else if (newType instanceof graphql_1.GraphQLInputObjectType) {
                return handleInputObject(newType, isNonNull);
            }
        }
    };
    var handleRegularType = function (type, isNonNull, replacement) {
        var typeValue = (typeof type.name === 'string') ? type.toString() : type.name.value;
        var showValue = replacement || typeValue;
        var show = TypeMap[showValue] || (replacement ? showValue : TypeMap.__DEFAULT);
        return printType(show, isNonNull);
    };
    var convertVariable = function (type, isNonNull, replacement) {
        if (isNonNull === void 0) { isNonNull = false; }
        if (replacement === void 0) { replacement = null; }
        if (type.kind === 'ListType') {
            return printType(wrapList(convertVariable(type.type, false, replacement)), isNonNull);
        }
        else if (type.kind === 'NonNullType') {
            return convertVariable(type.type, true, replacement);
        }
        else {
            return handleNamedTypeInput(type, isNonNull) || handleRegularType(type, isNonNull, replacement);
        }
    };
    var convertToType = function (type, isNonNull, replacement) {
        if (isNonNull === void 0) { isNonNull = false; }
        if (replacement === void 0) { replacement = null; }
        if (src_1.isList(type)) {
            return printType(wrapList(convertToType(type.ofType, false, replacement)), isNonNull);
        }
        else if (src_1.isNonNullable(type)) {
            return convertToType(type.ofType, true, replacement);
        }
        else if (src_1.isEnum(type)) {
            return handleEnum(type, isNonNull);
        }
        else {
            return handleRegularType(type, isNonNull, replacement);
        }
    };
    var UndefinedDirectives = new Set(['include', 'skip']);
    var isUndefinedFromDirective = function (directives) {
        if (!directives || !directives.length) {
            return false;
        }
        var badDirectives = directives.filter(function (d) { return !UndefinedDirectives.has(d.name.value); });
        var hasDirectives = directives.some(function (d) { return UndefinedDirectives.has(d.name.value); });
        if (badDirectives.length) {
            console.error('Found some unknown directives:');
            badDirectives.forEach(function (d) { return console.error(d.name.value); });
        }
        return hasDirectives;
    };
    var getOperationFields = function (operation) {
        switch (operation) {
            case 'query':
                return parsedSchema.getQueryType();
            case 'mutation':
                return parsedSchema.getMutationType();
            case 'subscription':
                return parsedSchema.getSubscriptionType();
            default:
                throw new Error('Unsupported Operation');
        }
    };
    var wrapPossiblePartial = function (possiblePartial) {
        if (possiblePartial.isPartial) {
            return wrapPartial(possiblePartial.iface);
        }
        else {
            return possiblePartial.iface;
        }
    };
    var flattenComplexTypes = function (children) { return (children.reduce(function (acc, child) { acc.push.apply(acc, child.complexTypes); return acc; }, [])); };
    var getField = function (operation, selection, parent) {
        if (parent && graphql_1.isCompositeType(parent)) {
            if (parent instanceof graphql_1.GraphQLUnionType) {
                return parent.getTypes().map(function (t) { return t.getFields()[selection.name.value]; }).find(function (z) { return !!z; });
            }
            else {
                return parent.getFields()[selection.name.value];
            }
        }
        else {
            var operationFields = getOperationFields(operation);
            // operation is taken from the schema, so it should never be falsy
            return operationFields.getFields()[selection.name.value];
        }
    };
    var getChildSelections = function (operation, selection, parent, isUndefined) {
        if (isUndefined === void 0) { isUndefined = false; }
        var str = '';
        var isFragment = false;
        var isPartial = false;
        var complexTypes = [];
        if (selection.kind === 'Field') {
            var field = getField(operation, selection, parent);
            var selectionName = selection.alias ? selection.alias.value : selection.name.value;
            var childType = void 0;
            isUndefined = isUndefined || isUndefinedFromDirective(selection.directives);
            var resolvedType = void 0;
            if (selectionName.startsWith('__')) {
                resolvedType = TypeMap.String;
            }
            else if (!!selection.selectionSet) {
                var newParent_1;
                var fieldType = graphql_1.getNamedType(field.type);
                if (graphql_1.isCompositeType(fieldType)) {
                    newParent_1 = fieldType;
                }
                var selections = selection.selectionSet.selections.map(function (sel) { return getChildSelections(operation, sel, newParent_1); });
                var nonFragments = selections.filter(function (s) { return !s.isFragment; });
                var fragments = selections.filter(function (s) { return s.isFragment; });
                var andOps = [];
                complexTypes.push.apply(complexTypes, flattenComplexTypes(selections));
                if (nonFragments.length) {
                    var nonPartialNonFragments = nonFragments.filter(function (nf) { return !nf.isPartial; });
                    var partialNonFragments = nonFragments.filter(function (nf) { return nf.isPartial; });
                    if (nonPartialNonFragments.length) {
                        var interfaceDeclaration = generateInterfaceDeclaration(nonPartialNonFragments.map(function (f) { return f.iface; }));
                        var subtypeInfo = getSubtype(selection, interfaceDeclaration, generateSubTypeInterfaceName);
                        var newInterfaceName = subtypeInfo ? subtypeInfo.name : null;
                        andOps.push(newInterfaceName || interfaceDeclaration);
                        if (newInterfaceName && subtypeInfo && !subtypeInfo.dupe) {
                            complexTypes.push({ iface: interfaceDeclaration, isPartial: false, name: newInterfaceName });
                        }
                    }
                    if (partialNonFragments.length) {
                        var interfaceDeclaration = wrapPartial(generateInterfaceDeclaration(partialNonFragments.map(function (f) { return f.iface; })));
                        var subtypeInfo = getSubtype(selection, interfaceDeclaration, generateSubTypeInterfaceName);
                        var newInterfaceName = subtypeInfo ? subtypeInfo.name : null;
                        andOps.push(newInterfaceName || interfaceDeclaration);
                        if (newInterfaceName && subtypeInfo && !subtypeInfo.dupe) {
                            complexTypes.push({ iface: interfaceDeclaration, isPartial: true, name: newInterfaceName });
                        }
                    }
                }
                andOps.push.apply(andOps, fragments.map(wrapPossiblePartial));
                childType = typeJoiner(andOps);
                resolvedType = convertToType(field.type, false, childType);
            }
            else {
                resolvedType = convertToType(field.type, false, childType);
            }
            str = formatInput(selectionName, isUndefined, resolvedType);
        }
        else if (selection.kind === 'FragmentSpread') {
            str = generateFragmentName(selection.name.value);
            isFragment = true;
            isPartial = isUndefinedFromDirective(selection.directives);
        }
        else if (selection.kind === 'InlineFragment') {
            var anon_1 = !selection.typeCondition;
            if (!anon_1) {
                var typeName = selection.typeCondition.name.value;
                parent = parsedSchema.getType(typeName);
            }
            var selections = selection.selectionSet.selections.map(function (sel) { return getChildSelections(operation, sel, parent, !anon_1); });
            var joinSelections = selections.map(function (s) { return s.iface; }).join('\n');
            isPartial = isUndefinedFromDirective(selection.directives);
            complexTypes.push.apply(complexTypes, flattenComplexTypes(selections));
            return {
                iface: joinSelections,
                isFragment: isFragment,
                isPartial: isPartial,
                complexTypes: complexTypes
            };
        }
        return {
            iface: str,
            isFragment: isFragment,
            isPartial: isPartial,
            complexTypes: complexTypes
        };
    };
    var getVariables = function (variables) { return (variables.map(function (v) {
        var optional = v.type.kind !== 'NonNullType';
        return formatInput(v.variable.name.value, optional, convertVariable(v.type));
    })); };
    var variablesToInterface = function (opName, variables) {
        if (!variables || !variables.length) {
            return '';
        }
        var variableTypeDefs = getVariables(variables);
        return postProcessor(exportFunction(interfaceBuilder(generateInputName(opName), generateInterfaceDeclaration(variableTypeDefs))));
    };
    var buildAdditionalTypes = function (children) {
        var subTypes = flattenComplexTypes(children);
        return subTypes.map(function (subtype) {
            if (subtype.isPartial) {
                return postProcessor(exportFunction(typeBuilder(subtype.name, subtype.iface)));
            }
            else {
                return postProcessor(exportFunction(interfaceBuilder(subtype.name, subtype.iface)));
            }
        });
    };
    var joinOutputs = function (output) {
        var variables = output.variables, additionalTypes = output.additionalTypes, iface = output.interface;
        var result = [variables].concat(additionalTypes, [iface]).filter(function (x) { return !!x; }).join('\n\n');
        return __assign({}, output, { result: result });
    };
    return parsedSelection.definitions.map(function (def) {
        if (def.kind === 'OperationDefinition') {
            var ifaceName = generateQueryName(def);
            var variableInterface = variablesToInterface(ifaceName, def.variableDefinitions);
            var ret = def.selectionSet.selections.map(function (sel) { return getChildSelections(def.operation, sel); });
            var fields = ret.map(function (x) { return x.iface; });
            var iface = postProcessor(exportFunction(interfaceBuilder(ifaceName, generateInterfaceDeclaration(fields))));
            var additionalTypes = buildAdditionalTypes(ret);
            return joinOutputs({
                variables: variableInterface,
                interface: iface,
                additionalTypes: additionalTypes
            });
        }
        else if (def.kind === 'FragmentDefinition') {
            var ifaceName = generateFragmentName(def.name.value);
            // get the correct type
            var onType = def.typeCondition.name.value;
            var foundType_1 = parsedSchema.getType(onType);
            var ret = def.selectionSet.selections.map(function (sel) { return getChildSelections('query', sel, foundType_1); });
            var extensions = ret.filter(function (x) { return x.isFragment; }).map(function (x) { return x.iface; });
            var fields = ret.filter(function (x) { return !x.isFragment; }).map(function (x) { return x.iface; });
            var iface = postProcessor(exportFunction(interfaceBuilder(addExtensionsToInterfaceName(ifaceName, extensions), generateInterfaceDeclaration(fields))));
            var additionalTypes = buildAdditionalTypes(ret);
            return joinOutputs({
                interface: iface,
                variables: '',
                additionalTypes: additionalTypes
            });
        }
        else {
            throw new Error("Unsupported Definition " + def.kind);
        }
    });
};
exports["default"] = doIt;
