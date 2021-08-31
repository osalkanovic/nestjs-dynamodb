"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnModel = exports.InjectModel = void 0;
const common_1 = require("@nestjs/common");
const util_1 = require("../util");
exports.InjectModel = (model) => common_1.Inject(util_1.getModelToken(model.name));
exports.ReturnModel = (v) => false && util_1.getModelForClass(v, v, v, v);
