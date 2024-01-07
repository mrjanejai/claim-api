"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClIpdModel = void 0;
class ClIpdModel {
    constructor() {
        this.tableName = 'cl_ipd';
    }
    list(db) {
        return db(this.tableName).select('*');
    }
    create(db, data) {
        return db(this.tableName).insert(data);
    }
    read(db, an) {
        return db(this.tableName).where('an', an).first();
    }
    update(db, an, data) {
        return db(this.tableName).where('an', an).update(data);
    }
    delete(db, an) {
        return db(this.tableName).where('an', an).del();
    }
}
exports.ClIpdModel = ClIpdModel;
//# sourceMappingURL=cl_ipd.js.map