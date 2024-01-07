"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModel = void 0;
class QueueModel {
    savePatient(db, hn, title, firstName, lastName, birthdate, sex = '') {
        const sql = `
    INSERT INTO q4u_person(hn, title, first_name, last_name, birthdate, sex)
    VALUES(?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE title=?, first_name=?, last_name=?, birthdate=?, sex=?
    `;
        return db.raw(sql, [
            hn, title, firstName, lastName, birthdate, sex,
            title, firstName, lastName, birthdate, sex
        ]);
    }
    updateServicePointQueueNumber(db, servicePointId, dateServ, priorityId = null) {
        const sql = db('q4u_queue_number')
            .where('service_point_id', servicePointId)
            .where('date_serv', dateServ);
        if (priorityId) {
            sql.where('priority_id', priorityId);
        }
        return sql.increment('current_queue', 1);
    }
    updateServicePointQueueNumberWithPriority(db, servicePointId, dateServ, priorityId) {
        return db('q4u_queue_number')
            .where('service_point_id', servicePointId)
            .where('date_serv', dateServ)
            .increment('current_queue', 1);
    }
    markInterview(db, queueId) {
        return db('q4u_queue')
            .where('queue_id', queueId)
            .update({
            'is_interview': 'Y',
        });
    }
    markInterviewGroup(db, queueId) {
        return db('q4u_queue')
            .whereIn('queue_id', queueId)
            .update({
            'is_interview': 'Y',
        });
    }
    markCompleted(db, queueId) {
        return db('q4u_queue')
            .where('queue_id', queueId)
            .update({
            'is_completed': 'Y',
        });
    }
    markWhoCancel(db, queueId, fullname) {
        return db('q4u_queue')
            .where('queue_id', queueId)
            .update({
            'who_transfer_cancel': fullname,
        });
    }
    markCompletedGroup(db, queueId) {
        return db('q4u_queue')
            .whereIn('queue_id', queueId)
            .update({
            'is_completed': 'Y',
        });
    }
    createServicePointQueueNumber(db, servicePointId, dateServ, priorityId = null) {
        const data = {};
        data.service_point_id = servicePointId;
        data.date_serv = dateServ;
        data.current_queue = 1;
        if (priorityId) {
            data.priority_id = priorityId;
        }
        return db('q4u_queue_number')
            .insert(data);
    }
    checkServicePointQueueNumber(db, servicePointId, dateServ, priorityId = null) {
        const sql = db('q4u_queue_number')
            .where('service_point_id', servicePointId)
            .where('date_serv', dateServ);
        if (priorityId) {
            sql.where('priority_id', priorityId);
        }
        return sql.limit(1);
    }
    createQueueInfo(db, qData) {
        return db('q4u_queue')
            .insert({
            hn: qData.hn,
            vn: qData.vn,
            service_point_id: qData.servicePointId,
            date_serv: qData.dateServ,
            time_serv: qData.timeServ,
            queue_number: qData.queueNumber,
            queue_running: qData.queueRunning,
            his_queue: qData.hisQueue,
            priority_id: qData.priorityId,
            date_create: qData.dateCreate,
            queue_interview: qData.queueInterview
        }, 'queue_id');
    }
    searchQueueByDepartmentId(db, dateServ, departmentId, limit, offset, query) {
        const _query = `%${query}%`;
        return db('q4u_queue as q')
            .select('q.queue_id', 'q.queue_interview', 'q.hn', 'q.vn', 'q.service_point_id', 'q.priority_id', 'q.queue_number', 'q.room_id', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'q.is_interview', 'sp.department_id', 'sd.department_name', 'sp.service_point_name')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .innerJoin('q4u_departments as sd', 'sp.department_id', 'sd.department_id')
            .where('sp.department_id', departmentId)
            .where('q.date_serv', dateServ)
            .where('q.mark_pending', 'N')
            .where((w) => {
            w.where('q.hn', 'like', _query)
                .orWhere('q.queue_number', 'like', _query);
        })
            .whereNot('q.is_cancel', 'Y')
            .orderBy('q.queue_id', 'asc')
            .groupBy('q.queue_id')
            .limit(limit)
            .offset(offset);
    }
    searchQueueByDepartmentIdTotal(db, dateServ, departmentId, query) {
        const _query = `%${query}%`;
        return db('q4u_queue as q')
            .select(db.raw('count(*) as total'))
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .innerJoin('q4u_departments as sd', 'sp.department_id', 'sd.department_id')
            .where('sp.department_id', departmentId)
            .where('q.mark_pending', 'N')
            .where((w) => {
            w.where('q.hn', 'like', _query)
                .orWhere('q.queue_number', 'like', _query);
        })
            .whereNot('q.is_cancel', 'Y')
            .where('q.date_serv', dateServ);
    }
    getQueueByDepartmentId(db, dateServ, departmentId, limit, offset, sort) {
        const sql = db('q4u_queue as q')
            .select('q.queue_id', 'q.queue_interview', 'q.hn', 'q.vn', 'q.service_point_id', 'q.priority_id', 'q.queue_number', 'q.room_id', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'q.is_interview', 'sp.department_id', 'sd.department_name', 'sp.service_point_name')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .innerJoin('q4u_departments as sd', 'sp.department_id', 'sd.department_id')
            .where('sp.department_id', departmentId)
            .where('q.date_serv', dateServ)
            .where('q.mark_pending', 'N')
            .where('q.is_completed', 'N')
            .whereNot('q.is_cancel', 'Y');
        if (sort == 'ASC') {
            sql.orderBy([{ column: 'pr.priority_order', order: 'asc' }, { column: 'q.queue_id', order: 'asc' }]);
        }
        else if (sort == 'DESC') {
            sql.orderBy([{ column: 'pr.priority_order', order: 'desc' }, { column: 'q.queue_id', order: 'asc' }]);
        }
        else {
            sql.orderBy('q.queue_id', 'asc');
        }
        sql.groupBy('q.queue_id')
            .limit(limit)
            .offset(offset);
        return sql;
    }
    getQueueHistoryByDepartmentId(db, dateServ, departmentId, limit, offset) {
        const sql = db('q4u_queue as q')
            .select('q.queue_id', 'q.queue_interview', 'q.hn', 'q.vn', 'q.service_point_id', 'q.priority_id', 'q.queue_number', 'q.room_id', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'q.is_interview', 'sp.department_id', 'sd.department_name', 'sp.service_point_name')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .innerJoin('q4u_departments as sd', 'sp.department_id', 'sd.department_id')
            .where('sp.department_id', departmentId)
            .where('q.date_serv', dateServ)
            .where('q.mark_pending', 'N')
            .where('q.is_completed', 'Y')
            .whereNot('q.is_cancel', 'Y')
            .orderBy('q.queue_id', 'asc')
            .groupBy('q.queue_id')
            .limit(limit)
            .offset(offset);
        return sql;
    }
    getQueueByDepartmentIdTotal(db, dateServ, departmentId) {
        return db('q4u_queue as q')
            .select(db.raw('count(*) as total'))
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .innerJoin('q4u_departments as sd', 'sp.department_id', 'sd.department_id')
            .where('sp.department_id', departmentId)
            .where('q.mark_pending', 'N')
            .where('q.is_completed', 'N')
            .whereNot('q.is_cancel', 'Y')
            .where('q.date_serv', dateServ);
    }
    getQueueHistoryByDepartmentIdTotal(db, dateServ, departmentId) {
        return db('q4u_queue as q')
            .select(db.raw('count(*) as total'))
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .innerJoin('q4u_departments as sd', 'sp.department_id', 'sd.department_id')
            .where('sp.department_id', departmentId)
            .where('q.mark_pending', 'N')
            .where('q.is_completed', 'Y')
            .whereNot('q.is_cancel', 'Y')
            .where('q.date_serv', dateServ);
    }
    getWaitingGroupList(db, dateServ, servicePointId, priorityId, limit, offset) {
        const sql = db('q4u_queue as q')
            .select('q.queue_id', 'q.queue_interview', 'q.hn', 'q.vn', 'q.service_point_id', 'q.priority_id', 'q.queue_number', 'q.queue_running', 'q.room_id', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'q.is_interview')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .where('q.service_point_id', servicePointId)
            .where('q.date_serv', dateServ)
            .whereNull('q.room_id')
            .whereNotIn('q.queue_id', db('q4u_queue_group_detail').select('queue_id').where('date_serv', dateServ).where('service_point_id', servicePointId))
            .where('q.mark_pending', 'N')
            .where('q.date_serv', dateServ);
        if (priorityId) {
            sql.where('q.priority_id', priorityId);
        }
        return sql.whereNot('q.is_cancel', 'Y')
            .orderBy('q.queue_id', 'asc')
            .groupBy('q.queue_id')
            .limit(limit)
            .offset(offset);
    }
    searchWaitingGroupList(db, dateServ, servicePointId, priorityId, limit, offset, query) {
        const _query = `%${query}%`;
        const sql = db('q4u_queue as q')
            .select('q.queue_id', 'q.queue_interview', 'q.hn', 'q.vn', 'q.service_point_id', 'q.priority_id', 'q.queue_number', 'q.queue_running', 'q.room_id', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'q.is_interview')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .where('q.service_point_id', servicePointId)
            .where('q.date_serv', dateServ)
            .whereNull('q.room_id')
            .whereNotIn('q.queue_id', db('q4u_queue_group_detail').select('queue_id').where('date_serv', dateServ).where('service_point_id', servicePointId))
            .where((w) => {
            w.where('q.hn', 'like', _query)
                .orWhere('q.queue_number', 'like', _query)
                .orWhere('p.first_name', 'like', _query)
                .orWhere('p.last_name', 'like', _query);
        });
        if (priorityId) {
            sql.where('q.priority_id', priorityId);
        }
        return sql.where('q.mark_pending', 'N')
            .where('q.date_serv', dateServ)
            .whereNot('q.is_cancel', 'Y')
            .orderBy('q.queue_id', 'asc')
            .groupBy('q.queue_id')
            .limit(limit)
            .offset(offset);
    }
    getWaitingGroupListTotal(db, dateServ, servicePointId, priorityId) {
        const sql = db('q4u_queue as q')
            .select(db.raw('count(*) as total'))
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .where('q.service_point_id', servicePointId)
            .where('q.mark_pending', 'N')
            .whereNotIn('q.queue_id', db('q4u_queue_group_detail').select('queue_id').where('date_serv', dateServ).where('service_point_id', servicePointId))
            .whereNot('q.is_cancel', 'Y')
            .where('q.date_serv', dateServ);
        if (priorityId) {
            sql.where('q.priority_id', priorityId);
        }
        return sql.whereNull('q.room_id');
    }
    getWaitingList(db, dateServ, servicePointId, limit, offset, sort = '', query = '') {
        const _query = `%${query}%`;
        const sql = db('q4u_queue as q')
            .select('q.queue_id', 'q.queue_interview', 'q.hn', 'q.vn', 'q.service_point_id', 'q.priority_id', 'q.queue_number', 'q.room_id', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'q.is_interview', 'q.is_completed')
            .select(db.raw(`SUBSTRING_INDEX(q.date_create,' ',-1) as date_create`))
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .where('q.service_point_id', servicePointId)
            .where('q.date_serv', dateServ)
            .where('q.is_completed', 'N')
            .where((w) => {
            w.orWhere('q.hn', 'like', _query)
                .orWhere('p.first_name', 'like', _query)
                .orWhere('p.last_name', 'like', _query)
                .orWhereRaw(`REPLACE(q.queue_number,' ','') like '${_query}'`);
        })
            .whereNot('q.is_cancel', 'Y')
            .whereNot('q.mark_pending', 'Y');
        if (sort == 'ASC') {
            sql.orderBy([{ column: 'pr.priority_order', order: 'asc' }, { column: 'q.queue_id', order: 'asc' }]);
        }
        else if (sort == 'DESC') {
            sql.orderBy([{ column: 'pr.priority_order', order: 'desc' }, { column: 'q.queue_id', order: 'asc' }]);
        }
        else {
            sql.orderBy('q.queue_id', 'asc');
        }
        sql.groupBy('q.queue_id')
            .limit(100)
            .offset(offset);
        return sql;
    }
    serachQueue(db, dateServ, query = '') {
        const _query = `%${query}%`;
        const maxId = db('q4u_queue as q')
            .max('q.queue_id as queue_id')
            .where((w) => {
            w.orWhere('q.queue_number', 'like', _query)
                .orWhereRaw(`REPLACE(q.queue_number,' ','') like '${_query}'`);
        })
            .where('q.date_serv', dateServ)
            .groupBy('q.queue_number');
        const sql = db('q4u_queue as q')
            .select('q.queue_id', 'q.queue_interview', 'q.hn', 'q.vn', 'q.service_point_id', 'q.priority_id', 'q.queue_number', 'q.room_id', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'q.is_interview', 'q.is_completed')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .where('q.date_serv', dateServ)
            .whereIn('q.queue_id', maxId)
            .where((w) => {
            w.orWhere('q.queue_number', 'like', _query)
                .orWhereRaw(`REPLACE(q.queue_number,' ','') like '${_query}'`);
        }).limit(1)
            .groupBy('q.queue_id');
        return sql;
    }
    getWaitingListTotal(db, dateServ, servicePointId, query = '') {
        const _query = `%${query}%`;
        return db('q4u_queue as q')
            .select(db.raw('count(*) as total'))
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .where('q.service_point_id', servicePointId)
            .where('q.is_completed', 'N')
            .whereNot('q.is_cancel', 'Y')
            .whereNot('q.mark_pending', 'Y')
            .where('q.date_serv', dateServ)
            .where((w) => {
            w.orWhere('q.hn', 'like', _query)
                .orWhere('p.first_name', 'like', _query)
                .orWhere('p.last_name', 'like', _query)
                .orWhereRaw(`REPLACE(q.queue_number,' ','') like '${_query}'`);
        });
    }
    getWaitingListQuery(db, dateServ, servicePointId, query = '', prioityId = '') {
        const _query = `%${query}%`;
        const sql = db('q4u_queue as q')
            .select('q.queue_id', 'q.queue_interview', 'q.hn', 'q.vn', 'q.service_point_id', 'q.priority_id', 'q.queue_number', 'q.room_id', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'q.is_interview')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .where('q.service_point_id', servicePointId)
            .where('q.date_serv', dateServ)
            .where('q.is_completed', 'N')
            .whereNot('q.is_cancel', 'Y')
            .whereNot('q.mark_pending', 'Y')
            .where((w) => {
            w.where('q.hn', 'like', _query)
                .orWhere('q.queue_number', 'like', _query)
                .orWhere('p.first_name', 'like', _query)
                .orWhere('p.last_name', 'like', _query);
        });
        if (prioityId != '') {
            sql.where('q.priority_id', prioityId);
        }
        sql.orderBy('q.queue_id', 'asc')
            .groupBy('q.queue_id')
            .limit(50);
        return sql;
    }
    getWorking(db, dateServ, servicePointId, query) {
        const _query = `%${query}%`;
        const sql = db('q4u_queue_detail as qd')
            .select('qd.service_point_id', 'q.queue_interview', 'qd.date_serv as queue_date', 'qd.last_queue', 'qd.room_id', 'q.queue_number', 'q.hn', 'q.vn', 'qd.queue_id', 'q.date_serv', 'q.time_serv', 'qd.update_date', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'pr.priority_id', 'pr.priority_color', 'r.room_name', 'r.room_number', 'sp.service_point_name', 'sp.department_id', 'q.is_completed')
            .innerJoin('q4u_queue as q', 'q.queue_id', 'qd.queue_id')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_rooms as r', 'r.room_id', 'qd.room_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .where('qd.date_serv', dateServ)
            .where('qd.service_point_id', servicePointId);
        if (query) {
            sql.where((w) => {
                w.orWhere('q.hn', 'like', _query)
                    .orWhere('p.first_name', 'like', _query)
                    .orWhere('p.last_name', 'like', _query)
                    .orWhereRaw(`REPLACE(q.queue_number,' ','') like '${_query}'`);
            });
        }
        sql.whereNot('q.mark_pending', 'Y')
            .whereNot('q.is_cancel', 'Y')
            .groupByRaw('qd.date_serv, qd.service_point_id, qd.room_id')
            .orderBy('qd.update_date', 'desc');
        return sql;
    }
    getWorkingGroup(db, dateServ, servicePointId) {
        return db('q4u_queue_group_detail as qd')
            .select('qd.service_point_id', 'q.queue_interview', 'qd.date_serv as queue_date', 'qd.last_queue', 'qd.room_id', 'q.queue_number', 'q.queue_running', 'q.hn', 'q.vn', 'qd.queue_id', 'q.date_serv', 'q.time_serv', 'qd.update_date', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'pr.priority_id', 'pr.priority_color', 'q.is_completed', 'r.room_name', 'r.room_number', 'sp.service_point_name')
            .innerJoin('q4u_queue as q', 'q.queue_id', 'qd.queue_id')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_rooms as r', 'r.room_id', 'qd.room_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .where('qd.date_serv', dateServ)
            .where('qd.service_point_id', servicePointId)
            .whereNot('q.mark_pending', 'Y')
            .whereNot('q.is_cancel', 'Y')
            .where('qd.update_date', db('q4u_queue_group_detail').select('update_date').where('date_serv', dateServ).where('service_point_id', servicePointId).orderBy('update_date', 'desc').limit(1))
            .orderBy('q.date_update', 'desc')
            .orderBy('q.queue_running');
    }
    getWorkingDepartment(db, dateServ, departmentId) {
        const sql = db('q4u_queue as q')
            .select('q.service_point_id', 'q.queue_interview', 'q.date_serv as queue_date', 'q.room_id', 'q.queue_number', 'q.hn', 'q.vn', 'q.queue_id', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name as fname', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'pr.priority_id', 'pr.priority_color', 'q.is_completed', 'pr.priority_thai', 'r.room_name', 'r.room_number', 'sp.service_point_name', db.raw(`ifnull(qd.update_date,CURRENT_DATE) as update_date`))
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_rooms as r', 'r.room_id', 'q.room_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .leftJoin('q4u_queue_detail as qd', 'qd.queue_id', 'q.queue_id')
            .where('q.date_serv', dateServ)
            .where('sp.department_id', departmentId)
            .whereNot('q.mark_pending', 'Y')
            .whereNot('q.is_cancel', 'Y')
            .groupBy('q.room_id')
            .orderBy('qd.update_date', 'desc');
        return sql;
    }
    getWorkingDepartmentEr(db, dateServ, departmentId) {
        const sql = db('q4u_queue as q')
            .select('q.service_point_id', 'q.queue_interview', 'q.date_serv as queue_date', 'q.room_id', 'q.queue_number', 'q.hn', 'q.vn', 'q.queue_id', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'pr.priority_id', 'pr.priority_color', 'q.is_completed', 'r.room_name', 'r.room_number', 'sp.service_point_name', db.raw(`ifnull(qd.update_date,CURRENT_DATE) as update_date`))
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_rooms as r', 'r.room_id', 'q.room_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .leftJoin('q4u_queue_detail as qd', 'qd.queue_id', 'q.queue_id')
            .where('q.date_serv', dateServ)
            .where('sp.department_id', departmentId)
            .whereNot('q.mark_pending', 'Y')
            .whereNot('q.is_cancel', 'Y')
            .groupBy('q.room_id')
            .orderBy('pr.priority_id', 'desc')
            .orderBy('qd.update_date', 'desc');
        return sql;
    }
    getAllQueueActive(db, dateServ, query = '') {
        query = query.replace(/'/g, '');
        const _query = `%${query}%`;
        const sql = db('q4u_queue as q')
            .select('q.queue_number', 'q.hn', 'q.vn', 'q.queue_id', 'q.room_id', 'r.room_name', 'r.room_number', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'pr.priority_id', 'pr.priority_color', 'sp.service_point_name')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .leftJoin('q4u_service_rooms as r', 'r.room_id', 'q.room_id')
            .where('q.date_serv', dateServ)
            .whereNot('q.is_cancel', 'Y')
            .limit(20)
            .orderBy('q.queue_id', 'desc');
        if (query == '') {
        }
        else {
            sql.where((w) => {
                w.orWhere('q.hn', 'like', _query)
                    .orWhere('p.first_name', 'like', _query)
                    .orWhere('p.last_name', 'like', _query)
                    .orWhereRaw(`REPLACE(q.queue_number,' ','') like '${_query}'`);
            });
        }
        return sql;
    }
    getAllQueuePending(db, dateServ, query = '') {
        query = query.replace(/'/g, '');
        const _query = `%${query}%`;
        const sql = db('q4u_queue as q')
            .select('q.queue_number', 'q.hn', 'q.vn', 'q.queue_id', 'q.room_id', 'r.room_name', 'r.room_number', 'q.date_serv', 'q.time_serv', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'pr.priority_id', 'pr.priority_color', 'sp.service_point_name', 'q.who_transfer_cancel')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .leftJoin('q4u_service_rooms as r', 'r.room_id', 'q.room_id')
            .where('q.date_serv', dateServ)
            .whereNot('q.mark_pending', 'Y')
            .whereNot('q.is_cancel', 'Y')
            .limit(20)
            .orderBy('q.queue_id', 'desc');
        if (query == '') {
        }
        else {
            sql.where((w) => {
                w.orWhere('q.hn', 'like', _query)
                    .orWhere('p.first_name', 'like', _query)
                    .orWhere('p.last_name', 'like', _query);
            });
        }
        return sql;
    }
    searchWorkingHistoryGroup(db, dateServ, limit, offset, servicePointId, query) {
        const _query = `%${query}%`;
        const sql = db('q4u_queue as q')
            .select('q.service_point_id', 'q.date_serv as queue_date', 'qgd.room_id', 'q.queue_number', 'q.queue_running', 'q.hn', 'q.vn', 'q.queue_id', 'q.queue_interview', 'q.date_serv', 'q.time_serv', 'q.date_update', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'pr.priority_id', 'pr.priority_color', 'r.room_name', 'r.room_number', 'sp.service_point_name')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_queue_group_detail as qgd', 'qgd.queue_id', 'q.queue_id')
            .innerJoin('q4u_service_rooms as r', 'r.room_id', 'qgd.room_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .where('q.date_serv', dateServ)
            .where('q.service_point_id', servicePointId)
            .whereNot('q.mark_pending', 'Y')
            .whereNot('q.is_cancel', 'Y')
            .where((w) => {
            w.where('q.hn', 'like', _query)
                .orWhere('q.queue_number', 'like', _query)
                .orWhere('p.first_name', 'like', _query)
                .orWhere('p.last_name', 'like', _query);
        })
            .limit(limit)
            .offset(offset)
            .orderBy('qgd.update_date', 'desc')
            .orderBy('qgd.queue_running', 'desc');
        return sql;
    }
    getWorkingHistoryGroup(db, dateServ, servicePointId) {
        const sql = db('q4u_queue as q')
            .select('q.service_point_id', 'q.date_serv as queue_date', 'qgd.room_id', 'q.queue_number', 'q.queue_running', 'q.hn', 'q.vn', 'q.queue_id', 'q.queue_interview', 'q.date_serv', 'q.time_serv', 'q.date_update', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'pr.priority_id', 'pr.priority_color', 'r.room_name', 'r.room_number', 'sp.service_point_name')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_queue_group_detail as qgd', 'qgd.queue_id', 'q.queue_id')
            .innerJoin('q4u_service_rooms as r', 'r.room_id', 'qgd.room_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .where('q.date_serv', dateServ)
            .where('q.service_point_id', servicePointId)
            .whereNot('q.mark_pending', 'Y')
            .whereNot('q.is_cancel', 'Y')
            .limit(10)
            .orderBy('qgd.update_date', 'desc')
            .orderBy('qgd.queue_running', 'desc');
        return sql;
    }
    getWorkingHistoryGroupTotal(db, dateServ, servicePointId) {
        const sql = db('q4u_queue as q')
            .select(db.raw('count(q.queue_id) as total'))
            .innerJoin('q4u_queue_group_detail as qgd', 'qgd.queue_id', 'q.queue_id')
            .where('q.date_serv', dateServ)
            .where('q.service_point_id', servicePointId)
            .whereNot('q.mark_pending', 'Y')
            .whereNot('q.is_cancel', 'Y');
        return sql;
    }
    getWorkingHistory(db, dateServ, servicePointId, query = '', prioityId = '') {
        const _query = `%${query}%`;
        const sql = db('q4u_queue as q')
            .select('q.service_point_id', 'q.date_serv as queue_date', 'q.room_id', 'q.queue_number', 'q.hn', 'q.vn', 'q.queue_id', 'q.queue_interview', 'q.date_serv', 'q.time_serv', 'q.date_update', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'pr.priority_id', 'pr.priority_color', 'r.room_name', 'r.room_number', 'sp.service_point_name', 'q.is_interview')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .innerJoin('q4u_service_rooms as r', 'r.room_id', 'q.room_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .where('q.date_serv', dateServ)
            .where('q.service_point_id', servicePointId)
            .where((w) => {
            w.orWhere('q.hn', 'like', _query)
                .orWhere('p.first_name', 'like', _query)
                .orWhere('p.last_name', 'like', _query)
                .orWhereRaw(`REPLACE(q.queue_number,' ','') like '${_query}'`);
        });
        if (prioityId != '') {
            sql.where('q.priority_id', prioityId);
        }
        sql.whereNot('q.mark_pending', 'Y')
            .whereNot('q.is_cancel', 'Y')
            .limit(10)
            .orderBy('q.date_update', 'desc');
        return sql;
    }
    getPending(db, dateServ, servicePointId, query = '', prioityId = '') {
        const _query = `%${query}%`;
        const sql = db('q4u_queue as q')
            .select('q.service_point_id', 'q.pending_to_service_point_id', 'q.date_serv as queue_date', 'q.room_id', 'q.queue_number', 'q.hn', 'q.vn', 'q.queue_id', 'q.queue_interview', 'q.date_serv', 'q.time_serv', 'q.date_update', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'pr.priority_id', 'pr.priority_color', 'r.room_name', 'r.room_id', 'r.room_number', 'sp.service_point_name', 'sp2.service_point_name as pending_to_service_point_name', 'sp.department_id', 'sp2.department_id as pending_to_department_id')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .leftJoin('q4u_service_rooms as r', 'r.room_id', 'q.room_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .leftJoin('q4u_service_points as sp2', 'sp2.service_point_id', 'q.pending_to_service_point_id')
            .where('q.date_serv', dateServ)
            .where('q.service_point_id', servicePointId)
            .where('q.mark_pending', 'Y')
            .where((w) => {
            w.where('q.hn', 'like', _query)
                .orWhere('q.queue_number', 'like', _query)
                .orWhere('p.first_name', 'like', _query)
                .orWhere('p.last_name', 'like', _query);
        });
        if (prioityId != '') {
            sql.where('q.priority_id', prioityId);
        }
        sql.whereNot('q.is_cancel', 'Y')
            .groupByRaw('q.service_point_id, q.date_serv, q.queue_number')
            .orderBy('q.queue_id', 'asc');
        return sql;
    }
    getPendingByDepartment(db, dateServ, departmentId) {
        return db('q4u_queue as q')
            .select('q.service_point_id', 'q.pending_to_service_point_id', 'q.date_serv as queue_date', 'q.room_id', 'q.queue_number', 'q.hn', 'q.vn', 'q.queue_id', 'q.queue_interview', 'q.date_serv', 'q.time_serv', 'q.date_update', 'p.title', 'p.first_name', 'p.last_name', 'p.birthdate', 'pr.priority_name', 'pr.priority_id', 'pr.priority_color', 'r.room_name', 'r.room_id', 'r.room_number', 'sp.service_point_name', 'sp2.service_point_name as pending_to_service_point_name')
            .innerJoin('q4u_person as p', 'p.hn', 'q.hn')
            .innerJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .leftJoin('q4u_service_rooms as r', 'r.room_id', 'q.room_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .leftJoin('q4u_service_points as sp2', 'sp2.service_point_id', 'q.pending_to_service_point_id')
            .where('q.date_serv', dateServ)
            .where('sp.department_id', departmentId)
            .where('q.mark_pending', 'Y')
            .whereNot('q.is_cancel', 'Y')
            .groupByRaw('q.service_point_id, q.date_serv, q.queue_number')
            .orderBy('q.queue_id', 'asc');
    }
    setQueueRoomNumber(db, queueId, roomId) {
        return db('q4u_queue')
            .where('queue_id', queueId)
            .update({ room_id: roomId });
    }
    setQueueGroupRoomNumber(db, queueId, roomId) {
        return db('q4u_queue')
            .whereIn('queue_id', queueId)
            .update({ room_id: roomId });
    }
    markUnPending(db, queueId) {
        return db('q4u_queue')
            .where('queue_id', queueId)
            .update({ mark_pending: 'N' });
    }
    markUnPendingGroup(db, queueId) {
        return db('q4u_queue')
            .whereIn('queue_id', queueId)
            .update({ mark_pending: 'N' });
    }
    markCancel(db, queueId) {
        return db('q4u_queue')
            .where('queue_id', queueId)
            .update({ is_cancel: 'Y' });
    }
    updateCurrentQueue(db, servicePointId, dateServ, queueId, roomId) {
        const sql = `
    INSERT INTO q4u_queue_detail(service_point_id, date_serv, queue_id, room_id)
    VALUES(?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE queue_id=?
    `;
        return db.raw(sql, [servicePointId, dateServ, queueId, roomId, queueId]);
    }
    updateCurrentQueueGroups(db, queues) {
        return db('q4u_queue_group_detail').insert(queues);
    }
    removeCurrentQueue(db, servicePointId, dateServ, queueId) {
        return db('q4u_queue_detail')
            .where('service_point_id', servicePointId)
            .where('date_serv', dateServ)
            .where('queue_id', queueId)
            .del();
    }
    removeCurrentQueueGroup(db, servicePointId, dateServ, queueId) {
        return db('q4u_queue_group_detail')
            .where('service_point_id', servicePointId)
            .where('date_serv', dateServ)
            .where('queue_id', queueId)
            .del();
    }
    removeCurrentQueueGroups(db, servicePointId, dateServ, roomId) {
        return db('q4u_queue_group_detail')
            .where('service_point_id', servicePointId)
            .where('date_serv', dateServ)
            .where('room_id', roomId)
            .del();
    }
    getCurrentVisitOnQueue(db, dateServ) {
        const sql = db('q4u_queue')
            .select('vn')
            .where('date_serv', dateServ);
        return sql;
    }
    markPending(db, queueId, servicePointId) {
        return db('q4u_queue')
            .where('queue_id', queueId)
            .update({ mark_pending: 'Y', pending_to_service_point_id: servicePointId });
    }
    getDuplicatedQueueInfo(db, queueId) {
        return db('q4u_queue as q')
            .select('q.*', 'sp.department_id')
            .join('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .where('q.queue_id', queueId)
            .limit(1);
    }
    getCurrentQueueList(db, dateServ) {
        const sql = `
    select a.*, r.room_name, r.room_number, q.queue_number, sp.service_point_name,
     p.title, p.first_name, p.last_name, p.hn,
    (
      select count(*) as total
      from q4u_queue as qx
      where qx.service_point_id=a.service_point_id
      and qx.room_id is null
      and qx.date_serv=?
      and qx.is_cancel != 'Y'
    ) as total
    from (
    select qd1.*
    from q4u_queue_detail as qd1
    left join q4u_queue_detail as qd2 on
    (qd1.service_point_id=qd2.service_point_id and qd1.update_date<qd2.update_date)
    where qd2.update_date is null
    ) as a
    left join q4u_service_rooms as r on r.room_id=a.room_id
    inner join q4u_queue as q on q.queue_id=a.queue_id
    inner join q4u_service_points as sp on sp.service_point_id=q.service_point_id
    inner join q4u_person as p on p.hn=q.hn
    where a.date_serv=?
    order by sp.service_point_name
    `;
        return db.raw(sql, [dateServ, dateServ]);
    }
    getPrintInfo(db, queueId) {
        const sql = `
    select q.hn, q.vn, q.queue_id, q.queue_interview, q.queue_number, q.queue_running, q.date_serv, q.time_serv,
    sp.service_point_name, sp.local_code, q.date_create, ps.first_name, ps.last_name,
    (select hosname from q4u_system limit 1) as hosname,
    (select hoscode from q4u_system limit 1) as hosid,
    (
      select count(*) from q4u_queue where queue_id<? and room_id is null
      and service_point_id=q.service_point_id and date_serv=q.date_serv
    ) as remain_queue, p.priority_name
    from q4u_queue as q
    inner join q4u_service_points as sp on sp.service_point_id=q.service_point_id
    inner join q4u_person as ps on ps.hn=q.hn
    left join q4u_priorities as p on p.priority_id=q.priority_id
    where q.queue_id=?
    `;
        return db.raw(sql, [queueId, queueId]);
    }
    getResponseQueueInfo(db, queueIds) {
        const sqlHospname = db('q4u_system').select('hosname').as('hosname');
        const sqlHoscode = db('q4u_system').select('hoscode').as('hosid');
        return db('q4u_queue as q')
            .select('q.hn', 'q.vn', 'q.queue_id', 'q.queue_number', 'q.queue_interview', 'q.queue_running', 'q.date_serv', 'sp.service_point_name', 'sp.local_code as service_point_code', 'q.date_create', 'sp.department_id', 'p.priority_name', 'p.priority_id', 'r.room_name', 'r.room_number', sqlHoscode, sqlHospname)
            .leftJoin('q4u_queue_group_detail as qg', 'qg.queue_id', 'q.queue_id')
            .innerJoin('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .leftJoin('q4u_priorities as p', 'p.priority_id', 'q.priority_id')
            .leftJoin('q4u_service_rooms as r', 'r.room_id', 'qg.room_id')
            .whereIn('q.queue_id', queueIds);
    }
    apiGetCurrentQueueByHN(db, hn, servicePointId) {
        return db('q4u_queue as q')
            .select('q.room_id', 'q.queue_id', 'q.queue_number', 'pr.priority_name', 'r.room_number')
            .leftJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .leftJoin('q4u_service_rooms as r', 'r.room_id', 'q.room_id')
            .where('q.hn', hn)
            .where('q.service_point_id', servicePointId)
            .orderBy('q.queue_id', 'DESC')
            .limit(1);
    }
    apiGetCurrentQueue(db, queueId) {
        return db('q4u_queue as q')
            .select('q.room_id', 'q.queue_id', 'q.queue_number', 'pr.priority_name', 'r.room_number')
            .leftJoin('q4u_priorities as pr', 'pr.priority_id', 'q.priority_id')
            .leftJoin('q4u_service_rooms as r', 'r.room_id', 'q.room_id')
            .where('q.queue_id', queueId)
            .orderBy('q.queue_id', 'DESC')
            .limit(1);
    }
    getCurrentQueue(db, hn) {
        return db('q4u_queue')
            .where('hn', hn)
            .orderBy('queue_id', 'DESC')
            .limit(1);
    }
    getVisitHistoryList(db, dateServe, servicePointId, query, limit, offset) {
        const _query = `%${query}%`;
        const sql = db('q4u_queue as q')
            .select('q.*', 'p.*', 's.local_code')
            .join('q4u_person as p', 'p.hn', 'q.hn')
            .join('q4u_service_points as s', 's.service_point_id', 'q.service_point_id')
            .where('q.date_serv', dateServe);
        if (servicePointId) {
            sql.where('q.service_point_id', servicePointId);
        }
        if (query) {
            sql.where((w) => {
                w.orWhere('p.first_name', 'like', _query)
                    .orWhere('p.last_name', 'like', _query)
                    .orWhere('q.hn', 'like', _query)
                    .orWhere('q.queue_number', 'like', _query);
            });
            const _arrQuery = query.split(' ');
            if (_arrQuery.length == 2) {
                sql.where((w) => {
                    w.orWhere('p.first_name', 'like', `%${_arrQuery[0]}%`)
                        .orWhere('p.last_name', 'like', `%${_arrQuery[1]}%`);
                });
            }
        }
        sql.orderBy('q.queue_id', 'DESC')
            .limit(limit)
            .offset(offset);
        return sql;
    }
    getVisitHistoryTotal(db, dateServe, servicePointId, query) {
        const _query = `%${query}%`;
        const sql = db('q4u_queue as q')
            .count('*').as('total')
            .join('q4u_person as p', 'p.hn', 'q.hn')
            .where('q.date_serv', dateServe);
        if (servicePointId) {
            sql.where('q.service_point_id', servicePointId);
        }
        if (query) {
            sql.where((w) => {
                w.orWhere('p.first_name', 'like', _query)
                    .orWhere('p.last_name', 'like', _query)
                    .orWhere('q.hn', 'like', _query)
                    .orWhere('q.queue_number', 'like', _query);
            });
            const _arrQuery = query.split(' ');
            if (_arrQuery.length == 2) {
                sql.where((w) => {
                    w.orWhere('p.first_name', 'like', `%${_arrQuery[0]}%`)
                        .orWhere('p.last_name', 'like', `%${_arrQuery[1]}%`);
                });
            }
        }
        return sql;
    }
    getNextQueue(db, servicePointId, dateServ, limit = 5) {
        return db('q4u_queue')
            .whereNull('room_id')
            .where('service_point_id', servicePointId)
            .where('date_serv', dateServ)
            .where('is_cancel', 'N')
            .where('is_completed', 'N')
            .whereNot('mark_pending', 'Y')
            .orderBy('queue_running', 'ASC')
            .limit(limit);
    }
    getNextQueueDepartment(db, departmentId, dateServ, limit = 5) {
        const sql = db('q4u_queue as q')
            .join('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .whereNull('q.room_id')
            .where('sp.department_id', departmentId)
            .where('q.date_serv', dateServ)
            .where('q.is_cancel', 'N')
            .where('q.is_completed', 'N')
            .whereNot('q.mark_pending', 'Y')
            .orderBy('q.queue_running', 'ASC')
            .limit(limit);
        return sql;
    }
    getNextQueueDepartmentER(db, departmentId, dateServ, limit = 5) {
        const sql = db('q4u_queue as q')
            .join('q4u_service_points as sp', 'sp.service_point_id', 'q.service_point_id')
            .join('q4u_priorities as qp', 'qp.priority_id', 'q.priority_id')
            .leftJoin('q4u_person as p', 'p.hn', 'q.hn')
            .whereNull('q.room_id')
            .where('sp.department_id', departmentId)
            .where('q.date_serv', dateServ)
            .where('q.is_cancel', 'N')
            .where('q.is_completed', 'N')
            .whereNot('q.mark_pending', 'Y')
            .select('q.*', 'p.first_name as fname', 'qp.priority_thai')
            .orderBy('qp.hosxp_priority', 'desc')
            .orderBy('q.queue_running', 'ASC')
            .limit(limit);
        return sql;
    }
    getTokenNHSO(db) {
        return db('q4u_nhso')
            .limit(1);
    }
}
exports.QueueModel = QueueModel;
//# sourceMappingURL=queue.js.map