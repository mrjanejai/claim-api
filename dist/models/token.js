"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenModel = void 0;
class TokenModel {
    constructor() {
        this.tableName = 'q4u_tokens';
    }
    list(db) {
        return db(this.tableName);
    }
    find(db, token) {
        return db(this.tableName).where('token', token);
    }
    save(db, data) {
        return db(this.tableName).insert(data);
    }
    remove(db, token) {
        return db(this.tableName)
            .where('token', token)
            .del();
    }
}
exports.TokenModel = TokenModel;
//# sourceMappingURL=token.js.map