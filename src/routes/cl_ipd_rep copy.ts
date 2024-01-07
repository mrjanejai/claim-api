/// <reference path="../../typings.d.ts" />

import * as Knex from 'knex';
import * as fastify from 'fastify';
import * as HttpStatus from 'http-status-codes';
import * as Random from 'random-js';
import * as crypto from 'crypto';
import * as xlsx from 'xlsx';

import * as excel from 'exceljs';
import * as fastifyMultipart from '@fastify/multipart';
import { IncomingForm } from 'formidable';

import { ClIpdRepModel } from '../models/claim/cl_ipd_rep';


const clIpdRepModel = new ClIpdRepModel();

const fastifyInstance = fastify({ logger: true });

fastifyInstance.register(fastifyMultipart, {
  attachFieldsToBody: true,
  limits: {
    fileSize: 5 * 1024 * 1024, // ขนาดไฟล์สูงสุดที่อนุญาตให้อัปโหลด (5MB)
  },
});


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

  // fastify.post('/upload', { preHandler: upload.single('file') }, async (req: fastify.Request, reply: fastify.Reply) => {
  //   try {
  //       const file = req.file; // ใช้ req.file แทน req.files.file
  
  //     if (!file) {
  //       reply.code(400).send({ message: 'Missing file' });
  //     }
  
  //     const workbook = xlsx.readFile(file.path);
  //     const sheet = workbook.Sheets[workbook.SheetNames[0]];
  //     let row = 9;
  
  //     while (true) {
  //       const cellA = sheet[`A${row}`];
  //       const cellE = sheet[`E${row}`];
  
  //       if (!cellA || !cellE) {
  //         break;
  //       }
  
  //       const data = {
  //         columnA: cellA.v,
  //         columnE: cellE.v,
  //         // และคอลัมน์อื่น ๆ ตามที่คุณต้องการ
  //       };
  
  //       // ตรวจสอบว่ามีข้อมูลในตารางแล้วหรือไม่
  //       const existingData = await clIpdRepModel.findByRepNoAndAn(db, data.columnA, data.columnE);
  //       if (existingData) {
  //         // อัปเดตข้อมูลที่มีอยู่แล้ว
  //         await clIpdRepModel.update(db, data.columnA,data.columnE, data);
  //       } else {
  //         // เพิ่มข้อมูลใหม่
  //         await clIpdRepModel.save(db, data);
  //       }
  
  //       row++;
  //     }
  
  //     reply.code(200).send({ message: 'Upload and insertion completed' });
  //   } catch (error) {
  //     console.error(error);
  //     reply.code(500).send({ message: 'Internal Server Error' });
  //   }
  // });

  fastify.post('/read', async (request, reply) => {
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
          // คอลัมน์อื่นๆ ที่คุณต้องการ
        };
  
        result.push(data);
        row++;
      }
  
      reply.code(200).send({ message: 'Read completed', data: result });
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: 'Internal Server Error' });
    }
  });
  



  next();

}

module.exports = router;