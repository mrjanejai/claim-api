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
const moment = require("moment");
const HttpStatus = require("http-status-codes");
const queue_1 = require("../models/queue");
var QRCode = require('qrcode');
const queueModel = new queue_1.QueueModel();
const router = (fastify, {}, next) => {
    var db = fastify.db;
    fastify.get('/queue', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.query.queueId;
        if (queueId) {
            try {
                const rs = yield queueModel.getPrintInfo(db, queueId);
                if (rs[0].length) {
                    const info = rs[0][0];
                    const hosname = info.hosname;
                    const hosid = info.hosid;
                    const queueNumber = info.queue_number;
                    const queueInterview = info.queue_interview;
                    const queueWithoutPrefix = +info.queue_running;
                    const servicePointName = info.service_point_name;
                    const remainQueue = info.remain_queue || 0;
                    const hn = info.hn;
                    const vn = info.vn;
                    const priorityName = info.priority_name;
                    const dateServ = moment(info.date_serv).format('YYYYMMDD');
                    const timeServ = moment(info.time_serv, 'HH:mm:ss').format('HHmm');
                    const dateCreated = moment(info.date_create).locale('th').format('DD/MM/YYYY HH:mm');
                    const localCode = info.local_code;
                    const qrcode = yield QRCode.toDataURL(`${hosid}#${process.env.Q4U_NOTIFY_TOKEN}#${hn}#${localCode}#${queueNumber}#${queueWithoutPrefix}#${dateServ}#${timeServ}#${servicePointName}#${priorityName}`);
                    reply.view('queue-qrcode.ejs', {
                        qrcode: qrcode,
                        hosname: hosname,
                        queueNumber: queueNumber,
                        hn: hn,
                        vn: vn,
                        dateCreated: dateCreated,
                        servicePointName: servicePointName,
                        remainQueue: remainQueue,
                        priorityName: priorityName,
                        queueId: queueId,
                        queueInterview: queueInterview
                    });
                }
                else {
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.BAD_REQUEST, message: 'ไม่พบรหัสคิวที่ต้องการ' });
                }
            }
            catch (error) {
                reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
            }
        }
        else {
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.BAD_REQUEST, message: 'ไม่พบรหัสคิวที่ต้องการ' });
        }
    }));
    fastify.post('/queue/prepare/print', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.body.queueId;
        const topic = req.body.topic;
        const printSmallQueue = req.body.printSmallQueue || 'N';
        if (queueId && topic) {
            try {
                const rs = yield queueModel.getPrintInfo(db, queueId);
                if (rs[0].length) {
                    const info = rs[0][0];
                    const hosname = info.hosname;
                    const hosid = info.hosid;
                    const queueNumber = info.queue_number;
                    const queueWithoutPrefix = +info.queue_running;
                    const servicePointName = info.service_point_name;
                    const remainQueue = info.remain_queue || 0;
                    const hn = info.hn;
                    const vn = info.vn;
                    const firstName = info.first_name;
                    const lastName = info.last_name;
                    const queueInterview = info.queue_interview;
                    const priorityName = info.priority_name;
                    const dateServ = moment(info.date_serv).format('YYYYMMDD');
                    const timeServ = moment(info.time_serv, "HH:mm:ss").format('HHmm');
                    const dateCreated = moment(info.date_create).locale('th').format('DD/MM/YYYY HH:mm');
                    const localCode = info.local_code;
                    const qrcode = `${hosid}#${process.env.Q4U_NOTIFY_TOKEN}#${hn}#${localCode}#${queueNumber}#${queueWithoutPrefix}#${dateServ}#${timeServ}#${servicePointName}#${priorityName}`;
                    var data = {
                        "printSmallQueue": printSmallQueue,
                        "hn": hn,
                        "firstName": firstName,
                        "lastName": lastName,
                        "qrcode": qrcode,
                        "hosname": hosname,
                        "queueNumber": queueNumber,
                        "servicePointName": servicePointName,
                        "remainQueue": remainQueue,
                        "priorityName": priorityName,
                        "queueInterview": queueInterview
                    };
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
                    fastify.mqttClient.publish(topic, JSON.stringify(data), { qos: 0, retain: false });
                }
                else {
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.BAD_REQUEST, message: 'ไม่พบรหัสคิวที่ต้องการ' });
                }
            }
            catch (error) {
                reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
            }
        }
        else {
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.BAD_REQUEST, message: 'ไม่พบรหัสคิวที่ต้องการ' });
        }
    }));
    fastify.get('/qrcode', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        reply.send('ok');
    }));
    next();
};
module.exports = router;
//# sourceMappingURL=print.js.map