/// <reference path="../../typings.d.ts" />

import * as Knex from 'knex';
import * as fastify from 'fastify';
import * as HttpStatus from 'http-status-codes';
import { LineJobsModel } from '../models/line/line_jobs';

const linejobsModel = new LineJobsModel();

const router = (fastify, { }, next) => {

  var db: Knex = fastify.db;

  fastify.get('/', async (req: fastify.Request, reply: fastify.Reply) => {

    try {
      const rs: any = await linejobsModel.list(db);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK, results: rs })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.post('/', async (req: fastify.Request, reply: fastify.Reply) => {
    const ptoken_name = req.body.token_name;
    const ptoken_query = req.body.token_query;
    const ptoken_active = "Y";

    const data: any = {
      token_name: ptoken_name,
      token_query: ptoken_query,
      token_active: ptoken_active,
    };

    try {
      await linejobsModel.save(db, data);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.put('/:ptoken_Id', async (req: fastify.Request, reply: fastify.Reply) => {
    const ptoken_Id: any = req.params.token_id;
    const ptoken_name = req.body.token_name;
    const ptoken_query = req.body.token_query;
    const ptoken_active = req.body.token_active;

    const data: any = {
        token_name: ptoken_name,
        token_query: ptoken_query,
        token_active: ptoken_active,
    };

    try {
      await linejobsModel.update(db, ptoken_Id, data);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  fastify.delete('/:ptoken_Id', async (req: fastify.Request, reply: fastify.Reply) => {
    const ptoken_Id: any = req.params.token_id;

    try {
      await linejobsModel.delete(db, ptoken_Id);
      reply.status(HttpStatus.OK).send({ statusCode: HttpStatus.OK })
    } catch (error) {
      fastify.log.error(error);
      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) })
    }

  })

  next();

}

module.exports = router;
