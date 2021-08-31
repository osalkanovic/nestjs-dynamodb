"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionToken = exports.getModelToken = void 0;
exports.getModelToken = (name) => `__${name}DynamoDBModel__`;
exports.getConnectionToken = (name) => `__${name}DynamoDBModel__`;
