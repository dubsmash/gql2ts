"use strict";
exports.__esModule = true;
var fs = require("fs");
exports.badWriteHandler = function (err) { if (err) {
    throw err;
} };
exports.readFile = function (fileName) {
    var stringifiedFile = fs.readFileSync(fileName).toString();
    if (fileName.endsWith('.json')) {
        // force JSON Parse
        return JSON.parse(stringifiedFile);
    }
    else if (fileName.endsWith('.graphql') || fileName.endsWith('.gql')) {
        // assume graphql schema language
        return stringifiedFile;
    }
    else {
        // fallback when the type is unknown
        return exports.safeJSONParse(stringifiedFile);
    }
};
exports.safeJSONParse = function (possibleJson) {
    try {
        return JSON.parse(possibleJson);
    }
    catch (e) {
        return possibleJson;
    }
};
exports.writeToFile = function (fileName, data) { return fs.writeFile(fileName, data, exports.badWriteHandler); };
