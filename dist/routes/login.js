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
const crypto = require("crypto");
const HttpStatus = require("http-status-codes");
const user_1 = require("../models/user");
const user_service_point_1 = require("../models/user_service_point");
const userServicePointModel = new user_service_point_1.UserServicePointsModel();
const userModel = new user_1.UserModel();
const router = (fastify, {}, next) => {
    var db = fastify.db;
    fastify.post('/', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const body = req.body;
        const username = body.username;
        const password = body.password;
        const encPassword = crypto.createHash('md5').update(password).digest('hex');
        try {
            const rs = yield userModel.login(db, username, encPassword);
            if (!rs.length) {
                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, message: 'ชื่อผู้ใช้งานหรือรหัสผ่าน ไม่ถูกต้อง' });
            }
            else {
                const info = rs[0];
                const rsPoints = yield userServicePointModel.list(db, info.user_id);
                const token = fastify.jwt.sign({
                    fullname: info.fullname,
                    userId: info.user_id,
                    userType: info.user_type,
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
                }, { expiresIn: '1d' });
                reply.status(HttpStatus.OK).send({
                    statusCode: HttpStatus.OK, token: token,
                    servicePoints: rsPoints
                });
            }
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    next();
};
module.exports = router;
//# sourceMappingURL=login.js.map