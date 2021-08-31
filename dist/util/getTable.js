"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTable = void 0;
const dynamodb_data_mapper_1 = require("@aws/dynamodb-data-mapper");
exports.getTable = (dynamoDBClass) => dynamoDBClass.prototype[dynamodb_data_mapper_1.DynamoDbTable];
