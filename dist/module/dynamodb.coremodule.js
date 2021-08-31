"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DynamoDBCoreModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBCoreModule = void 0;
const common_1 = require("@nestjs/common");
const aws_sdk_1 = require("aws-sdk");
const dynamodb_data_mapper_1 = require("@aws/dynamodb-data-mapper");
const dynamodb_constants_1 = require("./dynamodb.constants");
const dynamodb_config_1 = require("./dynamodb.config");
let DynamoDBCoreModule = DynamoDBCoreModule_1 = class DynamoDBCoreModule {
    constructor(dynamoDBClient, dynamoDBDataMapper) {
        this.dynamoDBClient = dynamoDBClient;
        this.dynamoDBDataMapper = dynamoDBDataMapper;
    }
    static forRoot(options) {
        const dynamodbClient = dynamodb_config_1.createDynamodbClient(options);
        const mapper = dynamodb_config_1.createMapper(dynamodbClient);
        const clientProvider = {
            provide: dynamodb_constants_1.DYNAMO_DB_CLIENT,
            useValue: dynamodbClient
        };
        const dataMapperProvider = {
            provide: dynamodb_constants_1.DYNAMO_DB_DATA_MAPPER,
            useValue: mapper
        };
        return {
            module: DynamoDBCoreModule_1,
            providers: [dataMapperProvider, clientProvider],
            exports: [dataMapperProvider, clientProvider]
        };
    }
    static forRootAsync(options) {
        const clientProvider = {
            provide: dynamodb_constants_1.DYNAMO_DB_CLIENT,
            useFactory: (dynamoDBModuleOptions) => dynamodb_config_1.createDynamodbClient(dynamoDBModuleOptions),
            inject: [dynamodb_constants_1.DYNAMO_DB_MODULE_OPTIONS]
        };
        const dataMapperProvider = {
            provide: dynamodb_constants_1.DYNAMO_DB_DATA_MAPPER,
            useFactory: (dynamoDB) => dynamodb_config_1.createMapper(dynamoDB),
            inject: [dynamodb_constants_1.DYNAMO_DB_CLIENT]
        };
        const asyncProviders = this.createAsyncProviders(options);
        return {
            module: DynamoDBCoreModule_1,
            imports: options.imports,
            providers: [...asyncProviders, dataMapperProvider, clientProvider],
            exports: [dataMapperProvider, clientProvider]
        };
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory)
            return [this.createAsyncOptionsProvider(options)];
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass
            }
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory)
            return {
                provide: dynamodb_constants_1.DYNAMO_DB_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || []
            };
        return { provide: dynamodb_constants_1.DYNAMO_DB_MODULE_OPTIONS, useFactory: () => { }, inject: [] };
    }
};
DynamoDBCoreModule = DynamoDBCoreModule_1 = __decorate([
    common_1.Global(),
    common_1.Module({}),
    __param(0, common_1.Inject(dynamodb_constants_1.DYNAMO_DB_CLIENT)),
    __param(1, common_1.Inject(dynamodb_constants_1.DYNAMO_DB_DATA_MAPPER)),
    __metadata("design:paramtypes", [aws_sdk_1.DynamoDB,
        dynamodb_data_mapper_1.DataMapper])
], DynamoDBCoreModule);
exports.DynamoDBCoreModule = DynamoDBCoreModule;
