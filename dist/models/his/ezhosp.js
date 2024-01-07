"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EzhospModel = void 0;
class EzhospModel {
    getPatientInfo(db, cid) {
        return db('patient')
            .select('hn', 'name as first_name', 'title', 'sex', 'surname as last_name', 'birth as birthdate')
            .where('no_card', cid).limit(1);
    }
    getPatientInfoWithHN(db, hn) {
        return db('patient')
            .select('hn', 'name as first_name', 'title', 'sex', 'surname as last_name', 'birth as birthdate')
            .where('hn', hn).limit(1);
    }
    getCurrentVisit(db, hn) {
        return [];
    }
    getVisitList(db, dateServ, localCode, vn, servicePointCode, query, limit = 20, offset = 0) {
        var sql = db('view_opd_visit as o')
            .select('o.vn', 'o.hn', db.raw('o.date as date_serv'), db.raw('o.time as time_serv'), 'o.dep as clinic_code', 'o.dep_name as clinic_name', 'o.title', 'o.name as first_name', 'o.surname as last_name', 'o.birth as birthdate', 'o.sex', 'o.queue as his_queue')
            .where('o.date', dateServ)
            .whereIn('o.dep', localCode)
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
                    _where.orWhere(x => x.where('o.name', 'like', firstName).where('o.surname', 'like', lastName));
                }
                return _where;
            });
        }
        else {
            if (servicePointCode) {
                sql.where('o.dep', servicePointCode);
            }
        }
        return sql.limit(limit)
            .offset(offset)
            .orderBy('o.time', 'asc');
    }
    getVisitTotal(db, dateServ, localCode, vn, servicePointCode, query) {
        var sql = db('opd_visit as o')
            .select(db.raw('count(1) as total'))
            .where('o.date', dateServ)
            .whereIn('o.dep', localCode)
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
                    _where.orWhere(x => x.where('o.name', 'like', firstName).where('o.surname', 'like', lastName));
                }
                return _where;
            });
        }
        else {
            if (servicePointCode) {
                sql.where('o.dep', servicePointCode);
            }
        }
        return sql.orderBy('o.dep', 'asc');
    }
    getVisitHistoryList(db, dateServ, localCode, vn, servicePointCode, query, limit = 20, offset = 0) {
        var sql = db('view_opd_visit as o')
            .select('o.vn', 'o.hn', db.raw('o.date as date_serv'), db.raw('o.time as time_serv'), 'o.dep as clinic_code', 'o.dep_name as clinic_name', 'o.title', 'o.name as first_name', 'o.surname as last_name', 'o.birth as birthdate', 'o.sex', 'o.queue as his_queue')
            .where('o.date', dateServ)
            .whereIn('o.dep', localCode)
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
                    _where.orWhere(x => x.where('o.name', 'like', firstName).where('o.surname', 'like', lastName));
                }
                return _where;
            });
        }
        else {
            if (servicePointCode) {
                sql.where('o.dep', servicePointCode);
            }
        }
        return sql.limit(limit)
            .offset(offset)
            .orderBy('o.time', 'asc');
    }
    getVisitHistoryTotal(db, dateServ, localCode, vn, servicePointCode, query) {
        var sql = db('opd_visit as o')
            .select(db.raw('count(1) as total'))
            .where('o.date', dateServ)
            .whereIn('o.dep', localCode)
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
                    _where.orWhere(x => x.where('o.name', 'like', firstName).where('o.surname', 'like', lastName));
                }
                return _where;
            });
        }
        else {
            if (servicePointCode) {
                sql.where('o.dep', servicePointCode);
            }
        }
        return sql.orderBy('o.dep', 'asc');
    }
}
exports.EzhospModel = EzhospModel;
//# sourceMappingURL=ezhosp.js.map