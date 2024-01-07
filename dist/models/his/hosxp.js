"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HosxpModel = void 0;
class HosxpModel {
    testConnection(db) {
        return db.raw(`select 'Q4U Work'`);
    }
    getPatientInfo(db, cid) {
        return db('patient')
            .select('hn', 'fname as first_name', 'pname as title', 'sex', 'lname as last_name', 'birthday as birthdate')
            .where('cid', cid).limit(1);
    }
    getPatientInfoWithHN(db, hn) {
        return db('patient')
            .select('hn', 'cid', 'fname as first_name', 'pname as title', 'sex', 'lname as last_name', 'birthday as birthdate')
            .where('hn', hn).limit(1);
    }
    getPatientInfoWithHNAndCid(db, hn, cid) {
        return db('patient')
            .select('hn', 'cid', 'fname as first_name', 'pname as title', 'sex', 'lname as last_name', 'birthday as birthdate', 'mobile_phone_number as phone')
            .where('hn', hn)
            .andWhere('cid', cid)
            .limit(1);
    }
    getCurrentVisit(db, hn) {
        return db('vn_stat as v')
            .select('v.vstdate', 'o.vsttime', 'v.hn', 'p.pname as title', 'p.fname as first_name', 'p.lname as last_name')
            .leftJoin('ovst as o', 'o.vn', 'v.vn')
            .leftJoin('spclty as s', 's.spclty', 'v.spclty')
            .leftJoin('kskdepartment as k', 'k.depcode', 'o.cur_dep')
            .leftJoin('patient as p', 'p.hn', 'v.hn')
            .whereRaw('v.vstdate = CURDATE()')
            .where('v.hn', hn);
    }
    getAppointInfo(db, hn) {
        return db('oapp as o')
            .select(db.raw(` ksk.department , d.NAME as doctor  , o.note , opduser.name as staff_app  `))
            .leftJoin('kskdepartment as ksk', 'ksk.depcode', 'o.depcode')
            .leftJoin('doctor as d', 'd.code', 'o.doctor')
            .leftJoin('opduser', 'opduser.loginname', 'o.app_user')
            .whereRaw('o.nextdate = CURDATE()')
            .where('o.hn', hn);
    }
    getHISQueue(db, hn, dateServ) {
        return db('ovst')
            .select('oqueue as queue')
            .where('hn', hn)
            .where('vstdate', dateServ)
            .orderBy('vn', 'DESC')
            .limit(1);
    }
    getVisitList(db, dateServ, localCode, vn, servicePointCode, query, limit = 20, offset = 0) {
        var sql = db('ovst as o')
            .select('o.vn', 'o.hn', db.raw('o.vstdate as date_serv'), db.raw('o.vsttime as time_serv'), 'o.main_dep as clinic_code', 'k.department as clinic_name', 'pt.pname as title', 'pt.fname as first_name', 'pt.lname as last_name', 'pt.birthday as birthdate', 'pt.sex as sex', 'o.main_dep_queue as his_queue')
            .innerJoin('patient as pt', 'pt.hn', 'o.hn')
            .innerJoin('kskdepartment as k', 'k.depcode', 'o.main_dep')
            .where('o.vstdate', dateServ)
            .whereIn('o.main_dep', localCode)
            .whereNotIn('o.vn', vn);
        if (query) {
            var _arrQuery = query.split(' ');
            var firstName = null;
            var lastName = null;
            if (_arrQuery.length === 2) {
                firstName = `${_arrQuery[0]}%`;
                lastName = `${_arrQuery[1]}%`;
            }
            sql.where(w => {
                var _where = w.where('o.hn', query);
                if (firstName && lastName) {
                    _where.orWhere(x => x.where('pt.fname', 'like', firstName).where('pt.lname', 'like', lastName));
                }
                return _where;
            });
        }
        else {
            if (servicePointCode) {
                sql.where('o.main_dep', servicePointCode);
            }
        }
        return sql.limit(limit)
            .offset(offset)
            .orderBy('o.vsttime', 'asc');
    }
    getVisitTotal(db, dateServ, localCode, vn, servicePointCode, query) {
        var sql = db('ovst as o')
            .select(db.raw('count(*) as total'))
            .innerJoin('patient as pt', 'pt.hn', 'o.hn')
            .innerJoin('kskdepartment as k', 'k.depcode', 'o.main_dep')
            .where('o.vstdate', dateServ)
            .whereIn('o.main_dep', localCode)
            .whereNotIn('o.vn', vn);
        if (query) {
            var _arrQuery = query.split(' ');
            var firstName = null;
            var lastName = null;
            if (_arrQuery.length === 2) {
                firstName = `${_arrQuery[0]}%`;
                lastName = `${_arrQuery[1]}%`;
            }
            sql.where(w => {
                var _where = w.where('o.hn', query);
                if (firstName && lastName) {
                    _where.orWhere(x => x.where('pt.fname', 'like', firstName).where('pt.lname', 'like', lastName));
                }
                return _where;
            });
        }
        else {
            if (servicePointCode) {
                sql.where('o.main_dep', servicePointCode);
            }
        }
        return sql;
    }
    getVisitHistoryList(db, dateServ, localCode, vn, servicePointCode, query, limit = 20, offset = 0) {
        var sql = db('ovst as o')
            .select('o.vn', 'o.hn', db.raw('o.vstdate as date_serv'), db.raw('o.vsttime as time_serv'), 'o.main_dep as clinic_code', 'k.department as clinic_name', 'pt.pname as title', 'pt.fname as first_name', 'pt.lname as last_name', 'pt.birthday as birthdate', 'pt.sex as sex', 'o.main_dep_queue as his_queue')
            .innerJoin('patient as pt', 'pt.hn', 'o.hn')
            .innerJoin('kskdepartment as k', 'k.depcode', 'o.main_dep')
            .where('o.vstdate', dateServ)
            .whereIn('o.main_dep', localCode)
            .whereIn('o.vn', vn);
        if (query) {
            var _arrQuery = query.split(' ');
            var firstName = null;
            var lastName = null;
            if (_arrQuery.length === 2) {
                firstName = `${_arrQuery[0]}%`;
                lastName = `${_arrQuery[1]}%`;
            }
            sql.where(w => {
                var _where = w.where('o.hn', query);
                if (firstName && lastName) {
                    _where.orWhere(x => x.where('pt.fname', 'like', firstName).where('pt.lname', 'like', lastName));
                }
                return _where;
            });
        }
        else {
            if (servicePointCode) {
                sql.where('o.main_dep', servicePointCode);
            }
        }
        return sql.limit(limit)
            .offset(offset)
            .orderBy('o.vsttime', 'asc');
    }
    getVisitHistoryTotal(db, dateServ, localCode, vn, servicePointCode, query) {
        var sql = db('ovst as o')
            .select(db.raw('count(*) as total'))
            .innerJoin('patient as pt', 'pt.hn', 'o.hn')
            .innerJoin('kskdepartment as k', 'k.depcode', 'o.main_dep')
            .where('o.vstdate', dateServ)
            .whereIn('o.main_dep', localCode)
            .whereIn('o.vn', vn);
        if (query) {
            var _arrQuery = query.split(' ');
            var firstName = null;
            var lastName = null;
            if (_arrQuery.length === 2) {
                firstName = `${_arrQuery[0]}%`;
                lastName = `${_arrQuery[1]}%`;
            }
            sql.where(w => {
                var _where = w.where('o.hn', query);
                if (firstName && lastName) {
                    _where.orWhere(x => x.where('pt.fname', 'like', firstName).where('pt.lname', 'like', lastName));
                }
                return _where;
            });
        }
        else {
            if (servicePointCode) {
                sql.where('o.main_dep', servicePointCode);
            }
        }
        return sql;
    }
}
exports.HosxpModel = HosxpModel;
//# sourceMappingURL=hosxp.js.map