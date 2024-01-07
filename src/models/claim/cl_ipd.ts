import * as knex from 'knex';

export class ClIpdModel {
    tableName: string = 'cl_ipd';
  
    list(db: knex) {
      return db(this.tableName).select('*');
    }
  
    create(db: knex, data: any) {
      return db(this.tableName).insert(data);
    }
  
    read(db: knex, an: number) {
      return db(this.tableName).where('an', an).first();
    }
  
    update(db: knex, an: number, data: any) {
      return db(this.tableName).where('an', an).update(data);
    }
  
    delete(db: knex, an: number) {
      return db(this.tableName).where('an', an).del();
    }
  }
  