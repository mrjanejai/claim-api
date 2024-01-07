"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OappSlotModel = void 0;
class OappSlotModel {
    constructor() {
        this.tableName = 'oapp_slot';
    }
    list(db) {
        return db(this.tableName).select('*');
    }
    save(db, data) {
        return db(this.tableName).insert(data);
    }
    read(db, id) {
        return db(this.tableName).where('id', id).first();
    }
    update(db, id, data) {
        return db(this.tableName).where('id', id).update(data);
    }
    delete(db, id) {
        return db(this.tableName).where('id', id).del();
    }
}
exports.OappSlotModel = OappSlotModel;
//# sourceMappingURL=oapp_slot.js.map