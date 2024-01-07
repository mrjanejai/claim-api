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
const kiosk_1 = require("./../models/kiosk");
const moment = require("moment");
const HttpStatus = require("http-status-codes");
const ezhosp_1 = require("../models/his/ezhosp");
const dhos_1 = require("../models/his/dhos");
const hi_1 = require("../models/his/hi");
const hosxp_1 = require("../models/his/hosxp");
const universal_1 = require("../models/his/universal");
const homc_1 = require("../models/his/homc");
const hisType = process.env.HIS_TYPE || 'universal';
const kioskModel = new kiosk_1.KioskModel();
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
    fastify.post('/profile', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log('insert');
            const token = req.body.token;
            if (token) {
                const kioskId = req.body.kioskId;
                const decoded = fastify.jwt.verify(token);
                const cid = req.body.cid;
                const title = req.body.title;
                const fname = req.body.fname;
                const lname = req.body.lname;
                const birthDate = req.body.birthDate;
                const topic = `kiosk/${kioskId}`;
                const obj = {
                    cid: cid,
                    fullname: `${title}${fname} ${lname}`,
                    birthDate: birthDate
                };
                const payload = {
                    ok: true,
                    results: obj
                };
                fastify.mqttClient.publish(topic, JSON.stringify(payload), { qos: 0, retain: false });
                reply.status(HttpStatus.OK).send({ cid: cid, title: title, fname: fname, lname: lname, birthDate: birthDate });
            }
            else {
                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) });
            }
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.delete('/profile', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = req.body.token;
            const kioskId = req.body.kioskId;
            if (token) {
                const decoded = fastify.jwt.verify(token);
                console.log('remove');
                const topic = `kiosk/${kioskId}`;
                const payload = {
                    ok: false
                };
                fastify.mqttClient.publish(topic, JSON.stringify(payload), { qos: 0, retain: false });
                reply.status(HttpStatus.OK).send({ message: 'remove' });
            }
            else {
                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.UNAUTHORIZED, message: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED) });
            }
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/patient/info', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const cid = req.body.cid;
        if (cid) {
            try {
                const rs = yield hisModel.getPatientInfo(dbHIS, cid);
                if (rs.length) {
                    const data = rs[0];
                    const visit = yield hisModel.getCurrentVisit(dbHIS, data.hn);
                    let isVisit = false;
                    if (visit.length) {
                        isVisit = true;
                    }
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
                        sex: sex,
                        isVisit: isVisit
                    };
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: patient });
                }
                else {
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.NOT_FOUND, message: 'ไม่พบข้อมูล' });
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
    fastify.post('/patient/info/hn', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const hn = req.body.hn;
        if (hn) {
            try {
                const rs = yield hisModel.getPatientInfoWithHN(dbHIS, hn);
                if (rs.length) {
                    const visit = yield hisModel.getCurrentVisit(dbHIS, hn);
                    let isVisit = false;
                    if (visit.length) {
                        isVisit = true;
                    }
                    const data = rs[0];
                    const cid = data.cid;
                    const firstName = data.first_name;
                    const lastName = data.last_name;
                    const birthDate = data.birthdate;
                    const title = data.title;
                    const sex = data.sex;
                    const thDate = `${moment(birthDate).format('DD/MM')}/${moment(birthDate).get('year') + 543}`;
                    const patient = {
                        cid: cid,
                        firstName: firstName,
                        lastName: lastName,
                        birthDate: thDate,
                        engBirthDate: moment(birthDate).format('YYYY-MM-DD'),
                        title: title,
                        sex: sex,
                        isVisit: isVisit
                    };
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: patient });
                }
                else {
                    reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.NOT_FOUND, message: 'ไม่พบข้อมูล' });
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
    fastify.post('/nhso', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const data = req.body.data;
        try {
            const rs = yield kioskModel.nhso(data);
            if (rs.length) {
                var convert = require('xml-js');
                var result = JSON.parse(convert.xml2json(rs, { compact: false, spaces: 4 }));
                const _result = result.elements[0].elements[0].elements[0].elements[0].elements;
                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: _result });
            }
            else {
                reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.NOT_FOUND, message: 'ไม่พบข้อมูล' });
            }
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message });
        }
    }));
    fastify.post('/trigger', { preHandler: [fastify.authenticate] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const url = req.body.url;
        const hn = req.body.hn;
        const cid = req.body.cid;
        const type = req.body.type;
        const localCode = req.body.localCode;
        const servicePointId = req.body.servicePointId;
        try {
            if (type == 'GET') {
                yield kioskModel.triggerGet(url, hn, cid, localCode, servicePointId);
            }
            if (type == 'POST') {
                yield kioskModel.triggerPOST(url, hn, cid, localCode, servicePointId);
            }
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message });
        }
    }));
    next();
};
module.exports = router;
//# sourceMappingURL=kiosk.js.map