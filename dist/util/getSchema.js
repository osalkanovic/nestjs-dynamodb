"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchema = void 0;
const DynamoDbSchema = Symbol.for('DynamoDbSchema');
function getSchema(item) {
    if (item) {
        const schema = item[DynamoDbSchema];
        if (schema && typeof schema === 'object') {
            return schema;
        }
    }
    throw new Error('The provided item did not adhere to the DynamoDbDocument protocol.' +
        ' No object property was found at the `DynamoDbSchema` symbol');
}
exports.getSchema = getSchema;
