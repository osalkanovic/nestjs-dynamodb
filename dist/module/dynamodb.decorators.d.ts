import { DynamoDBClass } from './dynamodb.interfaces';
export declare const InjectModel: (model: DynamoDBClass) => (target: object, key: string | symbol, index?: number) => void;
export declare const ReturnModel: <T>(v?: any) => import("../util").GetModelForClass<T>;
