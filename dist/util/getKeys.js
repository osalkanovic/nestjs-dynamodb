"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeys = void 0;
exports.getKeys = (schema) => {
    let hash = '';
    let range = '';
    for (const prop in schema) {
        if (schema[prop].keyType === 'HASH')
            hash = prop;
        if (schema[prop].keyType === 'RANGE')
            range = prop;
        if (hash && range)
            return { range, hash };
    }
    return { range, hash };
};
