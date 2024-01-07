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
const priority_1 = require("../models/priority");
const priorityModel = new priority_1.PriorityModel();
const router = (fastify, {}, next) => {
    var db = fastify.db;
    fastify.get('/', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rs = yield priorityModel.list(db);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const priorityName = req.body.priorityName;
        const priorityPrefix = req.body.priorityPrefix;
        const priorityOrder = req.body.priorityOrder;
        const data = {
            priority_name: priorityName,
            priority_prefix: priorityPrefix,
            priority_order: priorityOrder
        };
        try {
            yield priorityModel.save(db, data);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.put('/:priorityId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const priorityId = req.params.priorityId;
        const priorityName = req.body.priorityName;
        const priorityPrefix = req.body.priorityPrefix;
        const priorityOrder = req.body.priorityOrder;
        const data = {
            priority_name: priorityName,
            priority_prefix: priorityPrefix,
            priority_order: priorityOrder
        };
        try {
            yield priorityModel.update(db, priorityId, data);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.delete('/:priorityId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const priorityId = req.params.priorityId;
        try {
            yield priorityModel.remove(db, priorityId);
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
//# sourceMappingURL=priorities.js.map