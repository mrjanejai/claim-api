"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OappModel = void 0;
class OappModel {
    constructor() {
        this.tableName = 'oapp';
    }
    list(db) {
        return db(this.tableName).select('*');
    }
    save(db, data) {
        return db(this.tableName).insert(data);
    }
    read(db, oappId) {
        return db(this.tableName).where('oapp_id', oappId).first();
    }
    update(db, oappId, data) {
        return db(this.tableName).where('oapp_id', oappId).update(data);
    }
    delete(db, oappId) {
        return db(this.tableName).where('oapp_id', oappId).del();
    }
}
exports.OappModel = OappModel;
//# sourceMappingURL=oapp.js.map