"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemModel = void 0;
class SystemModel {
    getInfo(db) {
        return db('q4u_system').select();
    }
}
exports.SystemModel = SystemModel;
//# sourceMappingURL=system.js.map