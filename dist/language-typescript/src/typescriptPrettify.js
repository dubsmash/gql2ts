"use strict";
/**
 * Here's a very basic TypeScript Prettifier.
 * Source: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API/15573be582511aeac9c1f4047d6b02ec829088cd
 * Default Options from:
 *  https://github.com/vvakame/typescript-formatter/tree/a49f0949c9760530365c5b874cf0e979bd010a04#read-settings-from-files
 */
exports.__esModule = true;
var ts = require("typescript");
var TYPESCRIPT_OPTIONS = {
    baseIndentSize: 0,
    indentSize: 2,
    tabSize: 2,
    indentStyle: 2,
    newLineCharacter: '\n',
    convertTabsToSpaces: true,
    insertSpaceAfterCommaDelimiter: true,
    insertSpaceAfterSemicolonInForStatements: true,
    insertSpaceBeforeAndAfterBinaryOperators: true,
    insertSpaceAfterConstructor: false,
    insertSpaceAfterKeywordsInControlFlowStatements: true,
    insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
    insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
    insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
    insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
    insertSpaceAfterTypeAssertion: false,
    insertSpaceBeforeFunctionParenthesis: false,
    placeOpenBraceOnNewLineForFunctions: false,
    placeOpenBraceOnNewLineForControlBlocks: false
};
var RULE_PROVIDER = new ts.formatting.RulesProvider();
RULE_PROVIDER.ensureUpToDate(TYPESCRIPT_OPTIONS);
var applyEdits = function (text, edits) {
    var result = text;
    for (var i = edits.length - 1; i >= 0; i--) {
        var change = edits[i];
        result = result.slice(0, change.span.start) + change.newText + result.slice(change.span.start + change.span.length);
    }
    return result;
};
var format = function (text) {
    var sourceFile = ts.createSourceFile('temp.ts', text, ts.ScriptTarget.Latest, true);
    var edits = ts.formatting.formatDocument(sourceFile, RULE_PROVIDER, TYPESCRIPT_OPTIONS);
    return applyEdits(text, edits);
};
exports["default"] = format;
