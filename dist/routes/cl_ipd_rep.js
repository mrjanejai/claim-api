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
const fastify_multer_1 = require("fastify-multer");
const HttpStatus = require("http-status-codes");
const xlsx = require("xlsx");
const excel = require("exceljs");
const fastifyMultipart = require("@fastify/multipart");
const cl_ipd_rep_1 = require("../models/claim/cl_ipd_rep");
const clIpdRepModel = new cl_ipd_rep_1.ClIpdRepModel();
const upload = fastify_multer_1.default({ dest: 'uploads/' });
const fastifyInstance = fastify({ logger: true });
fastifyInstance.register(fastifyMultipart, {
    addToBody: true,
    sharedSchemaId: '#mySharedSchema',
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
    fastify.post('/upload', { preHandler: upload.single('file') }, (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const file = req.file;
            if (!file) {
                reply.code(400).send({ message: 'Missing file' });
            }
            const workbook = xlsx.readFile(file.path);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            let row = 9;
            while (true) {
                const cellA = sheet[`A${row}`];
                const cellE = sheet[`E${row}`];
                if (!cellA || !cellE) {
                    break;
                }
                const data = {
                    columnA: cellA.v,
                    columnE: cellE.v,
                };
                const existingData = yield clIpdRepModel.findByRepNoAndAn(db, data.columnA, data.columnE);
                if (existingData) {
                    yield clIpdRepModel.update(db, data.columnA, data.columnE, data);
                }
                else {
                    yield clIpdRepModel.save(db, data);
                }
                row++;
            }
            reply.code(200).send({ message: 'Upload and insertion completed' });
        }
        catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    }));
    fastifyInstance.post('/read', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = req.body;
            const file = data.file;
            if (!file) {
                reply.code(400).send({ message: 'Missing file' });
            }
            const workbook = new excel.Workbook();
            yield workbook.xlsx.readFile(file.filepath);
            const worksheet = workbook.worksheets[0];
            let row = 9;
            const jsonData = [];
            while (true) {
                const columnA = worksheet.getCell(`A${row}`).value;
                const columnE = worksheet.getCell(`E${row}`).value;
                if (!columnA || !columnE) {
                    break;
                }
                const rowData = {
                    columnA: columnA.toString(),
                    columnE: columnE.toString(),
                };
                jsonData.push(rowData);
                row++;
            }
            reply.code(200).send(jsonData);
        }
        catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    }));
    fastifyInstance.listen(3000, (err, address) => {
        if (err) {
            fastifyInstance.log.error(err);
            process.exit(1);
        }
        fastifyInstance.log.info(`server listening on ${address}`);
    });
    next();
};
module.exports = router;
//# sourceMappingURL=cl_ipd_rep.js.map