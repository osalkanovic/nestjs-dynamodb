"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToClassWithOptions = void 0;
const is_class_1 = require("is-class");
const isDynamoDBClass = (item) => is_class_1.isClass(item);
const isDynamoDBClassWithOptions = (item) => isDynamoDBClass(item.dynamoDBClass);
exports.convertToClassWithOptions = (item) => {
    if (isDynamoDBClass(item)) {
        return {
            dynamoDBClass: item,
            tableOptions: {
                readCapacityUnits: 5,
                writeCapacityUnits: 5,
            },
        };
    }
    else if (isDynamoDBClassWithOptions(item)) {
        return item;
    }
    return invalidObject('model');
};
function invalidObject(type) {
    throw new Error(`Invalid ${type} object`);
}
