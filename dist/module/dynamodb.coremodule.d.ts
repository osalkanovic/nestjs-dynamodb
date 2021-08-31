import { DynamicModule } from '@nestjs/common';
import { DynamoDBModuleAsyncOptions, DynamoDBModuleOptions } from './dynamodb.interfaces';
import { DynamoDB } from 'aws-sdk';
import { DataMapper } from '@aws/dynamodb-data-mapper';
export declare class DynamoDBCoreModule {
    private readonly dynamoDBClient;
    private readonly dynamoDBDataMapper;
    constructor(dynamoDBClient: DynamoDB, dynamoDBDataMapper: DataMapper);
    static forRoot(options: DynamoDBModuleOptions): DynamicModule;
    static forRootAsync(options: DynamoDBModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
}
