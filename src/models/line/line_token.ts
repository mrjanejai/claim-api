import * as knex from 'knex';

export class LineTokenModel {
    tableName: string = 'line_token';
  
    list(db: knex) {
      return db(this.tableName).select('*');
    }
  
    save(db: knex, data: any) {
      return db(this.tableName).insert(data);
    }
  
    read(db: knex, id: any) {
      return db(this.tableName).where('token_id', id).first();
    }
  
    update(db: knex, id: any, data: any) {
      return db(this.tableName).where('token_id', id).update(data);
    }
  
    delete(db: knex, id: any) {
      return db(this.tableName).where('token_id', id).del();
    }
  }