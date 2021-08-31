"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Like = exports.gratherThanOrEqual = exports.gratherThan = exports.OR = void 0;
function OR(value) {
    return `OR ${value}`;
}
exports.OR = OR;
function gratherThan(value) {
    return ` > ${value}`;
}
exports.gratherThan = gratherThan;
function gratherThanOrEqual(value) {
    return ` >= ${value}`;
}
exports.gratherThanOrEqual = gratherThanOrEqual;
function Like(value) {
    return `LIKE ${value}`;
}
exports.Like = Like;
