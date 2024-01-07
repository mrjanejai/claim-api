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
const crypto = require("crypto");
const user_1 = require("../models/user");
const user_service_point_1 = require("../models/user_service_point");
const userModel = new user_1.UserModel();
const userServicePointModel = new user_service_point_1.UserServicePointsModel();
const router = (fastify, {}, next) => {
    var db = fastify.db;
    fastify.get('/', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rs = yield userModel.list(db);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const username = req.body.username;
        const password = req.body.password;
        const encPassword = crypto.createHash('md5').update(password).digest('hex');
        const fullname = req.body.fullname;
        const isActive = req.body.isActive;
        const userType = req.body.userType;
        const data = {
            username: username,
            password: encPassword,
            fullname: fullname,
            is_active: isActive,
            user_type: userType,
        };
        try {
            yield userModel.save(db, data);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.put('/:userId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.params.userId;
        const fullname = req.body.fullname;
        const isActive = req.body.isActive;
        const password = req.body.password;
        const userType = req.body.userType;
        const info = {
            fullname: fullname,
            is_active: isActive,
            user_type: userType
        };
        if (password) {
            var encPass = crypto.createHash('md5').update(password).digest('hex');
            info.password = encPass;
        }
        try {
            yield userModel.update(db, userId, info);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.put('/changepass/:userId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.params.userId;
        const password = req.body.password;
        const encPassword = crypto.createHash('md5').update(password).digest('hex');
        const info = {
            password: encPassword
        };
        try {
            yield userModel.update(db, userId, info);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.delete('/:userId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.params.userId;
        try {
            yield userModel.remove(db, userId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.put('/service-points/:userId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.params.userId;
        const items = req.body.items;
        var data = [];
        items.forEach((v) => {
            var obj = {};
            obj.user_id = userId;
            obj.service_point_id = v;
            data.push(obj);
        });
        try {
            yield userServicePointModel.remove(db, userId);
            yield userServicePointModel.save(db, data);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/service-points/list/:userId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.params.userId;
        try {
            const rs = yield userServicePointModel.list(db, userId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    next();
};
module.exports = router;
//# sourceMappingURL=users.js.map