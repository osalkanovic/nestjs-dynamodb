"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDynamoDBProvider = void 0;
const util_1 = require("../util");
const dynamodb_constants_1 = require("./dynamodb.constants");
function createDynamoDBProvider(models) {
    const buildProvider = ({ name }, modelFactory) => ({
        provide: util_1.getModelToken(name),
        useFactory: modelFactory,
        inject: [dynamodb_constants_1.DYNAMO_DB_CLIENT, dynamodb_constants_1.DYNAMO_DB_DATA_MAPPER],
    });
    return models.reduce((providers, dynamoDBClassWithOptions) => {
        const modelFactory = (dynamoDBClient, mapper) => util_1.getModelForClass(dynamoDBClassWithOptions.dynamoDBClass, dynamoDBClassWithOptions.tableOptions, dynamoDBClient, mapper);
        const modelProvider = buildProvider(dynamoDBClassWithOptions.dynamoDBClass, modelFactory);
        return [...providers, modelProvider];
    }, []);
}
exports.createDynamoDBProvider = createDynamoDBProvider;
