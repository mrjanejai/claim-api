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
const sound_1 = require("../models/sound");
const soundModel = new sound_1.SoundModel();
const router = (fastify, {}, next) => {
    var db = fastify.db;
    fastify.get('/', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rs = yield soundModel.list(db);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.put('/service-point/:servicePointId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        const soundId = req.body.soundId;
        const speed = req.body.speed;
        const data = {
            sound_id: soundId,
            sound_speed: speed
        };
        try {
            yield soundModel.updatePoint(db, servicePointId, data);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.put('/service-room/:roomId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const roomId = req.params.roomId;
        const soundId = req.body.soundId;
        const data = {
            sound_id: soundId
        };
        try {
            yield soundModel.updateRoom(db, roomId, data);
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
//# sourceMappingURL=sounds.js.map