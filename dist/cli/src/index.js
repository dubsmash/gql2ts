#!/usr/bin/env node
'use strict';
exports.__esModule = true;
var program = require("commander");
var fs = require("fs");
var src_1 = require("../../util/src");
var src_2 = require("../../from-schema/src");
var src_3 = require("../../from-query/src");
// tslint:disable-next-line no-require-imports no-var-requires
// const { version } = require('../package.json');
program
    .usage('[options] <schema.json | schema.gql> <query.gql>')
    .option('-o --output-file [outputFile]', 'name for output file, will use stdout if not specified')
    .option('-n --namespace [namespace]', 'name for the namespace, defaults to "GQL"', 'GQL')
    .option('-i --ignored-types <ignoredTypes>', 'names of types to ignore (comma delimited)', function (v) { return v.split(','); }, [])
    .option('-l --legacy', 'Use TypeScript 1.x annotation', false)
    .option('-e --external-options [externalOptions]', 'ES Module with method overwrites')
    .option('--ignore-type-name-declaration', 'Whether to exclude __typename', false)
    .option('--exclude-deprecated-fields', 'Whether to exclude deprecated fields', false)
    .parse(process.argv);
var run = function (schema, options) {
    var defaultOverrides = {};
    if (program.externalOptions) {
        // tslint:disable-next-line no-require-imports no-var-requires
        var externalFile = require(program.externalOptions);
        defaultOverrides = externalFile["default"] || externalFile;
    }
    if (program.args[1]) {
        var queryFile = program.args[1];
        var query = fs.readFileSync(queryFile).toString();
        var info = src_3["default"](schema, query, {}, defaultOverrides);
        var toWrite = info.map(function (inf) { return inf.result; }).join('\n\n');
        if (options.outputFile) {
            src_1.writeToFile(options.outputFile, toWrite);
        }
        else {
            console.log(toWrite);
        }
        return;
    }
    var namespace = src_2.generateNamespace(options.namespace, schema, options, defaultOverrides);
    if (options.outputFile) {
        src_1.writeToFile(options.outputFile, namespace);
    }
    else {
        console.log(namespace);
    }
};
var fileName = program.args[0];
if (fileName) {
    var schema = src_1.readFile(fileName);
    run(schema, program);
}
else if (!process.stdin.isTTY) {
    var input_1 = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (data) {
        input_1 += data;
    });
    process.stdin.on('end', function () { return run(src_1.safeJSONParse(input_1), program); });
}
else {
    console.error('No input specified. Please use stdin or a file name.');
    program.outputHelp();
}
