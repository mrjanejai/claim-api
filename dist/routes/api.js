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
const request = require('request');
const queue_1 = require("../models/queue");
const token_1 = require("../models/token");
const service_point_1 = require("../models/service_point");
const priority_1 = require("../models/priority");
const queueModel = new queue_1.QueueModel();
const servicePointModel = new service_point_1.ServicePointModel();
const priorityModel = new priority_1.PriorityModel();
const tokenModel = new token_1.TokenModel();
const router = (fastify, {}, next) => {
    var db = fastify.db;
    var padStart = function padStart(str, targetLength, padString = '0') {
        targetLength = targetLength >> 0;
        if (str.length >= targetLength) {
            return str;
        }
        else {
            targetLength = targetLength - str.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length);
            }
            return padString.slice(0, targetLength) + str;
        }
    };
    fastify.post('/register', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.body.token;
        const hn = req.body.hn;
        const vn = req.body.vn;
        const localCode = req.body.clinicCode;
        const priorityId = req.body.priorityId;
        const dateServ = moment().format('YYYY-MM-DD');
        const timeServ = req.body.timeServ;
        const hisQueue = req.body.hisQueue;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const title = req.body.title;
        const birthDate = req.body.birthDate;
        const sex = req.body.sex;
        if (token) {
            if (hn && vn && localCode && dateServ && timeServ && firstName && lastName && birthDate) {
                try {
                    const decoded = fastify.jwt.verify(token);
                    const rsToken = yield tokenModel.find(db, token);
                    if (rsToken.length) {
                        const rsLocalCode = yield servicePointModel.getServicePointIdFromLocalCode(db, localCode);
                        const servicePointId = rsLocalCode[0].service_point_id;
                        if (servicePointId) {
                            const rsPriorityPrefix = yield priorityModel.getPrefix(db, priorityId);
                            const prefixPriority = rsPriorityPrefix[0].priority_prefix || 'T';
                            const rsPointPrefix = yield servicePointModel.getPrefix(db, servicePointId);
                            const prefixPoint = rsPointPrefix[0].prefix || 'T';
                            const usePriorityQueueRunning = rsPointPrefix[0].priority_queue_running || 'N';
                            yield queueModel.savePatient(db, hn, title, firstName, lastName, birthDate, sex);
                            var queueNumber = 0;
                            var queueInterview = 0;
                            var rs2 = yield queueModel.checkServicePointQueueNumber(db, 999, dateServ);
                            var rs1;
                            if (usePriorityQueueRunning === 'Y') {
                                rs1 = yield queueModel.checkServicePointQueueNumber(db, servicePointId, dateServ, priorityId);
                            }
                            else {
                                rs1 = yield queueModel.checkServicePointQueueNumber(db, servicePointId, dateServ);
                            }
                            if (rs1.length) {
                                queueNumber = rs1[0]['current_queue'] + 1;
                                usePriorityQueueRunning === 'Y'
                                    ? yield queueModel.updateServicePointQueueNumber(db, servicePointId, dateServ, priorityId)
                                    : yield queueModel.updateServicePointQueueNumber(db, servicePointId, dateServ);
                            }
                            else {
                                queueNumber = 1;
                                usePriorityQueueRunning === 'Y'
                                    ? yield queueModel.createServicePointQueueNumber(db, servicePointId, dateServ, priorityId)
                                    : yield queueModel.createServicePointQueueNumber(db, servicePointId, dateServ);
                            }
                            if (rs2.length) {
                                queueInterview = rs2[0]['current_queue'] + 1;
                                yield queueModel.updateServicePointQueueNumber(db, 999, dateServ);
                            }
                            else {
                                queueInterview = 1;
                                yield queueModel.createServicePointQueueNumber(db, 999, dateServ);
                            }
                            const _queueRunning = queueNumber;
                            const queueDigit = +process.env.QUEUE_DIGIT || 3;
                            var _queueNumber = null;
                            if (process.env.ZERO_PADDING === 'Y') {
                                _queueNumber = padStart(queueNumber.toString(), queueDigit, '0');
                            }
                            else {
                                _queueNumber = queueNumber.toString();
                            }
                            var strQueueNumber = null;
                            if (process.env.USE_PRIORITY_PREFIX === 'Y') {
                                strQueueNumber = `${prefixPoint}${prefixPriority} ${_queueNumber}`;
                            }
                            else {
                                strQueueNumber = usePriorityQueueRunning === 'Y'
                                    ? `${prefixPoint}${prefixPriority} ${_queueNumber}`
                                    : `${prefixPoint} ${_queueNumber}`;
                            }
                            const dateCreate = moment().format('YYYY-MM-DD HH:mm:ss');
                            const qData = {};
                            qData.servicePointId = servicePointId;
                            qData.dateServ = dateServ;
                            qData.timeServ = timeServ;
                            qData.queueNumber = strQueueNumber;
                            qData.hn = hn;
                            qData.vn = vn;
                            qData.priorityId = priorityId;
                            qData.dateCreate = dateCreate;
                            qData.hisQueue = hisQueue;
                            qData.queueRunning = _queueRunning;
                            qData.queueInterview = queueInterview;
                            var rsQueue = yield queueModel.createQueueInfo(db, qData);
                            var queueId = rsQueue[0];
                            const rs = yield queueModel.getPrintInfo(db, queueId);
                            if (rs[0].length) {
                                const info = rs[0][0];
                                const hosname = info.hosname;
                                const hosid = info.hosid;
                                const queueNumber = info.queue_number;
                                const queueWithoutPrefix = +info.queue_running;
                                const servicePointName = info.service_point_name;
                                const hn = info.hn;
                                const vn = info.vn;
                                const priorityName = info.priority_name;
                                const dateServ = moment(info.date_serv).format('YYYYMMDD');
                                const timeServ = moment(info.time_serv, "HH:mm:ss").format('HHmm');
                                const localCode = info.local_code;
                                const qrcode = `${hosid}#${process.env.Q4U_NOTIFY_TOKEN}#${hn}#${localCode}#${queueNumber}#${queueWithoutPrefix}#${dateServ}#${timeServ}#${servicePointName}#${priorityName}`;
                                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, queueId: queueId, hn: hn, vn: vn, queueNumber: queueNumber, qrcode: qrcode });
                                const topic = process.env.QUEUE_CENTER_TOPIC;
                                fastify.mqttClient.publish(topic, 'update visit', { qos: 0, retain: false });
                            }
                            else {
                                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.BAD_REQUEST, message: 'ไม่พบรหัสคิวที่ต้องการ' });
                            }
                        }
                        else {
                            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ไม่พบรหัสแผนกที่ต้องการ' });
                        }
                    }
                    else {
                        reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) });
                    }
                }
                catch (error) {
                    fastify.log.error(error);
                    reply.status(HttpStatus.UNAUTHORIZED).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message });
                }
            }
            else {
                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ข้อมูลไม่ครบ' });
            }
        }
        else {
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ไม่พบ TOKEN' });
        }
    }));
    fastify.post('/call', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn;
        const servicePointId = req.body.servicePointId;
        const roomId = req.body.roomId;
        const token = req.body.token;
        const isInterview = req.body.isInterview || 'N';
        var departmentId = null;
        try {
            if (token) {
                if (hn && servicePointId && roomId) {
                    fastify.jwt.verify(token);
                    const rsToken = yield tokenModel.find(db, token);
                    if (rsToken.length) {
                        var rs = yield queueModel.apiGetCurrentQueueByHN(db, hn, servicePointId);
                        if (rs.length) {
                            var _queue = rs[0];
                            const dateServ = moment().format('YYYY-MM-DD');
                            const queueId = _queue.queue_id;
                            const roomNumber = _queue.room_number;
                            const queueNumber = _queue.queue_number;
                            yield queueModel.setQueueRoomNumber(db, queueId, roomId);
                            yield queueModel.removeCurrentQueue(db, servicePointId, dateServ, queueId);
                            yield queueModel.updateCurrentQueue(db, servicePointId, dateServ, queueId, roomId);
                            yield queueModel.markUnPending(db, queueId);
                            yield queueModel.markCompleted(db, queueId);
                            var _queueIds = [];
                            _queueIds.push(queueId);
                            const rsQueue = yield queueModel.getResponseQueueInfo(db, _queueIds);
                            if (rsQueue.length) {
                                departmentId = rsQueue[0].department_id;
                            }
                            if (process.env.ENABLE_Q4U.toUpperCase() === 'Y') {
                                if (rsQueue.length) {
                                    const data = rsQueue[0];
                                    const queueWithoutPrefix = +data.queue_running;
                                    const params = {
                                        hosid: data.hosid,
                                        servicePointCode: data.service_point_code,
                                        queueNumber: data.queue_number,
                                        queueWithoutPrefix: queueWithoutPrefix,
                                        roomNumber: data.room_number,
                                        token: process.env.Q4U_NOTIFY_TOKEN,
                                        roomName: data.room_name,
                                        dateServ: moment(data.date_serv).format('YYYYMMDD'),
                                    };
                                    request.post(process.env.Q4U_NOTIFY_URL, {
                                        form: params
                                    }, (err, res, body) => {
                                        if (err)
                                            console.log(err);
                                        console.log(body);
                                    });
                                }
                            }
                            const servicePointTopic = process.env.SERVICE_POINT_TOPIC + '/' + servicePointId;
                            const departmentTopic = process.env.DEPARTMENT_TOPIC + '/' + departmentId;
                            const globalTopic = process.env.QUEUE_CENTER_TOPIC;
                            const payload = {
                                queueNumber: queueNumber,
                                roomNumber: roomNumber,
                                servicePointId: servicePointId,
                                departmentId: departmentId,
                                isInterview: isInterview
                            };
                            if (rs.length) {
                                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, queueId: rs[0].queue_id, priorityId: rs[0].priority_id });
                            }
                            else {
                                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
                            }
                            fastify.mqttClient.publish(departmentTopic, JSON.stringify(payload), { qos: 0, retain: false });
                            fastify.mqttClient.publish(globalTopic, 'update visit', { qos: 0, retain: false });
                            fastify.mqttClient.publish(servicePointTopic, JSON.stringify(payload), { qos: 0, retain: false });
                        }
                        else {
                            reply.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .send({
                                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                                message: 'ไม่พบคิวที่ต้องการ'
                            });
                        }
                    }
                    else {
                        reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) });
                    }
                }
                else {
                    reply.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .send({
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'ไม่พบ HN'
                    });
                }
            }
            else {
                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ไม่พบ TOKEN' });
            }
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/queue', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.query.token;
        const hn = req.query.hn;
        if (token) {
            if (hn) {
                const decoded = fastify.jwt.verify(token);
                const rsToken = yield tokenModel.find(db, token);
                if (rsToken.length) {
                    try {
                        const rs = yield queueModel.getCurrentQueue(db, hn);
                        reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, queueNumber: rs[0].queue_number });
                    }
                    catch (error) {
                        fastify.log.error(error);
                        reply.status(HttpStatus.UNAUTHORIZED).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message });
                    }
                }
                else {
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) });
                }
            }
            else {
                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ข้อมูลไม่ครบ' });
            }
        }
        else {
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ไม่พบ TOKEN' });
        }
    }));
    fastify.post('/pending', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.body.queueId;
        const servicePointId = req.body.servicePointId;
        const priorityId = req.body.priorityId;
        const token = req.body.token;
        if (token) {
            if (queueId && servicePointId && priorityId) {
                try {
                    const decoded = fastify.jwt.verify(token);
                    const rsToken = yield tokenModel.find(db, token);
                    if (rsToken.length) {
                        yield queueModel.markPending(db, queueId, servicePointId);
                        const rsInfo = yield queueModel.getDuplicatedQueueInfo(db, queueId);
                        if (rsInfo) {
                            const hn = rsInfo[0].hn;
                            const vn = rsInfo[0].vn;
                            const hisQueue = rsInfo[0].his_queue;
                            const timeServ = rsInfo[0].time_serv;
                            const dateServ = moment(rsInfo[0].date_serv).format('YYYY-MM-DD');
                            const rsPriorityPrefix = yield priorityModel.getPrefix(db, priorityId);
                            const prefixPriority = rsPriorityPrefix[0].priority_prefix || '0';
                            const rsServicePoint = yield servicePointModel.getPrefix(db, servicePointId);
                            const prefixPoint = rsServicePoint[0].prefix || '0';
                            const usePriorityQueueRunning = rsServicePoint[0].priority_queue_running || 'N';
                            const useOldQueue = rsServicePoint[0].use_old_queue || 'N';
                            if (useOldQueue === 'Y') {
                                var queueNumber = 0;
                                var newQueueId = null;
                                var queueInterview = 0;
                                var rs1 = yield queueModel.checkServicePointQueueNumber(db, servicePointId, dateServ);
                                var rs2 = yield queueModel.checkServicePointQueueNumber(db, 999, dateServ);
                                if (rs1.length) {
                                    queueNumber = rs1[0]['current_queue'] + 1;
                                    yield queueModel.updateServicePointQueueNumber(db, servicePointId, dateServ);
                                }
                                else {
                                    queueNumber = 1;
                                    yield queueModel.createServicePointQueueNumber(db, servicePointId, dateServ);
                                }
                                if (rs2.length) {
                                    queueInterview = rs2[0]['current_queue'] + 1;
                                    yield queueModel.updateServicePointQueueNumber(db, 999, dateServ);
                                }
                                else {
                                    queueInterview = 1;
                                    yield queueModel.createServicePointQueueNumber(db, 999, dateServ);
                                }
                                const _queueRunning = queueNumber;
                                const strQueueNumber = rsInfo[0].queue_number;
                                const dateCreate = moment().format('YYYY-MM-DD HH:mm:ss');
                                const qData = {};
                                qData.servicePointId = servicePointId;
                                qData.dateServ = dateServ;
                                qData.timeServ = timeServ;
                                qData.queueNumber = strQueueNumber;
                                qData.hn = hn;
                                qData.vn = vn;
                                qData.priorityId = priorityId;
                                qData.dateCreate = dateCreate;
                                qData.hisQueue = hisQueue;
                                qData.queueRunning = _queueRunning;
                                qData.queueInterview = queueInterview;
                                newQueueId = yield queueModel.createQueueInfo(db, qData);
                                const servicePointTopic = process.env.SERVICE_POINT_TOPIC + '/' + servicePointId;
                                const topic = process.env.QUEUE_CENTER_TOPIC;
                                fastify.mqttClient.publish(servicePointTopic, 'update visit', { qos: 0, retain: false });
                                fastify.mqttClient.publish(topic, 'update visit', { qos: 0, retain: false });
                                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, queueNumber: strQueueNumber, queueId: newQueueId[0] });
                            }
                            else {
                                var queueNumber = 0;
                                var strQueueNumber = null;
                                var newQueueId = null;
                                var queueInterview = 0;
                                var rs1;
                                if (usePriorityQueueRunning === 'Y') {
                                    rs1 = yield queueModel.checkServicePointQueueNumber(db, servicePointId, dateServ, priorityId);
                                }
                                else {
                                    rs1 = yield queueModel.checkServicePointQueueNumber(db, servicePointId, dateServ);
                                }
                                if (rs1.length) {
                                    queueNumber = rs1[0]['current_queue'] + 1;
                                    usePriorityQueueRunning === 'Y'
                                        ? yield queueModel.updateServicePointQueueNumber(db, servicePointId, dateServ, priorityId)
                                        : yield queueModel.updateServicePointQueueNumber(db, servicePointId, dateServ);
                                }
                                else {
                                    queueNumber = 1;
                                    usePriorityQueueRunning === 'Y'
                                        ? yield queueModel.createServicePointQueueNumber(db, servicePointId, dateServ, priorityId)
                                        : yield queueModel.createServicePointQueueNumber(db, servicePointId, dateServ);
                                }
                                var rs2 = yield queueModel.checkServicePointQueueNumber(db, 999, dateServ);
                                if (rs2.length) {
                                    queueInterview = rs2[0]['current_queue'] + 1;
                                    yield queueModel.updateServicePointQueueNumber(db, 999, dateServ);
                                }
                                else {
                                    queueInterview = 1;
                                    yield queueModel.createServicePointQueueNumber(db, 999, dateServ);
                                }
                                const _queueRunning = queueNumber;
                                const queueDigit = +process.env.QUEUE_DIGIT || 3;
                                var _queueNumber = null;
                                if (process.env.ZERO_PADDING === 'Y') {
                                    _queueNumber = padStart(queueNumber.toString(), queueDigit, '0');
                                }
                                else {
                                    _queueNumber = queueNumber.toString();
                                }
                                if (process.env.USE_PRIORITY_PREFIX === 'Y') {
                                    strQueueNumber = `${prefixPoint}${prefixPriority} ${_queueNumber}`;
                                }
                                else {
                                    strQueueNumber = usePriorityQueueRunning === 'Y'
                                        ? `${prefixPoint}${prefixPriority} ${_queueNumber}`
                                        : `${prefixPoint} ${_queueNumber}`;
                                }
                                const dateCreate = moment().format('YYYY-MM-DD HH:mm:ss');
                                const qData = {};
                                qData.servicePointId = servicePointId;
                                qData.dateServ = dateServ;
                                qData.timeServ = timeServ;
                                qData.queueNumber = strQueueNumber;
                                qData.hn = hn;
                                qData.vn = vn;
                                qData.priorityId = priorityId;
                                qData.dateCreate = dateCreate;
                                qData.hisQueue = hisQueue;
                                qData.queueRunning = _queueRunning;
                                qData.queueInterview = queueInterview;
                                newQueueId = yield queueModel.createQueueInfo(db, qData);
                                const servicePointTopic = process.env.SERVICE_POINT_TOPIC + '/' + servicePointId;
                                const topic = process.env.QUEUE_CENTER_TOPIC;
                                fastify.mqttClient.publish(servicePointTopic, 'update visit', { qos: 0, retain: false });
                                fastify.mqttClient.publish(topic, 'update visit', { qos: 0, retain: false });
                                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, queueNumber: strQueueNumber, queueId: newQueueId[0] });
                            }
                        }
                    }
                    else {
                        reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) });
                    }
                }
                catch (error) {
                    fastify.log.error(error);
                    reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
                }
            }
            else {
                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ข้อมูลไม่ครบ' });
            }
        }
        else {
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ไม่พบ TOKEN' });
        }
    }));
    fastify.post('/caller', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn;
        const servicePointId = req.body.servicePointId;
        const roomId = req.body.roomId;
        const token = req.body.token;
        const isInterview = req.body.isInterview || 'N';
        try {
            if (token) {
                if (hn && servicePointId && roomId) {
                    fastify.jwt.verify(token);
                    const rsToken = yield tokenModel.find(db, token);
                    if (rsToken.length) {
                        var rs = yield queueModel.apiGetCurrentQueueByHN(db, hn, servicePointId);
                        if (rs.length) {
                            var _queue = rs[0];
                            const dateServ = moment().format('YYYY-MM-DD');
                            const queueId = _queue.queue_id;
                            const queueNumber = _queue.queue_number;
                            yield queueModel.setQueueRoomNumber(db, queueId, roomId);
                            yield queueModel.removeCurrentQueue(db, servicePointId, dateServ, queueId);
                            yield queueModel.updateCurrentQueue(db, servicePointId, dateServ, queueId, roomId);
                            yield queueModel.markCompleted(db, queueId);
                            var _queueIds = [];
                            _queueIds.push(queueId);
                            const rsQueue = yield queueModel.apiGetCurrentQueue(db, _queueIds);
                            const roomNumber = rsQueue[0].room_number;
                            if (process.env.ENABLE_Q4U.toUpperCase() === 'Y') {
                                if (rsQueue.length) {
                                    const data = rsQueue[0];
                                    const queueWithoutPrefix = +data.queue_running;
                                    const params = {
                                        hosid: data.hosid,
                                        servicePointCode: data.service_point_code,
                                        queueNumber: data.queue_number,
                                        queueWithoutPrefix: queueWithoutPrefix,
                                        roomNumber: data.room_number,
                                        token: process.env.Q4U_NOTIFY_TOKEN,
                                        roomName: data.room_name,
                                        dateServ: moment(data.date_serv).format('YYYYMMDD'),
                                    };
                                    request.post(process.env.Q4U_NOTIFY_URL, {
                                        form: params
                                    }, (err, res, body) => {
                                        if (err)
                                            console.log(err);
                                        console.log(body);
                                    });
                                }
                            }
                            const servicePointTopic = process.env.SERVICE_POINT_TOPIC + '/' + servicePointId;
                            const globalTopic = process.env.QUEUE_CENTER_TOPIC;
                            const payload = {
                                queueNumber: queueNumber,
                                roomNumber: roomNumber,
                                servicePointId: servicePointId,
                                isInterview: isInterview
                            };
                            if (rs.length) {
                                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, queueId: rs[0].queue_id, priorityId: rs[0].priority_id });
                            }
                            else {
                                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
                            }
                            fastify.mqttClient.publish(globalTopic, 'update visit', { qos: 0, retain: false });
                            fastify.mqttClient.publish(servicePointTopic, JSON.stringify(payload), { qos: 0, retain: false });
                        }
                        else {
                            reply.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .send({
                                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                                message: 'ไม่พบคิวที่ต้องการ'
                            });
                        }
                    }
                    else {
                        reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) });
                    }
                }
                else {
                    reply.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .send({
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'ไม่พบ HN'
                    });
                }
            }
            else {
                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ไม่พบ TOKEN' });
            }
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/nhso', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.query.token;
        if (token) {
            const rsToken = yield tokenModel.find(db, token);
            if (rsToken.length) {
                try {
                    const rs = yield queueModel.getTokenNHSO(db);
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, rows: rs[0] });
                }
                catch (error) {
                    fastify.log.error(error);
                    reply.status(HttpStatus.UNAUTHORIZED).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message });
                }
            }
            else {
                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) });
            }
        }
        else {
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ไม่พบ TOKEN' });
        }
    }));
    next();
};
module.exports = router;
//# sourceMappingURL=api.js.map