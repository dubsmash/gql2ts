"use strict";
exports.__esModule = true;
var typescriptPrettify_1 = require("./typescriptPrettify");
var humps_1 = require("humps");
exports.DEFAULT_INTERFACE_DECLARATION = function (fields) { return "{\n" + fields.join('\n') + "\n}"; };
exports.DEFAULT_INTERFACE_BUILDER = function (name, body) { return "export interface " + name + " " + body; };
exports.DEFAULT_INTERFACE_NAMER = function (name) { return "" + humps_1.pascalize(name); };
exports.DEFAULT_TYPE_BUILDER = function (name, body) { return "export type " + name + " = " + body; };
exports.DEFAULT_TYPE_JOINER = function (types) { return types.join(' & '); };
exports.DEFAULT_TYPE_NAMER = function (name) { return name; };
exports.interfaceExtendListToString = function (exts) {
    if (!exts.length) {
        return '';
    }
    return " extends " + exts.join(', ');
};
exports.ADD_INTERFACE_EXTENSIONS = function (opName, exts) { return opName + exports.interfaceExtendListToString(exts); };
exports.DEFAULT_NAME_FRAGMENT = function (name) { return "Fragment" + humps_1.pascalize(name); };
exports.DEFAULT_NAME_QUERY = function (def) { return def.name ? humps_1.pascalize(def.name.value) : 'Anonymous'; };
exports.DEFAULT_FORMAT_INPUT = function (name, isOptional, type) { return exports.ADD_SEMICOLON("" + name + (isOptional ? '?:' : ':') + " " + type); };
exports.DEFAULT_TYPE_MAP = {
    ID: 'string',
    String: 'string',
    Boolean: 'boolean',
    Float: 'number',
    Int: 'number',
    __DEFAULT: 'any'
};
exports.DEFAULT_WRAP_LIST = function (type) { return "Array<" + type + ">"; };
exports.DEFAULT_WRAP_PARTIAL = function (partial) { return "Partial<" + partial + ">"; };
exports.DEFAULT_TYPE_PRINTER = function (type, isNonNull) { return isNonNull ? type : type + " | null"; };
exports.DEFAULT_GENERATE_SUBTYPE_INTERFACE_NAME = function (selectionName) { return "SelectionOn" + humps_1.pascalize(selectionName); };
// values.map(v => `'${v.value}'`).join(' | ');
exports.DEFAULT_ENUM_FORMATTER = function (values) { return "{\n  " + values.map(function (_a) {
    var value = _a.value;
    return value + " = '" + value + "'";
}).join(',\n') + "\n}"; };
exports.DEFAULT_ENUM_TYPE_BUILDER = function (name, values) { return "export enum " + name + " " + values; };
exports.DEFAULT_ENUM_NAME_GENERATOR = function (name) { return "" + humps_1.pascalize(name); };
exports.DEFAULT_INPUT_NAME_GENERATOR = function (name) { return humps_1.pascalize(name) + "Input"; };
exports.DEFAULT_EXPORT_FUNCTION = function (declaration) { return "export " + declaration; };
exports.ADD_SEMICOLON = function (str) { return str + ";"; };
exports.DEFAULT_NAMESPACE_GENERATOR = function (namespaceName, interfaces) { return "\n// tslint:disable\n// graphql typescript definitions (auto-generated)\n\n// declare namespace " + namespaceName + " {\n" + interfaces + "\n// }\n\n// tslint:enable\n"; };
exports.DEFAULT_OPTIONS = {
    wrapList: exports.DEFAULT_WRAP_LIST,
    wrapPartial: exports.DEFAULT_WRAP_PARTIAL,
    generateSubTypeInterfaceName: exports.DEFAULT_GENERATE_SUBTYPE_INTERFACE_NAME,
    printType: exports.DEFAULT_TYPE_PRINTER,
    formatInput: exports.DEFAULT_FORMAT_INPUT,
    generateFragmentName: exports.DEFAULT_NAME_FRAGMENT,
    generateQueryName: exports.DEFAULT_NAME_QUERY,
    formatEnum: exports.DEFAULT_ENUM_FORMATTER,
    interfaceBuilder: exports.DEFAULT_INTERFACE_BUILDER,
    typeBuilder: exports.DEFAULT_TYPE_BUILDER,
    enumTypeBuilder: exports.DEFAULT_ENUM_TYPE_BUILDER,
    typeJoiner: exports.DEFAULT_TYPE_JOINER,
    generateInterfaceDeclaration: exports.DEFAULT_INTERFACE_DECLARATION,
    generateEnumName: exports.DEFAULT_ENUM_NAME_GENERATOR,
    generateTypeName: exports.DEFAULT_TYPE_NAMER,
    generateInterfaceName: exports.DEFAULT_INTERFACE_NAMER,
    exportFunction: exports.DEFAULT_EXPORT_FUNCTION,
    addSemicolon: exports.ADD_SEMICOLON,
    generateNamespace: exports.DEFAULT_NAMESPACE_GENERATOR,
    postProcessor: typescriptPrettify_1["default"],
    generateInputName: exports.DEFAULT_INPUT_NAME_GENERATOR,
    addExtensionsToInterfaceName: exports.ADD_INTERFACE_EXTENSIONS
};
exports["default"] = exports.DEFAULT_OPTIONS;
