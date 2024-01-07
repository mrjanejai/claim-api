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
const HttpStatus = require("http-status-codes");
const token_1 = require("../models/token");
const moment = require("moment");
const tokenModel = new token_1.TokenModel();
const router = (fastify, {}, next) => {
    var db = fastify.db;
    fastify.get('/', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rs = yield tokenModel.list(db);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const expiredDate = moment().add(99, 'year').format('YYYY-MM-DD HH:mm:ss');
        const token = fastify.jwt.sign({
            issue: 'h4u',
            description: 'for access Q4U api',
            GLOBAL_NOTIFY_TOPIC: process.env.GLOBAL_NOTIFY_TOPIC,
            QUEUE_CENTER_TOPIC: process.env.QUEUE_CENTER_TOPIC,
            SERVICE_POINT_TOPIC: process.env.SERVICE_POINT_TOPIC,
            DEPARTMENT_TOPIC: process.env.DEPARTMENT_TOPIC,
            GROUP_TOPIC: process.env.GROUP_TOPIC,
            NOTIFY_USER: process.env.LOCAL_NOTIFY_USER,
            NOTIFY_PASSWORD: process.env.LOCAL_NOTIFY_PASSWORD,
            NOTIFY_SERVER: process.env.LOCAL_NOTIFY_SERVER,
            NOTIFY_PORT: process.env.LOCAL_NOTIFY_HTTP_PORT,
            SPEAK_SINGLE: process.env.SPEAK_SINGLE || 'N'
        }, { expiresIn: '99y' });
        const data = {
            token: token,
            created_date: createdDate,
            expired_date: expiredDate
        };
        try {
            yield tokenModel.save(db, data);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.delete('/', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.query.token;
        try {
            yield tokenModel.remove(db, token);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    next();
};
module.exports = router;
//# sourceMappingURL=token.js.map