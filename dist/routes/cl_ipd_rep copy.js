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
const fastify = require("fastify");
const HttpStatus = require("http-status-codes");
const xlsx = require("xlsx");
const fastifyMultipart = require("@fastify/multipart");
const cl_ipd_rep_1 = require("../models/claim/cl_ipd_rep");
const clIpdRepModel = new cl_ipd_rep_1.ClIpdRepModel();
const fastifyInstance = fastify({ logger: true });
fastifyInstance.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
const router = (fastify, {}, next) => {
    var db = fastify.db;
    fastify.get('/', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rs = yield clIpdRepModel.list(db);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            fastify.log.error(error);
            reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) });
        }
    }));
    fastify.post('/read', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = request.body;
            const file = data.file;
            if (!file) {
                reply.code(400).send({ message: 'Missing file' });
            }
            const workbook = xlsx.readFile(file.filepath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            let row = 9;
            const result = [];
            while (true) {
                const cellA = worksheet[`A${row}`];
                const cellE = worksheet[`E${row}`];
                if (!cellA || !cellE) {
                    break;
                }
                const data = {
                    columnA: cellA.v,
                    columnE: cellE.v,
                };
                result.push(data);
                row++;
            }
            reply.code(200).send({ message: 'Read completed', data: result });
        }
        catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    }));
    next();
};
module.exports = router;
//# sourceMappingURL=cl_ipd_rep copy.js.map