import * as knex from 'knex';

export class OappSlotModel {
    tableName: string = 'oapp_slot';
  
    list(db: knex) {
      return db(this.tableName).select('*');
    }
  
    save(db: knex, data: any) {
      return db(this.tableName).insert(data);
    }
  
    read(db: knex, id: any) {
      return db(this.tableName).where('id', id).first();
    }
  
    update(db: knex, id: any, data: any) {
      return db(this.tableName).where('id', id).update(data);
    }
  
    delete(db: knex, id: any) {
      return db(this.tableName).where('id', id).del();
    }
  }