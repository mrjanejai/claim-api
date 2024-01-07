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
const service_room_1 = require("../models/service_room");
const roomModel = new service_room_1.ServiceRoomModel();
const router = (fastify, {}, next) => {
    var db = fastify.db;
    fastify.get('/:servicePointId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const servicePointId = req.params.servicePointId;
            const rs = yield roomModel.list(db, servicePointId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const roomName = req.body.roomName;
        const roomNumber = req.body.roomNumber;
        const servicePointId = req.body.servicePointId;
        const data = {
            room_number: roomNumber,
            room_name: roomName,
            service_point_id: servicePointId,
        };
        try {
            yield roomModel.save(db, data);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.put('/:roomId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const roomId = req.params.roomId;
        const roomName = req.body.roomName;
        const roomNumber = req.body.roomNumber;
        const servicePointId = req.body.servicePointId;
        const data = {
            room_number: roomNumber,
            room_name: roomName,
            service_point_id: servicePointId,
        };
        try {
            yield roomModel.update(db, roomId, data);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.delete('/:roomId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const roomId = req.params.roomId;
        try {
            yield roomModel.remove(db, roomId);
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
//# sourceMappingURL=service_rooms.js.map