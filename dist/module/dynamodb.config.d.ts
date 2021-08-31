import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDBModuleOptions } from './dynamodb.interfaces';
export declare const createDynamodbClient: (options: DynamoDBModuleOptions) => DynamoDB;
export declare const createMapper: (dynamoDBClient: DynamoDB) => DataMapper;
