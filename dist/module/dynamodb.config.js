"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMapper = exports.createDynamodbClient = void 0;
const DynamoDB = require("aws-sdk/clients/dynamodb");
const AWS = require("aws-sdk");
const dynamodb_data_mapper_1 = require("@aws/dynamodb-data-mapper");
exports.createDynamodbClient = (options) => {
    AWS.config.update(options.AWSConfig);
    return new DynamoDB(options.dynamoDBOptions);
};
exports.createMapper = (dynamoDBClient) => new dynamodb_data_mapper_1.DataMapper({
    client: dynamoDBClient
});
