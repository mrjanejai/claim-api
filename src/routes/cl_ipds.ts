/// <reference path="../../typings.d.ts" />

import * as Knex from 'knex';
import * as fastify from 'fastify';
import * as HttpStatus from 'http-status-codes';
import * as Random from 'random-js';
import * as crypto from 'crypto';

import { ClIpdModel } from '../models/claim/cl_ipd';


const clIpdModel = new ClIpdModel();


const router = (fastify, { }, next) => {

  var db: Knex = fastify.db;
  var dbHis: Knex = fastify.dbHIS;

  fastify.get('/', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: fastify.Request, reply: fastify.Reply) => {

    try {
      const rs: any = await clIpdModel.list(db);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }
  })

  // fastify.get('/sync', async (request, reply) => {
  //   try {
  //     const hisData = await dbHis.select('*').from('ipt');
  //     for (let data of hisData) {
  //       const existingData = await db('cl_ipd').where('an', data.an).first();
  //       if (existingData) {
  //         await db('cl_ipd').where('an', data.an).update(data);
  //       } else {
  //         await db('cl_ipd').insert(data);
  //       }
  //     }
  //     reply.code(200).send({ message: 'Sync completed' });
  //   } catch (error) {
  //     console.error(error);
  //     reply.code(500).send({ message: 'Internal Server Error' });
  //   }
  // });

  fastify.get('/sync', async (request, reply) => {
    try {
      const { startDate, endDate } = request.query;
  
      if (!startDate || !endDate) {
        reply.code(400).send({ message: 'Missing startDate or endDate' });
      }
  
      const hisData = await dbHis.select('*').from('ipt').whereBetween('dchdate', [startDate, endDate]);
      for (let data of hisData) {
        const existingData = await db('cl_ipd').where('an', data.an).first();
        if (existingData) {
          await db('cl_ipd').where('an', data.an).whereBetween('dchdate', [startDate, endDate]).update(data);
        } else {
          await db('cl_ipd').insert(data);
        }
      }
      reply.code(200).send({ message: 'Sync completed' });
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: 'Internal Server Error' });
    }
  });  

  fastify.get('/ipdcompare', async (request, reply) => {
    try {
      const { startDate, endDate,page,size } = request.query;
      let cDb;
      if (!startDate || !endDate) {

         cDb = await db.select('*').from('cl_ipd').orderBy('dchdate','asc').limit(size).offset(page*size-size);
      }else{

         cDb = await db.select('*').from('cl_ipd').whereBetween('dchdate', [startDate, endDate]).orderBy('dchdate','asc').limit(size).offset(page*size-size);;
      }

    const totalCount = await db('cl_ipd').count('an as total').first();
    const totalElements = totalCount.total;

    const totalPages = Math.ceil(totalElements / size);
    console.log(cDb.value);

    reply.code(200).send({
      dataList: cDb.map(entry => ({ an: entry.an,hn: entry.hn, dchdate: entry.dchdate,pttype: entry.pttype,prediag: entry.prediag,regdate: entry.regdate,regtime: entry.regtime })), // แปลงข้อมูลในรูปแบบที่ต้องการ
      totalPages,
      totalElements,
      last: page >= totalPages - 1,
    });
    } catch (error) {
      console.error(error);
      reply.code(500).send({ message: 'Internal Server Error' });
    }
  });  
  

//   fastify.post('/', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: fastify.Request, reply: fastify.Reply) => {
//     const username = req.body.username;

//     const password = req.body.password;
//     const encPassword = crypto.createHash('md5').update(password).digest('hex');

//     const fullname = req.body.fullname;
//     const isActive = req.body.isActive;
//     const userType = req.body.userType;

//     const data: any = {
//       username: username,
//       password: encPassword,
//       fullname: fullname,
//       is_active: isActive,
//       user_type: userType,
//     };

//     try {
//       await userModel.save(db, data);
//       reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
//     } catch (error) {
//       fastify.log.error(error);
//       reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
//     }
//   })

//   fastify.put('/:userId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: fastify.Request, reply: fastify.Reply) => {
//     const userId = req.params.userId;
//     const fullname = req.body.fullname;
//     const isActive = req.body.isActive;
//     const password = req.body.password;
//     const userType = req.body.userType;

//     const info: any = {
//       fullname: fullname,
//       is_active: isActive,
//       user_type: userType
//     };

//     if (password) {
//       var encPass = crypto.createHash('md5').update(password).digest('hex');
//       info.password = encPass;
//     }

//     try {
//       await userModel.update(db, userId, info);
//       reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
//     } catch (error) {
//       fastify.log.error(error);
//       reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
//     }
//   })

//   fastify.put('/changepass/:userId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: fastify.Request, reply: fastify.Reply) => {
//     const userId = req.params.userId;
//     const password = req.body.password;
//     const encPassword = crypto.createHash('md5').update(password).digest('hex');

//     const info: any = {
//       password: encPassword
//     };

//     try {
//       await userModel.update(db, userId, info);
//       reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
//     } catch (error) {
//       fastify.log.error(error);
//       reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
//     }
//   })

//   fastify.delete('/:userId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: fastify.Request, reply: fastify.Reply) => {
//     const userId: any = req.params.userId;

//     try {
//       await userModel.remove(db, userId);
//       reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
//     } catch (error) {
//       fastify.log.error(error);
//       reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
//     }
//   })

//   fastify.put('/service-points/:userId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: fastify.Request, reply: fastify.Reply) => {
//     const userId: any = req.params.userId;
//     const items = req.body.items;

//     var data: any = [];
//     items.forEach((v: any) => {
//       var obj: any = {};
//       obj.user_id = userId;
//       obj.service_point_id = v;

//       data.push(obj);
//     });

//     try {
//       await userServicePointModel.remove(db, userId);
//       await userServicePointModel.save(db, data);
//       reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
//     } catch (error) {
//       fastify.log.error(error);
//       reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
//     }
//   })


//   fastify.get('/service-points/list/:userId', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: fastify.Request, reply: fastify.Reply) => {
//     const userId: any = req.params.userId;

//     try {
//       const rs: any = await userServicePointModel.list(db, userId);
//       reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs })
//     } catch (error) {
//       fastify.log.error(error);
//       reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
//     }
//   })

  next();

}

module.exports = router;