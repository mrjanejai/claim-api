import * as knex from 'knex';

export class LineJobsModel {
    tableName: string = 'line_jobs';
  
    list(db: knex) {
      return db(this.tableName).select('*');
    }
  
    save(db: knex, data: any) {
      return db(this.tableName).insert(data);
    }
  
    read(db: knex, id: any) {
      return db(this.tableName).where('job_id', id).first();
    }
  
    update(db: knex, id: any, data: any) {
      return db(this.tableName).where('job_id', id).update(data);
    }
  
    delete(db: knex, id: any) {
      return db(this.tableName).where('job_id', id).del();
    }
  }