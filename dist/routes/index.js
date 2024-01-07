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
const system_1 = require("../models/system");
const HttpStatus = require("http-status-codes");
const systemModel = new system_1.SystemModel();
const router = (fastify, {}, next) => {
    var db = fastify.db;
    fastify.get('/info', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rs = yield systemModel.getInfo(db);
            reply.code(HttpStatus.OK).send({ info: rs[0] });
        }
        catch (error) {
            console.log(error);
            reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    next();
};
module.exports = router;
//# sourceMappingURL=index.js.map