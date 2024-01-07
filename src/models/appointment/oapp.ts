import * as knex from 'knex';

export class OappModel {
    tableName: string = 'oapp';
  
    list(db: knex) {
      return db(this.tableName).select('*');
    }
  
    save(db: knex, data: any) {
      return db(this.tableName).insert(data);
    }
  
    read(db: knex, oappId: any) {
      return db(this.tableName).where('oapp_id', oappId).first();
    }
  
    update(db: knex, oappId: any, data: any) {
      return db(this.tableName).where('oapp_id', oappId).update(data);
    }
  
    delete(db: knex, oappId: any) {
      return db(this.tableName).where('oapp_id', oappId).del();
    }
  }