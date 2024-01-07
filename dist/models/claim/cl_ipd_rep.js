"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClIpdRepModel = void 0;
class ClIpdRepModel {
    constructor() {
        this.tableName = 'cl_ipd_rep';
    }
    list(db) {
        return db(this.tableName).select('*');
    }
    save(db, data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                const correspondingValue = data[key];
                console.log(`Data at index ${key} is ${value}, corresponding value in ExcelRep is ${correspondingValue}`);
            }
        }
        return db(this.tableName).insert(data);
    }
    update(db, repno, an, data) {
        return db(this.tableName).where('repno', repno).andWhere('an', an).update(data);
    }
    delete(db, repno, an) {
        return db(this.tableName).where('repno', repno).andWhere('an', an).del();
    }
    findByRepNoAndAn(db, repno, an) {
        return db(this.tableName).where('repno', repno).andWhere('an', an).first();
    }
}
exports.ClIpdRepModel = ClIpdRepModel;
//# sourceMappingURL=cl_ipd_rep.js.map