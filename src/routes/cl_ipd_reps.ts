/// <reference path="../../typings.d.ts" />

import * as Knex from 'knex';
import * as fastify from 'fastify';
import * as HttpStatus from 'http-status-codes';
import * as xlsx from 'xlsx';
import * as fastifyMultipart from '@fastify/multipart';
import { ClIpdRepModel,ExcelRep } from '../models/claim/cl_ipd_rep';

import fastifyMulter from 'fastify-multer';
import * as excel from 'exceljs';
import * as path from 'path';
import { JSONParser } from 'formidable/parsers';
import { json2xml } from 'xml-js';


const clIpdRepModel = new ClIpdRepModel();

const fastifyInstance = fastify({ logger: true });

fastifyInstance.register(fastifyMultipart, {
  attachFieldsToBody: true, // Attach the parsed fields to the request body
  limits: {
    fieldNameSize: 100, // Max field name size (in bytes), default 100 bytes
    fieldSize: 1024, // Max field value size (in bytes), default 1MB
    fields: 10, // Max number of non-file fields, default 1000
    fileSize: 5 * 1024 * 1024, // Max file size (in bytes), default 5MB
    files: 1, // Max number of file fields, default 1
    headerPairs: 2000 // Max number of header key=>value pairs, default 2000
  },
  abortOnLimit: true // If set to true, the request will be aborted immediately when the limits are reached
});

const storage = fastifyMulter.diskStorage({
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
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = fastifyMulter({ storage: storage, fileFilter: fileFilter });

const router = (fastify, { }, next) => {

  var db: Knex = fastify.db;

  fastify.get('/', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: fastify.Request, reply: fastify.Reply) => {

    try {
      const rs: any = await clIpdRepModel.list(db);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  });

  fastify.post('/receipt', async (request, reply) => {
    try {
      
      const reqData = request.body; // ดึงข้อมูล JSON ที่ได้รับจาก frontend
      const data = reqData.data ? reqData.data  : undefined 
      //const data: any = JSON.stringify(reqData);
      //const ExcelRep: ExcelRep = data.map()
      //console.log(data);

      if (!data) {
        reply.code(400).send({ message: 'Missing JSON data' });
        console.log('no data');
      } else {
         const parsedData:any = JSON.parse(data);
        //console.log(data.repno,data.an);

        for (const record of parsedData) {
          //console.log(record);
          const existingData = await clIpdRepModel.findByRepNoAndAn(db, record.repno, record.an);
          if (existingData) {
          // อัปเดตข้อมูลที่มีอยู่แล้ว
          await clIpdRepModel.update(db, record.repno, record.an, record);
          console.log('Data updated:', record);
        } else {
          // เพิ่มข้อมูลใหม่
          await clIpdRepModel.save(db, record);
          console.log('New data added:', record);
        }
        }

      }
  
      reply.code(200).send({ message: 'Upload and insertion completed' });
      const rs: any = await clIpdRepModel.list(db);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs });
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: 'Internal Server Error' });
    }
  });
  
  
  



  next();

}

module.exports = router;