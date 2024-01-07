"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRoomModel = void 0;
class ServiceRoomModel {
    constructor() {
        this.tableName = 'q4u_service_rooms';
    }
    list(db, servicePointId) {
        return db('q4u_service_rooms as sr')
            .select('sr.*', 'sp.sound_id as service_point_sound_id')
            .join('q4u_service_points as sp', 'sp.service_point_id', 'sr.service_point_id')
            .where('sr.service_point_id', servicePointId)
            .orderBy('sr.room_number', 'asc');
    }
    info(db, roomId) {
        return db(this.tableName)
            .where('room_id', roomId);
    }
    save(db, data) {
        return db(this.tableName).insert(data);
    }
    update(db, serviceRoomId, data) {
        return db(this.tableName).where('room_id', serviceRoomId).update(data);
    }
    remove(db, serviceRoomId) {
        return db(this.tableName).where('room_id', serviceRoomId).del();
    }
}
exports.ServiceRoomModel = ServiceRoomModel;
//# sourceMappingURL=service_room.js.map