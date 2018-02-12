"use strict";
exports.__esModule = true;
var graphql_1 = require("graphql");
function isIntrospectionResult(schema) {
    return ('__schema' in (schema || {}));
}
exports.isIntrospectionResult = isIntrospectionResult;
exports.schemaFromInputs = function (schema) {
    if (schema instanceof graphql_1.GraphQLSchema) {
        return schema;
    }
    else if (typeof schema === 'string') {
        return graphql_1.buildSchema(schema);
    }
    else if (isIntrospectionResult(schema)) {
        return graphql_1.buildClientSchema(schema);
    }
    else if (isIntrospectionResult(schema.data)) {
        return graphql_1.buildClientSchema(schema.data);
    }
    else {
        throw new Error('Invalid Schema Input');
    }
};
function isNonNullable(type) {
    return type instanceof graphql_1.GraphQLNonNull;
}
exports.isNonNullable = isNonNullable;
function isList(type) {
    return type instanceof graphql_1.GraphQLList;
}
exports.isList = isList;
function isEnum(type) {
    return type instanceof graphql_1.GraphQLEnumType;
}
exports.isEnum = isEnum;
