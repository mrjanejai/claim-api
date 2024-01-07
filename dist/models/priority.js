"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityModel = void 0;
class PriorityModel {
    constructor() {
        this.tableName = 'q4u_priorities';
    }
    list(db) {
        return db(this.tableName).orderBy('priority_name');
    }
    getPrefix(db, priorityId) {
        return db(this.tableName)
            .select('priority_prefix')
            .where('priority_id', priorityId).limit(1);
    }
    save(db, data) {
        return db(this.tableName).insert(data);
    }
    update(db, priorityId, data) {
        return db(this.tableName).where('priority_id', priorityId).update(data);
    }
    remove(db, priorityId) {
        return db(this.tableName).where('priority_id', priorityId).del();
    }
}
exports.PriorityModel = PriorityModel;
//# sourceMappingURL=priority.js.map