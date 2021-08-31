"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DynamoDBModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBModule = void 0;
const common_1 = require("@nestjs/common");
const convertToClassWithOptions_1 = require("../util/convertToClassWithOptions");
const dynamodb_coremodule_1 = require("./dynamodb.coremodule");
const dynamodb_providers_1 = require("./dynamodb.providers");
let DynamoDBModule = DynamoDBModule_1 = class DynamoDBModule {
    static forRoot(options) {
        return {
            module: DynamoDBModule_1,
            imports: [dynamodb_coremodule_1.DynamoDBCoreModule.forRoot(options)],
        };
    }
    static forRootAsync(options) {
        return {
            module: DynamoDBModule_1,
            imports: [dynamodb_coremodule_1.DynamoDBCoreModule.forRootAsync(options)],
        };
    }
    static forFeature(models) {
        const convertedModels = models.map(model => convertToClassWithOptions_1.convertToClassWithOptions(model));
        const providers = dynamodb_providers_1.createDynamoDBProvider(convertedModels);
        return {
            module: DynamoDBModule_1,
            providers,
            exports: providers,
        };
    }
};
DynamoDBModule = DynamoDBModule_1 = __decorate([
    common_1.Module({})
], DynamoDBModule);
exports.DynamoDBModule = DynamoDBModule;
