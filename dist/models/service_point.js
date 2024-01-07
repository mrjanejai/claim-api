"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePointModel = void 0;
class ServicePointModel {
    constructor() {
        this.tableName = 'q4u_service_points';
    }
    list(db) {
        return db('q4u_service_points as sp')
            .select('sp.*', 'd.department_name', 's.sound_file')
            .leftJoin('q4u_departments as d', 'd.department_id', 'sp.department_id')
            .leftJoin('q4u_sounds as s', 's.sound_id', 'sp.sound_id')
            .orderBy('sp.service_point_name');
    }
    listKios(db) {
        return db('q4u_service_points as sp')
            .select('sp.*', 'd.department_name')
            .leftJoin('q4u_departments as d', 'd.department_id', 'sp.department_id')
            .where('sp.kios', 'Y')
            .orderBy('sp.service_point_name');
    }
    getServicePointIdFromLocalCode(db, localCode) {
        return db(this.tableName).select('service_point_id', 'department_id').where('local_code', localCode).limit(1);
    }
    getPrefix(db, servicePointId) {
        return db(this.tableName)
            .where('service_point_id', servicePointId)
            .limit(1);
    }
    getLocalCode(db) {
        return db(this.tableName).select('local_code');
    }
    getSound(db, servicePointId) {
        return db('q4u_service_points as sp')
            .join('q4u_sounds as s', 'sp.sound_id', 's.sound_id')
            .select('sp.sound_id', 'sp.sound_speed', 's.sound_file')
            .where('service_point_id', servicePointId);
    }
    getSoundList(db, servicePointId) {
        return db('q4u_service_points as sp')
            .select('sp.sound_id', 'sr.room_id', 's.sound_file')
            .join('q4u_service_rooms as sr', 'sr.service_point_id', 'sp.service_point_id')
            .join('q4u_sounds as s', 'sr.sound_id', 's.sound_id')
            .where('sp.service_point_id', servicePointId);
    }
    getSoundListDepartment(db, departmentId) {
        return db('q4u_service_points as sp')
            .select('sp.sound_id', 'sr.room_id', 's.sound_file')
            .join('q4u_service_rooms as sr', 'sr.service_point_id', 'sp.service_point_id')
            .join('q4u_sounds as s', 'sr.sound_id', 's.sound_id')
            .where('sp.department_id', departmentId);
    }
    save(db, data) {
        return db(this.tableName).insert(data);
    }
    update(db, servicePointId, data) {
        return db(this.tableName).where('service_point_id', servicePointId).update(data);
    }
    remove(db, servicePointId) {
        return db(this.tableName).where('service_point_id', servicePointId).del();
    }
}
exports.ServicePointModel = ServicePointModel;
//# sourceMappingURL=service_point.js.map