import * as knex from 'knex';

export class ClIpdRepModel {
    tableName: string = 'cl_ipd_rep';

  
    list(db: knex) {
      return db(this.tableName).select('*');
    }

    save(db: knex, data: ExcelRep) {
      for (const key in data) {
          if (data.hasOwnProperty(key)) {
              const value = data[key];
              const correspondingValue = data[key]; // excelRep เป็นตัวแปรที่เก็บข้อมูลของอินเตอร์เฟซ ExcelRep
              console.log(`Data at index ${key} is ${value}, corresponding value in ExcelRep is ${correspondingValue}`);
              // ใช้ค่าที่ได้จาก data และ correspondingValue ในการดำเนินการที่ต้องการ
          }
      }
      return db(this.tableName).insert(data);
  }
  
  
    update(db: knex, repno: string,an: string, data: any) {
      return db(this.tableName).where('repno', repno).andWhere('an',an).update(data);
    }
  
    delete(db: knex, repno: string,an: string) {
      return db(this.tableName).where('repno', repno).andWhere('an',an).del();
    }

    findByRepNoAndAn(db: knex, repno: string, an: string) {
        return db(this.tableName).where('repno', repno).andWhere('an', an).first();
      }
  }

  export interface ExcelRep{
    repno: string;
    no?: string;
    tran_id?: string;
    hn?: string;
    an: string;
    pid?: string;
    fullname?: string;
    pttype?: string;
    visitdate?: string;
    dchdate?: string;
    total_nhso_pay?: string;
    total_agency_pay?: string;
    compen_from?: string;
    error_code?: string;
    main_funds?: string;
    sub_funds?: string;
    type_service?: string;
    referin?: string;
    has_pttype?: string;
    use_pttype?: string;
    chk?: string;
    hosmain?: string;
    subhos?: string;
    href?: string;
    hcode?: string;
    hmain?: string;
    prov1?: string;
    rg1?: string;
    hmain2?: string;
    prov2?: string;
    rg2?: string;
    dmis_hmain3?: string;
    da?: string;
    proj?: string;
    pa?: string;
    drg?: string;
    rw?: string;
    ca_type?: string;
    non_car_drg_ins?: string;
    car_drg_ins?: string;
    total_charge?: string;
    central_reimburse?: string;
    payment?: string;
    point?: string;
    delay_num?: string;
    delay_per?: string;
    ccuf?: string;
    adjrw_nhso?: string;
    adjrw2?: string;
    compensate?: string;
    act?: string;
    salary?: string;
    total_salary?: string;
    total_salary_cut?: string;
    iphc?: string;
    ophc?: string;
    opae?: string;
    ae_ipnb?: string;
    ae_ipuc?: string;
    ae_ip3sss?: string;
    ae_ip7sss?: string;
    ae_carae?: string;
    ae_caref?: string;
    ae_caref_puc?: string;
    opinst?: string;
    inst?: string;
    ipaec?: string;
    ipaer?: string;
    ipinrgc?: string;
    ipinrgr?: string;
    ipinspsn?: string;
    ipprcc?: string;
    ipprcc_puc?: string;
    ipbkk_inst?: string;
    ip_ontop?: string;
    dmis_cataract?: string;
    dmis_ssj?: string;
    dmis_hos?: string;
    dmis_catinst?: string;
    dmis_dmisrc?: string;
    dmis_dmisrc2?: string;
    dmis_rcuhosc?: string;
    dmis_rcuhosc2?: string;
    dmis_rcuhosr?: string;
    dmis_rcuhosr2?: string;
    dmis_llop?: string;
    dmis_llrgc?: string;
    dmis_llrgr?: string;
    dmis_lp?: string;
    dmis_stroke_stemi_drug?: string;
    dmis_dmidml?: string;
    dmis_pp?: string;
    dmis_dmishd?: string;
    dmis_dmicnt?: string;
    dmis_paliative_care?: string;
    dmis_dm?: string;
    drug?: string;
    opbkk_hc?: string;
    opbkk_dent?: string;
    opbkk_drug?: string;
    opbkk_fs?: string;
    opbkk_others?: string;
    deny_hc?: string;
    deny_ae?: string;
    deny_inst?: string;
    deny_ip?: string;
    deny_dmis?: string;
    base_rate?: string;
    base_rate_extra?: string;
    base_rate_total?: string;
    fs?: string;
    va?: string;
    remark?: string;
  }
  