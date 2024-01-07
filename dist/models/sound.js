"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundModel = void 0;
class SoundModel {
    list(db) {
        return db('q4u_sounds').orderBy('sound_id');
    }
    updatePoint(db, servicePointId, data) {
        return db('q4u_service_points').where('service_point_id', servicePointId).update(data);
    }
    updateRoom(db, roomId, data) {
        return db('q4u_service_rooms').where('room_id', roomId).update(data);
    }
}
exports.SoundModel = SoundModel;
//# sourceMappingURL=sound.js.map