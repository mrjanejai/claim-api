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
const cl_ipd_1 = require("../models/claim/cl_ipd");
const clIpdModel = new cl_ipd_1.ClIpdModel();
const router = (fastify, {}, next) => {
    var db = fastify.db;
    var dbHis = fastify.dbHIS;
    fastify.get('/', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rs = yield clIpdModel.list(db);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.get('/sync', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { startDate, endDate } = request.query;
            if (!startDate || !endDate) {
                reply.code(400).send({ message: 'Missing startDate or endDate' });
            }
            const hisData = yield dbHis.select('*').from('ipt').whereBetween('dchdate', [startDate, endDate]);
            for (let data of hisData) {
                const existingData = yield db('cl_ipd').where('an', data.an).first();
                if (existingData) {
                    yield db('cl_ipd').where('an', data.an).whereBetween('dchdate', [startDate, endDate]).update(data);
                }
                else {
                    yield db('cl_ipd').insert(data);
                }
            }
            reply.code(200).send({ message: 'Sync completed' });
        }
        catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    }));
    next();
};
module.exports = router;
//# sourceMappingURL=cl_ipd.js.map