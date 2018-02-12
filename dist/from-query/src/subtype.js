"use strict";
exports.__esModule = true;
exports.GenerateSubtypeCache = function () {
    var GeneratedSubtypes = new Map();
    var compareNoWhitespace = function (a, b) { return a.replace(/\s/g, '') === b.replace(/\s/g, ''); };
    var subTypeCacheHit = function (name, declaration) {
        return compareNoWhitespace(GeneratedSubtypes.get(name), declaration);
    };
    var generateEnumeratedName = function (name, count) { return "" + name + count; };
    var enumerateSubtypes = function (name, declaration) {
        if (!GeneratedSubtypes.has(name) || subTypeCacheHit(name, declaration)) {
            return { name: name, dupe: subTypeCacheHit(name, declaration) };
        }
        var i = 1;
        while (true) {
            var tempName = generateEnumeratedName(name, i);
            if (GeneratedSubtypes.has(tempName) && !subTypeCacheHit(tempName, declaration)) {
                i++;
                continue;
            }
            else {
                if (GeneratedSubtypes.has(tempName)) {
                    return { name: tempName, dupe: true };
                }
                else {
                    GeneratedSubtypes.set(tempName, declaration);
                    return { name: tempName, dupe: false };
                }
            }
        }
    };
    var subTypeStuff = function (subtype, declaration) {
        if (!subtype) {
            return subtype;
        }
        if (GeneratedSubtypes.has(subtype)) {
            return enumerateSubtypes(subtype, declaration);
        }
        else {
            GeneratedSubtypes.set(subtype, declaration);
        }
        return { name: subtype, dupe: false };
    };
    var getSubtype = function (selection, declaration, generateSubTypeInterfaceName) {
        return subTypeStuff(generateSubTypeInterfaceName(selection.name.value, selection), declaration);
    };
    return getSubtype;
};
