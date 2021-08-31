import { FactoryProvider } from '@nestjs/common/interfaces';
import { DynamoDBClassWithOptions } from './dynamodb.interfaces';
export declare function createDynamoDBProvider(models: DynamoDBClassWithOptions[]): FactoryProvider[];
