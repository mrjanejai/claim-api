"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
class UserModel {
    constructor() {
        this.tableName = 'q4u_users';
    }
    list(db) {
        return db(this.tableName)
            .select('user_id', 'username', 'fullname', 'is_active', 'user_type');
    }
    login(db, username, password) {
        return db(this.tableName)
            .select('fullname', 'user_id', 'user_type')
            .where({
            username: username,
            password: password,
            is_active: 'Y'
        });
    }
    save(db, user) {
        return db(this.tableName).insert(user);
    }
    update(db, userId, info) {
        return db(this.tableName)
            .where('user_id', userId)
            .update(info);
    }
    remove(db, userId) {
        return db(this.tableName)
            .where('user_id', userId)
            .del();
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=user.js.map