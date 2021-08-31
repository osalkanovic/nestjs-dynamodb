import { DynamicModule } from '@nestjs/common';
import { DynamoDBModuleAsyncOptions, DynamoDBModuleOptions, DynamoDBInput } from './dynamodb.interfaces';
export declare class DynamoDBModule {
    static forRoot(options: DynamoDBModuleOptions): DynamicModule;
    static forRootAsync(options: DynamoDBModuleAsyncOptions): DynamicModule;
    static forFeature(models: DynamoDBInput[]): DynamicModule;
}
