"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomcModel = void 0;
class HomcModel {
    testConnection(db) {
        return db.raw(`select 'Q4U Work'`);
    }
    getVisitList(db, dateServ, localCode, vn, servicePointCode, limit = 20, offset = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield db.raw(`select top '${limit}' o.regNo as vn, o.hn, convert(date,convert(char,o.registDate -5430000)) as date_serv, 
        substring(o.timePt,1,2)+':'+substring(o.timePt,3,2) as time_serv, 
        d.deptCode as clinic_code, rtrim(d1.deptDesc) as clinic_name, rtrim(t.titleName) as title, 
        rtrim(p.firstName) as first_name, rtrim(p.lastName) as last_name, p.birthDay as birthdate, 
        case when t.sex='ช' then 'ชาย' else 'หญิง' end as sex, '' as his_queue 
        from OPD_H as o 
        inner join PATIENT as p on p.hn = o.hn 
        inner join PTITLE as t on t.titleCode = p.titleCode 
        inner join Deptq_d as d on d.hn = o.hn and d.regNo=o.regNo
        inner join DEPT as d1 on d1.deptCode = d.deptCode 
        where convert(date,convert(char,o.registDate -5430000))='${dateServ}' and d.deptCode = '${servicePointCode}' order by o.registDate asc`);
            return data;
        });
    }
    getCurrentVisit(db, hn) {
        return [];
    }
    getVisitTotal(db, dateServ, localCode, vn, servicePointCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield db.raw(`select count(*) as total from OPD_H as o 
        inner join PATIENT as p on p.hn = o.hn 
        inner join PTITLE as t on t.titleCode = p.titleCode 
        inner join Deptq_d as d on d.hn = o.hn and d.regNo=o.regNo
        inner join DEPT as d1 on d1.deptCode = d.deptCode where convert(date,convert(char,o.registDate -5430000))= '${dateServ}' 
        and d.deptCode = '${servicePointCode}' group by convert(date,convert(char,o.registDate -5430000))`);
            console.log(servicePointCode);
            return data;
        });
    }
}
exports.HomcModel = HomcModel;
//# sourceMappingURL=homc.js.map