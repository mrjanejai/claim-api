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
const fastify_multer_1 = require("fastify-multer");
const excel = require("exceljs");
const path = require("path");
const clIpdRepModel = new cl_ipd_rep_1.ClIpdRepModel();
const fastifyInstance = fastify({ logger: true });
fastifyInstance.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: {
        fieldNameSize: 100,
        fieldSize: 1024,
        fields: 10,
        fileSize: 5 * 1024 * 1024,
        files: 1,
        headerPairs: 2000
    },
    abortOnLimit: true
});
const storage = fastify_multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = function (req, file, cb) {
    console.log(file);
    if (file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type'));
    }
};
const upload = fastify_multer_1.default({ storage: storage, fileFilter: fileFilter });
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
    fastify.post('/upload', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('upload');
        try {
            const data = request.body;
            const file = request.file;
            if (!file) {
                reply.code(400).send({ message: 'Missing file' });
                console.log('no file');
            }
            else {
                if (file.mimetype !== 'application/vnd.ms-excel') {
                    reply.code(400).send({ message: 'Invalid file type. Only .xls files are allowed.' });
                }
                console.log('has file');
            }
            const workbook = new excel.Workbook();
            yield workbook.xlsx.readFile(file.path);
            console.log(workbook.worksheets);
            const worksheet = workbook.worksheets[0];
            let row = 9;
            while (true) {
                const columnA = worksheet.getCell(`A${row}`).value;
                const columnE = worksheet.getCell(`E${row}`).value;
                if (!columnA || !columnE) {
                    break;
                }
                const data = {
                    columnA: columnA.toString(),
                    columnE: columnE.toString(),
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
            const rs = yield clIpdRepModel.list(db);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    }));
    fastifyInstance.post('/read', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('read');
        try {
            const data = request.body;
            const file = data.file;
            if (!file) {
                reply.code(400).send({ message: 'Missing file' });
                console.log('no file');
            }
            else {
                if (file.mimetype !== 'application/vnd.ms-excel') {
                    reply.code(400).send({ message: 'Invalid file type. Only .xls files are allowed.' });
                }
                console.log('has file');
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
    fastify.post('/receipt', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const reqData = request.body;
            const data = JSON.stringify(reqData);
            console.log(data);
            if (!data) {
                reply.code(400).send({ message: 'Missing JSON data' });
                console.log('no data');
            }
            else {
                const parsedData = JSON.parse(data);
                for (const record of parsedData) {
                    console.log(record);
                    const existingData = yield clIpdRepModel.findByRepNoAndAn(db, record.repno, record.an);
                    if (existingData) {
                        yield clIpdRepModel.update(db, record.repno, record.an, record);
                        console.log('Data updated:', record);
                    }
                    else {
                        yield clIpdRepModel.save(db, record);
                        console.log('New data added:', record);
                    }
                }
            }
            reply.code(200).send({ message: 'Upload and insertion completed' });
            const rs = yield clIpdRepModel.list(db);
            reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
        }
        catch (error) {
            console.error(error);
            reply.code(500).send({ message: 'Internal Server Error' });
        }
    }));
    next();
};
module.exports = router;
//# sourceMappingURL=cl_ipd_reps.js.map