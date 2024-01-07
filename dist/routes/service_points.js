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
const random_js_1 = require("random-js");
const service_point_1 = require("../models/service_point");
const servicePointModel = new service_point_1.ServicePointModel();
const router = (fastify, {}, next) => {
    var db = fastify.db;
    fastify.get('/', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rs = yield servicePointModel.list(db);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/kios', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rs = yield servicePointModel.listKios(db);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointName = req.body.servicePointName;
        const localCode = req.body.localCode;
        const servicePointAbbr = req.body.servicePointAbbr;
        const departmentId = req.body.departmentId;
        const prefix = req.body.prefix;
        const kios = req.body.kios;
        const useOldQueue = req.body.useOldQueue || 'N';
        const groupCompare = req.body.groupCompare || 'N';
        const priorityQueueRunning = req.body.priorityQueueRunning || 'N';
        const rnd = new random_js_1.Random();
        const strRnd = rnd.integer(1111111111, 9999999999);
        const data = {
            service_point_name: servicePointName,
            local_code: localCode,
            service_point_abbr: servicePointAbbr,
            department_id: departmentId,
            prefix: prefix,
            topic: strRnd,
            kios: kios,
            use_old_queue: useOldQueue,
            group_compare: groupCompare,
            priority_queue_running: priorityQueueRunning
        };
        try {
            yield servicePointModel.save(db, data);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.put('/:servicePointId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        const servicePointName = req.body.servicePointName;
        const localCode = req.body.localCode;
        const servicePointAbbr = req.body.servicePointAbbr;
        const departmentId = req.body.departmentId;
        const prefix = req.body.prefix;
        const kios = req.body.kios;
        const useOldQueue = req.body.useOldQueue || 'N';
        const groupCompare = req.body.groupCompare || 'N';
        const priorityQueueRunning = req.body.priorityQueueRunning || 'N';
        const rnd = new random_js_1.Random();
        const strRnd = rnd.integer(1111111111, 9999999999);
        const data = {
            service_point_name: servicePointName,
            local_code: localCode,
            service_point_abbr: servicePointAbbr,
            department_id: departmentId,
            prefix: prefix,
            topic: strRnd,
            kios: kios,
            use_old_queue: useOldQueue,
            group_compare: groupCompare,
            priority_queue_running: priorityQueueRunning
        };
        try {
            yield servicePointModel.update(db, servicePointId, data);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.delete('/:servicePointId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        try {
            yield servicePointModel.remove(db, servicePointId);
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
//# sourceMappingURL=service_points.js.map