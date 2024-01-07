"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentModel = void 0;
class DepartmentModel {
    constructor() {
        this.tableName = 'q4u_departments';
    }
    list(db) {
        return db(this.tableName).orderBy('department_name');
    }
    save(db, data) {
        return db(this.tableName).insert(data);
    }
    update(db, departmentId, data) {
        return db(this.tableName).where('department_id', departmentId).update(data);
    }
    remove(db, departmentId) {
        return db(this.tableName).where('department_id', departmentId).del();
    }
}
exports.DepartmentModel = DepartmentModel;
//# sourceMappingURL=department.js.map