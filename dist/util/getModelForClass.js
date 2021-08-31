"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModelForClass = exports.GetModelForClass = void 0;
const dynamodb_data_mapper_1 = require("@aws/dynamodb-data-mapper");
const getKeys_1 = require("./getKeys");
const dynamodb_data_marshaller_1 = require("@aws/dynamodb-data-marshaller");
const getTable_1 = require("./getTable");
class GetModelForClass {
    constructor(dynamoDBClass, tableOptions, dynamoDBClient, mapper) {
        this.dynamoDBClass = dynamoDBClass;
        this.table = getTable_1.getTable(dynamoDBClass);
        this.dynamoDBClient = dynamoDBClient;
        this.mapper = mapper;
        this.schema = dynamodb_data_mapper_1.getSchema(new dynamoDBClass());
        const { hash, range } = getKeys_1.getKeys(this.schema);
        this.hashKey = hash;
        this.rangeKey = range;
        mapper.ensureTableExists(dynamoDBClass, tableOptions);
    }
    getDynamoDBClient() {
        return this.dynamoDBClient;
    }
    getSchema() {
        return this.schema;
    }
    getTable() {
        return this.table;
    }
    getValueType(value) {
        if (Array.isArray(value)) {
            const arrayValue = value[0];
            if (typeof arrayValue === 'number') {
                return 'NS';
            }
            else {
                return 'SS';
            }
        }
        else if (typeof value === 'string') {
            return 'S';
        }
        else if (typeof value === 'number') {
            return 'N';
        }
        else if (typeof value === 'boolean') {
            return 'BOOL';
        }
        return '';
    }
    create(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const toSave = Object.assign(new this.dynamoDBClass(), input);
            return this.mapper.put(toSave);
        });
    }
    find(input, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let results = [];
            const keys = Object.keys(input);
            let parseObject = () => {
                let obj = {
                    TableName: this.table,
                    FilterExpression: '',
                    IndexName: `${this.table.charAt(0).toUpperCase() + this.table.slice(1)}Index`,
                };
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    if (Array.isArray(input[key])) {
                        for (let j = 0; j < input[key].length; j++) {
                            obj = Object.assign(Object.assign({}, obj), { ExpressionAttributeValues: Object.assign(Object.assign({}, obj.ExpressionAttributeValues), { [`:${key}Value${j}`]: {
                                        [this.getValueType(this.clearValue(input[key][j]))]: input[key][j],
                                    } }) });
                        }
                        obj = Object.assign(Object.assign({}, obj), { FilterExpression: `${obj.FilterExpression} ${this.checkCondition(input[key])} ${this.generateValue(input[key], key)}` });
                    }
                    else if (this.schema[key].type === 'Collection') {
                        obj = Object.assign(Object.assign({}, obj), { ExpressionAttributeValues: Object.assign(Object.assign({}, obj.ExpressionAttributeValues), { [`:${key}Value`]: {
                                    [this.getValueType(input[key])]: this.clearValue(input[key]),
                                } }), FilterExpression: `${obj.FilterExpression} ${this.checkCondition(input[key])} contains(${key}, :${key}Value)` });
                    }
                    else {
                        obj = Object.assign(Object.assign(Object.assign({}, obj), (this.schema[key].indexKeyConfigurations &&
                            this.schema[key].indexKeyConfigurations[`${this.table.charAt(0).toUpperCase() + this.table.slice(1)}Index`] === 'HASH'
                            ? {
                                KeyConditionExpression: 'category = :categoryValue',
                                ScanIndexForward: false,
                            }
                            : {
                                FilterExpression: `${obj.FilterExpression} ${this.checkCondition(input[key])} ${this.generateCondition(key, input[key])}`,
                            })), { ExpressionAttributeValues: Object.assign(Object.assign({}, obj.ExpressionAttributeValues), { [`:${key}Value`]: {
                                    [this.getValueType(input[key])]: this.clearValue(input[key]),
                                } }) });
                    }
                }
                obj.FilterExpression = obj.FilterExpression.split(' ').splice(2).join(' ');
                if (options === null || options === void 0 ? void 0 : options.limit) {
                    obj = Object.assign(Object.assign({}, obj), { Limit: options === null || options === void 0 ? void 0 : options.limit });
                }
                if (options === null || options === void 0 ? void 0 : options.pageSize) {
                    obj = Object.assign(Object.assign({}, obj), { PageSize: options === null || options === void 0 ? void 0 : options.pageSize });
                }
                if (options === null || options === void 0 ? void 0 : options.lastEvaluatedKey) {
                    obj = Object.assign(Object.assign({}, obj), { LastEvaluatedKey: options === null || options === void 0 ? void 0 : options.lastEvaluatedKey });
                }
                return obj;
            };
            const parsedObj = parseObject();
            for (const key in parsedObj) {
                if ((typeof parsedObj[key] === 'string' ||
                    parsedObj[key] instanceof String) &&
                    parsedObj[key].trim() === '') {
                    parsedObj[key] = undefined;
                }
            }
            const items = yield new Promise((resolve, reject) => {
                if ('KeyConditionExpression' in parsedObj) {
                    return this.dynamoDBClient.query(parsedObj, (err, data) => {
                        if (err)
                            reject(err);
                        resolve(data === null || data === void 0 ? void 0 : data.Items);
                    });
                }
                else {
                    return this.dynamoDBClient.scan(parsedObj, (err, data) => {
                        if (err)
                            reject(err);
                        resolve(data.Items);
                    });
                }
            });
            return items.map(item => dynamodb_data_marshaller_1.unmarshallItem(this.schema, item));
        });
    }
    generateCondition(key, value) {
        if (value.indexOf('LIKE') > -1) {
            return `contains(${key}, :${key}Value)`;
        }
        else {
            return `${key} = :${key}Value`;
        }
    }
    clearValue(value) {
        return value.replace(/AND /g, '').replace(/OR /g, '').replace(/LIKE /g, '');
    }
    generateValue(value, attr) {
        if (Array.isArray(value)) {
            if (this.schema[attr].type === 'Collection') {
                let temp = '(';
                for (let i = 0; i < value.length; i++) {
                    if (i === 0) {
                        temp += `contains(${attr}, :${attr}Value${i})`;
                    }
                    else {
                        temp += ` OR contains(${attr}, :${attr}Value${i})`;
                    }
                }
                temp += ')';
                return temp;
            }
            else {
                let temp = '(';
                for (let i = 0; i < value.length; i++) {
                    if (i === 0) {
                        temp += `${attr} = :${attr}Value${i}`;
                    }
                    else {
                        temp += ` OR ${attr} = :${attr}Value${i}`;
                    }
                }
                temp += ')';
                return temp;
            }
        }
        return value;
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const test = new this.dynamoDBClass();
            test.id = id;
            return this.mapper.get(test);
        });
    }
    checkCondition(value) {
        if (Array.isArray(value)) {
            return 'AND';
        }
        if (value.startsWith('OR')) {
            return 'OR';
        }
        return 'AND';
    }
    findByIdAndDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => this.dynamoDBClient.deleteItem(this.getDeleteItemInput(id), (err, data) => {
                if (err)
                    reject(err);
                resolve(data);
            }));
        });
    }
    findByIdAndUpdate(id, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.mapper.get(Object.assign(new this.dynamoDBClass(), { id }));
            return this.mapper.update(Object.assign(item, update));
        });
    }
    getDeleteItemInput(id) {
        return {
            Key: {
                id: {
                    S: id,
                },
            },
            TableName: this.table,
        };
    }
    getFindItemInput(key, value) {
        return {
            ExpressionAttributeValues: {
                ':catval': {
                    S: value,
                },
            },
            FilterExpression: `${key} = :catval`,
            TableName: this.table,
        };
    }
}
exports.GetModelForClass = GetModelForClass;
exports.getModelForClass = (dynamoDBClass, tableOptions, dynamoDBClient, mapper) => new GetModelForClass(dynamoDBClass, tableOptions, dynamoDBClient, mapper);
