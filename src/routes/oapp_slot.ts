/// <reference path="../../typings.d.ts" />

import * as Knex from 'knex';
import * as fastify from 'fastify';
import * as HttpStatus from 'http-status-codes';
import * as Random from 'random-js';
import * as crypto from 'crypto';


import { HosxpModel } from '../models/his/hosxp';
import { OappSlotModel } from '../models/appointment/oapp_slot';


const oappslotModel = new OappSlotModel();
const hosxpModel  = new HosxpModel();


const router = (fastify, { }, next) => {

    const db: Knex = fastify.db;
    const dbHis: Knex = fastify.dbHIS;

  /* Other Method */


  /* CRUD */

  fastify.get('/', { preHandler: [fastify.authenticate] }, async (req: fastify.Request, reply: fastify.Reply) => {

    try {
      const rs: any = await oappslotModel.list(db);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.post('/', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const pdate = req.body.pdate;
    const pstarttime = req.body.pstarttime;
    const pendtime = req.body.pendtime;
    const pqty = req.body.pqty;

    const data: any = {
        slotdate: pdate,
        starttime: pstarttime,
        endtime: pendtime,
        qty: pqty,
    };

    try {
      await oappslotModel.save(db, data);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.put('/:id', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const pid = req.body.pid;
    const pdate = req.body.pdate;
    const pstarttime = req.body.pstarttime;
    const pendtime = req.body.pendtime;
    const pqty = req.body.pqty;

    const data: any = {
        slotdate: pdate,
        starttime: pstarttime,
        endtime: pendtime,
        qty: pqty,
    };

    try {
      await oappslotModel.update(db, pid, data);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.delete('/:id', { preHandler: [fastify.authenticate, fastify.verifyAdmin] }, async (req: fastify.Request, reply: fastify.Reply) => {
    const pid = req.body.pid;

    try {
      await oappslotModel.delete(db, pid);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })


  next();

}

module.exports = router;