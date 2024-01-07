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
const moment = require("moment");
const request = require('request');
const queue_1 = require("../models/queue");
const ezhosp_1 = require("../models/his/ezhosp");
const dhos_1 = require("../models/his/dhos");
const hi_1 = require("../models/his/hi");
const hosxp_1 = require("../models/his/hosxp");
const universal_1 = require("../models/his/universal");
const homc_1 = require("../models/his/homc");
const service_point_1 = require("../models/service_point");
const priority_1 = require("../models/priority");
const service_room_1 = require("../models/service_room");
const queueModel = new queue_1.QueueModel();
const servicePointModel = new service_point_1.ServicePointModel();
const priorityModel = new priority_1.PriorityModel();
const serviceRoomModel = new service_room_1.ServiceRoomModel();
const hisType = process.env.HIS_TYPE || 'universal';
let hisModel;
switch (hisType) {
    case 'ezhosp':
        hisModel = new ezhosp_1.EzhospModel();
        break;
    case 'dhos':
        hisModel = new dhos_1.DhosModel();
        break;
    case 'hosxp':
        hisModel = new hosxp_1.HosxpModel();
        break;
    case 'hi':
        hisModel = new hi_1.HiModel();
        break;
    case 'homc':
        hisModel = new homc_1.HomcModel();
        break;
    case 'universal':
        hisModel = new universal_1.UniversalModel();
        break;
    default:
        hisModel = new hosxp_1.HosxpModel();
}
const router = (fastify, {}, next) => {
    const dbHIS = fastify.dbHIS;
    const db = fastify.db;
    const padStart = function padStart(str, targetLength, padString = '0') {
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
    fastify.get('/test', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rs = yield hisModel.testConnection(dbHIS);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: 'Welcome to Q4U!' });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message });
        }
    }));
    fastify.post('/patient/info', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const cid = req.body.cid;
        if (cid) {
            try {
                const rs = yield hisModel.getPatientInfo(dbHIS, cid);
                if (rs.length) {
                    const data = rs[0];
                    const hn = data.hn;
                    const firstName = data.first_name;
                    const lastName = data.last_name;
                    const birthDate = data.birthdate;
                    const title = data.title;
                    const sex = data.sex;
                    const thDate = `${moment(birthDate).format('DD/MM')}/${moment(birthDate).get('year') + 543}`;
                    const patient = {
                        hn: hn,
                        firstName: firstName,
                        lastName: lastName,
                        birthDate: thDate,
                        engBirthDate: moment(birthDate).format('YYYY-MM-DD'),
                        title: title,
                        sex: sex
                    };
                    console.log(patient);
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: patient });
                }
                else {
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.NOT_FOUND, message: 'ไม่พบข้อมูล HN' });
                }
            }
            catch (error) {
                fastify.log.error(error);
                reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message });
            }
        }
        else {
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.NOT_FOUND, message: 'CID not found!' });
        }
    }));
    fastify.get('/his-visit', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const limit = +req.query.limit;
        const offset = +req.query.offset;
        const servicePointCode = req.query.servicePointCode || '';
        const query = req.query.query || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rsLocalCode = yield servicePointModel.getLocalCode(db);
            const rsCurrentOnQueue = yield queueModel.getCurrentVisitOnQueue(db, dateServ);
            const localCodes = [];
            const vn = [];
            rsLocalCode.forEach(v => {
                localCodes.push(v.local_code);
            });
            rsCurrentOnQueue.forEach(v => {
                vn.push(v.vn);
            });
            const rsTotal = yield hisModel.getVisitTotal(dbHIS, dateServ, localCodes, vn, servicePointCode, query);
            const rs = yield hisModel.getVisitList(dbHIS, dateServ, localCodes, vn, servicePointCode, query, limit, offset);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs, total: rsTotal[0].total });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/his-visit-history', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const limit = +req.query.limit;
        const offset = +req.query.offset;
        const servicePointId = req.query.servicePointId;
        const query = req.query.query || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rsTotal = yield queueModel.getVisitHistoryTotal(db, dateServ, servicePointId, query);
            const rs = yield queueModel.getVisitHistoryList(db, dateServ, servicePointId, query, limit, offset);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs, total: rsTotal[0].total });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/register', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn;
        const vn = req.body.vn;
        const localCode = req.body.clinicCode;
        const priorityId = req.body.priorityId;
        const dateServ = req.body.dateServ;
        const timeServ = req.body.timeServ;
        const hisQueue = req.body.hisQueue;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const title = req.body.title;
        const birthDate = req.body.birthDate;
        const sex = req.body.sex;
        if (hn && vn && localCode && dateServ && timeServ && firstName && lastName && birthDate) {
            try {
                const rsLocalCode = yield servicePointModel.getServicePointIdFromLocalCode(db, localCode);
                const servicePointId = rsLocalCode.length ? rsLocalCode[0].service_point_id : null;
                const departmentId = rsLocalCode.length ? rsLocalCode[0].department_id : null;
                if (servicePointId) {
                    let strQueueNumber = null;
                    const rsPriorityPrefix = yield priorityModel.getPrefix(db, priorityId);
                    const prefixPriority = rsPriorityPrefix[0].priority_prefix || '0';
                    const rsPointPrefix = yield servicePointModel.getPrefix(db, servicePointId);
                    const prefixPoint = rsPointPrefix[0].prefix || '0';
                    yield queueModel.savePatient(db, hn, title, firstName, lastName, birthDate, sex);
                    let queueNumber = 0;
                    let queueInterview = 0;
                    const usePriorityQueueRunning = rsPointPrefix[0].priority_queue_running || 'N';
                    const useHISQueue = process.env.USE_HIS_QUEUE || 'N';
                    let _queueRunning = 0;
                    if (useHISQueue === 'Y') {
                        const rsQueue = yield hisModel.getHISQueue(dbHIS, hn, dateServ);
                        if (rsQueue.length) {
                            const queue = rsQueue[0].queue;
                            strQueueNumber = queue;
                        }
                        else {
                            strQueueNumber = '000';
                        }
                    }
                    else {
                        let rs1;
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
                        _queueRunning = queueNumber;
                        const queueDigit = +process.env.QUEUE_DIGIT || 3;
                        let _queueNumber = null;
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
                    }
                    const rs2 = yield queueModel.checkServicePointQueueNumber(db, 999, dateServ);
                    if (rs2.length) {
                        queueInterview = rs2[0]['current_queue'] + 1;
                        yield queueModel.updateServicePointQueueNumber(db, 999, dateServ);
                    }
                    else {
                        queueInterview = 1;
                        yield queueModel.createServicePointQueueNumber(db, 999, dateServ);
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
                    const queueId = yield queueModel.createQueueInfo(db, qData);
                    const topic = process.env.QUEUE_CENTER_TOPIC;
                    const topicServicePoint = `${process.env.SERVICE_POINT_TOPIC}/${servicePointId}`;
                    const topicDepartment = `${process.env.DEPARTMENT_TOPIC}/${departmentId}`;
                    fastify.mqttClient.publish(topic, 'update visit', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicServicePoint, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicDepartment, '{"message":"update_visit"}', { qos: 0, retain: false });
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, hn: hn, vn: vn, queueNumber: queueNumber, queueId: queueId[0] });
                }
                else {
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ไม่พบรหัสแผนกที่ต้องการ' });
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
    }));
    fastify.post('/prepare/register', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn;
        const servicePointId = req.body.servicePointId;
        const priorityId = req.body.priorityId;
        if (hn) {
            const rsp = yield hisModel.getPatientInfoWithHN(dbHIS, hn);
            if (rsp.length) {
                const vn = moment().format('x');
                const dateServ = moment().format('YYYY-MM-DD');
                const timeServ = moment().format('HH:mm:ss');
                const hisQueue = null;
                const firstName = rsp[0].first_name;
                const lastName = rsp[0].last_name;
                const title = rsp[0].title;
                const birthDate = moment(rsp[0].birthdate).format('YYYY-MM-DD');
                const sex = rsp[0].sex;
                if (hn && vn && dateServ && timeServ && firstName && lastName && birthDate) {
                    try {
                        if (servicePointId) {
                            const rsPriorityPrefix = yield priorityModel.getPrefix(db, priorityId);
                            const prefixPriority = rsPriorityPrefix[0].priority_prefix || '0';
                            const rsPointPrefix = yield servicePointModel.getPrefix(db, servicePointId);
                            const prefixPoint = rsPointPrefix[0].prefix || '0';
                            const usePriorityQueueRunning = rsPointPrefix[0].priority_queue_running || 'N';
                            yield queueModel.savePatient(db, hn, title, firstName, lastName, birthDate, sex);
                            let queueNumber = 0;
                            let queueInterview = 0;
                            const useHISQueue = process.env.USE_HIS_QUEUE || 'N';
                            let _queueRunning = 0;
                            let strQueueNumber = null;
                            if (useHISQueue === 'Y') {
                                const rsQueue = yield hisModel.getHISQueue(dbHIS, hn, dateServ);
                                if (rsQueue.length) {
                                    const queue = rsQueue[0].queue;
                                    strQueueNumber = queue;
                                }
                                else {
                                    strQueueNumber = '000';
                                }
                            }
                            else {
                                let rs1;
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
                                const rs2 = yield queueModel.checkServicePointQueueNumber(db, 999, dateServ);
                                if (rs2.length) {
                                    queueInterview = rs2[0]['current_queue'] + 1;
                                    yield queueModel.updateServicePointQueueNumber(db, 999, dateServ);
                                }
                                else {
                                    queueInterview = 1;
                                    yield queueModel.createServicePointQueueNumber(db, 999, dateServ);
                                }
                                _queueRunning = queueNumber;
                                const queueDigit = +process.env.QUEUE_DIGIT || 3;
                                let _queueNumber = null;
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
                            const queueId = yield queueModel.createQueueInfo(db, qData);
                            const topic = process.env.QUEUE_CENTER_TOPIC;
                            const topicServicePoint = `${topic}/${servicePointId}`;
                            fastify.mqttClient.publish(topic, 'update visit', { qos: 0, retain: false });
                            fastify.mqttClient.publish(topicServicePoint, 'update visit', { qos: 0, retain: false });
                            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, hn: hn, vn: vn, queueNumber: queueNumber, queueId: queueId[0] });
                        }
                        else {
                            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'ไม่พบรหัสแผนกที่ต้องการ' });
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
                reply.status(HttpStatus.ACCEPTED)
                    .send({
                    statusCode: HttpStatus.ACCEPTED,
                    message: 'ไม่พบข้อมูล HN'
                });
            }
        }
        else {
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'ไม่ HN'
            });
        }
    }));
    fastify.get('/search', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = req.query.query || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.serachQueue(db, dateServ, query);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/waiting/:servicePointId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        const limit = +req.query.limit || 20;
        const offset = +req.query.offset || 0;
        const sort = req.query.sort;
        const query = req.query.query || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getWaitingList(db, dateServ, servicePointId, limit, offset, sort, query);
            const rsTotal = yield queueModel.getWaitingListTotal(db, dateServ, servicePointId, query);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs, total: rsTotal[0].total });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/waiting/:servicePointId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        const query = req.body.query || '';
        const prioityId = req.body.prioityId || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getWaitingListQuery(db, dateServ, servicePointId, query, prioityId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/waiting-group/:servicePointId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        const priorityId = req.query.priorityId || null;
        const limit = +req.query.limit || 20;
        const offset = +req.query.offset || 0;
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getWaitingGroupList(db, dateServ, servicePointId, priorityId, limit, offset);
            const rsTotal = yield queueModel.getWaitingGroupListTotal(db, dateServ, servicePointId, priorityId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs, total: rsTotal[0].total });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/waiting-group/search/:servicePointId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        const priorityId = +req.query.priorityId || null;
        const limit = +req.query.limit || 20;
        const offset = +req.query.offset || 0;
        const query = req.query.query || '';
        try {
            console.log(query);
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.searchWaitingGroupList(db, dateServ, servicePointId, priorityId, limit, offset, query);
            const rsTotal = yield queueModel.getWaitingGroupListTotal(db, dateServ, servicePointId, priorityId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs, total: rsTotal[0].total });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/history-group/search/:servicePointId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        const limit = +req.query.limit || 20;
        const offset = +req.query.offset || 0;
        const query = req.query.query || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.searchWorkingHistoryGroup(db, dateServ, limit, offset, servicePointId, query);
            const rsTotal = yield queueModel.getWorkingHistoryGroupTotal(db, dateServ, servicePointId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs, total: rsTotal[0].total });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/department/:departmentId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const departmentId = req.params.departmentId;
        const limit = +req.query.limit || 20;
        const offset = +req.query.offset || 0;
        const sort = req.query.sort;
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getQueueByDepartmentId(db, dateServ, departmentId, limit, offset, sort);
            const rsTotal = yield queueModel.getQueueByDepartmentIdTotal(db, dateServ, departmentId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs, total: rsTotal[0].total });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/department/history/:departmentId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const departmentId = req.params.departmentId;
        const limit = +req.query.limit || 20;
        const offset = +req.query.offset || 0;
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getQueueHistoryByDepartmentId(db, dateServ, departmentId, limit, offset);
            const rsTotal = yield queueModel.getQueueHistoryByDepartmentIdTotal(db, dateServ, departmentId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs, total: rsTotal[0].total });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/department/search/:departmentId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const departmentId = req.params.departmentId;
        const limit = +req.query.limit || 20;
        const offset = +req.query.offset || 0;
        const query = req.query.query || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.searchQueueByDepartmentId(db, dateServ, departmentId, limit, offset, query);
            const rsTotal = yield queueModel.searchQueueByDepartmentIdTotal(db, dateServ, departmentId, query);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs, total: rsTotal[0].total });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/working/:servicePointId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        const query = req.query.query || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getWorking(db, dateServ, servicePointId, query);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/working-group/:servicePointId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getWorkingGroup(db, dateServ, servicePointId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/working/department/:departmentId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const departmentId = req.params.departmentId;
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getWorkingDepartment(db, dateServ, departmentId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/all-queue/active', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getAllQueueActive(db, dateServ);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/all-queue/active', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = req.body.query || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getAllQueueActive(db, dateServ, query);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/all-queue/find-pending', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = req.body.query || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getAllQueuePending(db, dateServ, query);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/find-patient-appoint', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn;
        try {
            const rs = yield hisModel.getAppointInfo(dbHIS, hn);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error });
        }
    }));
    fastify.get('/working/history-group/:servicePointId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getWorkingHistoryGroup(db, dateServ, servicePointId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/working/history/:servicePointId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        const query = req.query.query || '';
        const prioityId = req.query.prioityId || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getWorkingHistory(db, dateServ, servicePointId, query, prioityId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/pending/:servicePointId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.params.servicePointId;
        const query = req.query.query || '';
        const prioityId = req.query.prioityId || '';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getPending(db, dateServ, servicePointId, query, prioityId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/pending/department/:departmentId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const departmentId = req.params.departmentId;
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const rs = yield queueModel.getPendingByDepartment(db, dateServ, departmentId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.put('/interview/marked/:queueId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.params.queueId;
        try {
            yield queueModel.markInterview(db, queueId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/pending', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.body.queueId;
        const servicePointId = req.body.servicePointId;
        const priorityId = req.body.priorityId;
        const pendigOldQueue = req.body.pendigOldQueue || null;
        try {
            yield queueModel.markCompleted(db, queueId);
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
                const useOldQueue = pendigOldQueue ? pendigOldQueue : rsServicePoint[0].use_old_queue || 'N';
                if (useOldQueue === 'Y') {
                    let queueNumber = 0;
                    let newQueueId = null;
                    let queueInterview = 0;
                    const rs1 = yield queueModel.checkServicePointQueueNumber(db, servicePointId, dateServ);
                    const rs2 = yield queueModel.checkServicePointQueueNumber(db, 999, dateServ);
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
                    const topic = process.env.QUEUE_CENTER_TOPIC;
                    const topicServicePoint = `${process.env.SERVICE_POINT_TOPIC}/${rsInfo[0].service_point_id}`;
                    const topicServicePoint2 = `${process.env.SERVICE_POINT_TOPIC}/${servicePointId}`;
                    const topicDepartment = `${process.env.DEPARTMENT_TOPIC}/${rsInfo[0].department_id}`;
                    const topicDepartment2 = `${process.env.DEPARTMENT_TOPIC}/${rsServicePoint[0].department_id}`;
                    fastify.mqttClient.publish(topic, 'update visit', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicServicePoint, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicServicePoint2, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicDepartment, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicDepartment2, '{"message":"update_visit"}', { qos: 0, retain: false });
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, queueNumber: strQueueNumber, queueId: newQueueId[0] });
                }
                else {
                    let queueNumber = 0;
                    let strQueueNumber = null;
                    let newQueueId = null;
                    let queueInterview = 0;
                    let rs1;
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
                    const rs2 = yield queueModel.checkServicePointQueueNumber(db, 999, dateServ);
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
                    let _queueNumber = null;
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
                    const topic = process.env.QUEUE_CENTER_TOPIC;
                    const topicServicePoint = `${process.env.SERVICE_POINT_TOPIC}/${rsInfo[0].service_point_id}`;
                    const topicServicePoint2 = `${process.env.SERVICE_POINT_TOPIC}/${servicePointId}`;
                    const topicDepartment = `${process.env.DEPARTMENT_TOPIC}/${rsInfo[0].department_id}`;
                    const topicDepartment2 = `${process.env.DEPARTMENT_TOPIC}/${rsServicePoint[0].department_id}`;
                    fastify.mqttClient.publish(topic, 'update visit', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicServicePoint, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicServicePoint2, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicDepartment, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicDepartment2, '{"message":"update_visit"}', { qos: 0, retain: false });
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, queueNumber: strQueueNumber, queueId: newQueueId[0] });
                }
            }
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/pendingcancel', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.body.queueId;
        const servicePointId = req.body.servicePointId;
        const priorityId = req.body.priorityId;
        const pendigOldQueue = req.body.pendigOldQueue || null;
        const fullname = req.body.fullname || null;
        try {
            yield queueModel.markCompleted(db, queueId);
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
                const useOldQueue = pendigOldQueue ? pendigOldQueue : rsServicePoint[0].use_old_queue || 'N';
                if (useOldQueue === 'Y') {
                    let queueNumber = 0;
                    let newQueueId = null;
                    let queueInterview = 0;
                    const rs1 = yield queueModel.checkServicePointQueueNumber(db, servicePointId, dateServ);
                    const rs2 = yield queueModel.checkServicePointQueueNumber(db, 999, dateServ);
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
                    const topic = process.env.QUEUE_CENTER_TOPIC;
                    const topicServicePoint = `${process.env.SERVICE_POINT_TOPIC}/${rsInfo[0].service_point_id}`;
                    const topicServicePoint2 = `${process.env.SERVICE_POINT_TOPIC}/${servicePointId}`;
                    const topicDepartment = `${process.env.DEPARTMENT_TOPIC}/${rsInfo[0].department_id}`;
                    const topicDepartment2 = `${process.env.DEPARTMENT_TOPIC}/${rsServicePoint[0].department_id}`;
                    fastify.mqttClient.publish(topic, 'update visit', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicServicePoint, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicServicePoint2, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicDepartment, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicDepartment2, '{"message":"update_visit"}', { qos: 0, retain: false });
                    if (fullname.length) {
                        yield queueModel.markWhoCancel(db, newQueueId[0], fullname);
                    }
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, queueNumber: strQueueNumber, queueId: newQueueId[0] });
                }
                else {
                    let queueNumber = 0;
                    let strQueueNumber = null;
                    let newQueueId = null;
                    let queueInterview = 0;
                    let rs1;
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
                    const rs2 = yield queueModel.checkServicePointQueueNumber(db, 999, dateServ);
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
                    let _queueNumber = null;
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
                    const topic = process.env.QUEUE_CENTER_TOPIC;
                    const topicServicePoint = `${process.env.SERVICE_POINT_TOPIC}/${rsInfo[0].service_point_id}`;
                    const topicServicePoint2 = `${process.env.SERVICE_POINT_TOPIC}/${servicePointId}`;
                    const topicDepartment = `${process.env.DEPARTMENT_TOPIC}/${rsInfo[0].department_id}`;
                    const topicDepartment2 = `${process.env.DEPARTMENT_TOPIC}/${rsServicePoint[0].department_id}`;
                    fastify.mqttClient.publish(topic, 'update visit', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicServicePoint, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicServicePoint2, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicDepartment, '{"message":"update_visit"}', { qos: 0, retain: false });
                    fastify.mqttClient.publish(topicDepartment2, '{"message":"update_visit"}', { qos: 0, retain: false });
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, queueNumber: strQueueNumber, queueId: newQueueId[0] });
                }
            }
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/caller/:queueId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.params.queueId;
        const servicePointId = req.body.servicePointId;
        const roomId = req.body.roomId;
        const roomNumber = req.body.roomNumber;
        const queueNumber = req.body.queueNumber;
        const isCompleted = req.body.isCompleted;
        let isInterview = 'N';
        let departmentId;
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            yield queueModel.setQueueRoomNumber(db, queueId, roomId);
            yield queueModel.removeCurrentQueue(db, servicePointId, dateServ, queueId);
            yield queueModel.updateCurrentQueue(db, servicePointId, dateServ, queueId, roomId);
            const queueDetail = yield queueModel.getDuplicatedQueueInfo(db, queueId);
            if (queueDetail.length) {
                const queueRunning = queueDetail[0].queue_running || 0;
                const queueData = [];
                queueData.push({
                    service_point_id: servicePointId,
                    date_serv: dateServ,
                    queue_id: queueId,
                    room_id: roomId,
                    queue_running: queueRunning
                });
                yield queueModel.removeCurrentQueueGroup(db, servicePointId, dateServ, queueId);
                yield queueModel.updateCurrentQueueGroups(db, queueData);
            }
            yield queueModel.markUnPending(db, queueId);
            if (isCompleted === 'N') {
                isInterview = 'Y';
                yield queueModel.markInterview(db, queueId);
            }
            else {
                yield queueModel.markCompleted(db, queueId);
            }
            const _queueIds = [];
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
            const groupTopic = process.env.GROUP_TOPIC + '/' + servicePointId;
            const departmentTopic = process.env.DEPARTMENT_TOPIC + '/' + departmentId;
            const globalTopic = process.env.QUEUE_CENTER_TOPIC;
            const payload = {
                queueNumber: queueNumber,
                roomNumber: roomNumber,
                servicePointId: servicePointId,
                departmentId: departmentId,
                isInterview: isInterview,
                roomId: roomId
            };
            fastify.mqttClient.publish(globalTopic, 'update visit', { qos: 0, retain: false });
            fastify.mqttClient.publish(servicePointTopic, JSON.stringify(payload), { qos: 0, retain: false });
            fastify.mqttClient.publish(groupTopic, JSON.stringify(payload), { qos: 0, retain: false });
            fastify.mqttClient.publish(departmentTopic, JSON.stringify(payload), { qos: 0, retain: false });
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/caller-groups', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.body.servicePointId;
        const roomId = req.body.roomId;
        const roomNumber = req.body.roomNumber;
        const queues = req.body.queue;
        const isCompleted = req.body.isCompleted;
        const queueIds = [];
        const queueData = [];
        const queueNumber = [];
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const _queues = Array.isArray(queues) ? queues : [queues];
            _queues.forEach((v) => {
                queueIds.push(v.queue_id);
                queueData.push({
                    service_point_id: servicePointId,
                    date_serv: dateServ,
                    queue_id: v.queue_id,
                    room_id: roomId,
                    queue_running: v.queue_running
                });
                queueNumber.push(v.queue_number);
            });
            yield queueModel.removeCurrentQueueGroups(db, servicePointId, dateServ, roomId);
            yield queueModel.updateCurrentQueueGroups(db, queueData);
            const rsServicePoint = yield servicePointModel.getPrefix(db, servicePointId);
            const groupCompare = rsServicePoint[0].group_compare || 'N';
            if (groupCompare === 'Y') {
                yield queueModel.setQueueGroupRoomNumber(db, queueIds, roomId);
                yield queueModel.markUnPendingGroup(db, queueIds);
                if (isCompleted === 'N') {
                    yield queueModel.markInterviewGroup(db, queueIds);
                }
                else {
                    yield queueModel.markCompletedGroup(db, queueIds);
                }
            }
            if (process.env.ENABLE_Q4U.toUpperCase() === 'Y') {
                const rsQueue = yield queueModel.getResponseQueueInfo(db, queueIds);
                if (rsQueue.length) {
                    rsQueue.forEach((v) => {
                        const data = v;
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
                    });
                }
            }
            const groupTopic = process.env.GROUP_TOPIC + '/' + servicePointId;
            const globalTopic = process.env.QUEUE_CENTER_TOPIC;
            const payload = {
                queueNumber: queueNumber,
                roomNumber: roomNumber,
                servicePointId: servicePointId,
                roomId: roomId
            };
            fastify.mqttClient.publish(globalTopic, 'update visit', { qos: 0, retain: false });
            fastify.mqttClient.publish(groupTopic, JSON.stringify(payload), { qos: 0, retain: false });
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/caller-group/:queueId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.params.queueId;
        const servicePointId = req.body.servicePointId;
        const roomId = req.body.roomId;
        const roomNumber = req.body.roomNumber;
        const queueNumber = req.body.queueNumber;
        const isCompleted = req.body.isCompleted;
        const queueRunning = req.body.queueRunning;
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            const queueData = [];
            queueData.push({
                service_point_id: servicePointId,
                date_serv: dateServ,
                queue_id: queueId,
                room_id: roomId,
                queue_running: queueRunning
            });
            yield queueModel.removeCurrentQueueGroup(db, servicePointId, dateServ, queueId);
            yield queueModel.updateCurrentQueueGroups(db, queueData);
            const rsServicePoint = yield servicePointModel.getPrefix(db, servicePointId);
            const groupCompare = rsServicePoint[0].group_compare || 'N';
            if (groupCompare === 'Y') {
                yield queueModel.setQueueRoomNumber(db, queueId, roomId);
                yield queueModel.markUnPending(db, queueId);
                if (isCompleted === 'N') {
                    yield queueModel.markInterview(db, queueId);
                }
                else {
                    yield queueModel.markCompleted(db, queueId);
                }
            }
            const _queueIds = [];
            _queueIds.push(queueId);
            if (process.env.ENABLE_Q4U.toUpperCase() === 'Y') {
                const rsQueue = yield queueModel.getResponseQueueInfo(db, _queueIds);
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
            const groupTopic = process.env.GROUP_TOPIC + '/' + servicePointId;
            const globalTopic = process.env.QUEUE_CENTER_TOPIC;
            const payload = {
                queueNumber: [queueNumber],
                roomNumber: roomNumber,
                servicePointId: servicePointId,
                roomId: roomId
            };
            fastify.mqttClient.publish(globalTopic, 'update visit', { qos: 0, retain: false });
            fastify.mqttClient.publish(groupTopic, JSON.stringify(payload), { qos: 0, retain: false });
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/caller/department/:queueId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.params.queueId;
        const departmentId = req.body.departmentId;
        const servicePointId = req.body.servicePointId;
        const roomId = req.body.roomId;
        const roomNumber = req.body.roomNumber;
        const queueNumber = req.body.queueNumber;
        const isCompleted = req.body.isCompleted;
        let isInterview = 'N';
        try {
            const dateServ = moment().format('YYYY-MM-DD');
            yield queueModel.setQueueRoomNumber(db, queueId, roomId);
            yield queueModel.removeCurrentQueue(db, servicePointId, dateServ, queueId);
            yield queueModel.updateCurrentQueue(db, servicePointId, dateServ, queueId, roomId);
            yield queueModel.markUnPending(db, queueId);
            const rsRoom = yield serviceRoomModel.info(db, roomId);
            const roomName = rsRoom.length ? rsRoom[0].room_name : null;
            if (isCompleted === 'N') {
                isInterview = 'Y';
                yield queueModel.markInterview(db, queueId);
            }
            else {
                yield queueModel.markCompleted(db, queueId);
            }
            const _queueIds = [];
            _queueIds.push(queueId);
            const rsQueue = yield queueModel.getResponseQueueInfo(db, _queueIds);
            if (process.env.ENABLE_Q4U.toUpperCase() === 'Y') {
                if (rsQueue.length) {
                    const data = rsQueue[0];
                    const queueWithoutPrefix = +data.queue_running;
                    const params = {
                        hosid: data.hosid,
                        servicePointCode: data.service_point_code,
                        queueNumber: data.queue_number,
                        queueWithoutPrefix: queueWithoutPrefix,
                        roomNumber: roomNumber,
                        token: process.env.Q4U_NOTIFY_TOKEN,
                        roomName: roomName,
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
                isInterview: isInterview,
                roomId: roomId
            };
            fastify.mqttClient.publish(globalTopic, 'update visit', { qos: 0, retain: false });
            fastify.mqttClient.publish(servicePointTopic, JSON.stringify(payload), { qos: 0, retain: false });
            fastify.mqttClient.publish(departmentTopic, JSON.stringify(payload), { qos: 0, retain: false });
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/change-room', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.body.queueId;
        const roomId = req.body.roomId;
        const roomNumber = req.body.roomNumber;
        const queueNumber = req.body.queueNumber;
        const servicePointId = req.body.servicePointId;
        const dateServ = moment().format('YYYY-MM-DD');
        console.log(servicePointId, dateServ, queueId, roomId);
        try {
            yield queueModel.setQueueRoomNumber(db, queueId, roomId);
            yield queueModel.removeCurrentQueue(db, servicePointId, dateServ, queueId);
            yield queueModel.updateCurrentQueue(db, servicePointId, dateServ, queueId, roomId);
            const servicePointTopic = process.env.SERVICE_POINT_TOPIC + '/' + servicePointId;
            const payload = {
                queueNumber: queueNumber,
                roomNumber: roomNumber,
                servicePointId: servicePointId
            };
            fastify.mqttClient.publish(servicePointTopic, JSON.stringify(payload), { qos: 0, retain: false });
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/change-room-group', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.body.queueId;
        const roomId = req.body.roomId;
        const roomNumber = req.body.roomNumber;
        const queueNumber = req.body.queueNumber;
        const queueRunning = req.body.queueRunning;
        const servicePointId = req.body.servicePointId;
        const dateServ = moment().format('YYYY-MM-DD');
        try {
            const queueData = [];
            queueData.push({
                service_point_id: servicePointId,
                date_serv: dateServ,
                queue_id: queueId,
                room_id: roomId,
                queue_running: queueRunning
            });
            yield queueModel.removeCurrentQueueGroup(db, servicePointId, dateServ, queueId);
            yield queueModel.updateCurrentQueueGroups(db, queueData);
            const groupTopic = process.env.GROUP_TOPIC + '/' + servicePointId;
            const payload = {
                queueNumber: queueNumber,
                roomNumber: roomNumber,
                servicePointId: servicePointId
            };
            fastify.mqttClient.publish(groupTopic, JSON.stringify(payload), { qos: 0, retain: false });
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/current-list', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const currentDate = moment().format('YYYY-MM-DD');
        try {
            const rs = yield queueModel.getCurrentQueueList(db, currentDate);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs[0] });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.delete('/cancel/:queueId', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queueId = req.params.queueId;
        try {
            yield queueModel.markCancel(db, queueId);
            fastify.mqttClient.publish('update delete', 'update delete', { qos: 0, retain: false });
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/service-points', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rs = yield servicePointModel.list(db);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/sound/service-point', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.query.servicePointId;
        try {
            const rs = yield servicePointModel.getSound(db, servicePointId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/sound/service-room', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = req.query.servicePointId;
        try {
            const rs = yield servicePointModel.getSoundList(db, servicePointId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/sound/service-room-department', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const departmentId = req.query.departmentId;
        try {
            const rs = yield servicePointModel.getSoundListDepartment(db, departmentId);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/next-queue/service-point', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const servicePointId = +req.query.servicePointId;
        const dateServ = moment().format('YYYY-MM-DD');
        const limit = +req.query.limit || 5;
        try {
            const rs = yield queueModel.getNextQueue(db, servicePointId, dateServ, limit);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/next-queue/department', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const departmentId = +req.query.departmentId;
        const dateServ = moment().format('YYYY-MM-DD');
        const limit = +req.query.limit || 5;
        try {
            const rs = yield queueModel.getNextQueueDepartment(db, departmentId, dateServ, limit);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/next-queue/department-er', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const departmentId = +req.query.departmentId;
        const dateServ = moment().format('YYYY-MM-DD');
        const limit = +req.query.limit || 15;
        try {
            const rs = yield queueModel.getNextQueueDepartmentER(db, departmentId, dateServ, limit);
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
//# sourceMappingURL=queue.js.map