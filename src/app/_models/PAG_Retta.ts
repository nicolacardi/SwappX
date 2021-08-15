import { ALU_Alunno } from "./ALU_Alunno";

export interface PAG_Retta {
        id:                     number,
        annoID:                 number,
        alunnoID:               number,
        alunno:                 ALU_Alunno;
        
        anno:                   number,
        mese:                   number,
        quotaDefault:           number,
        quotaConcordata:        number,
        
        note:                   string;
        dtIns:                  string;
        dtUpd:                  string;
        userIns:                number;
        userUpd:                number;
}

// "id": 4,
// "annoID": 1,
// "alunnoID": 3,
// "anno": 2019,
// "mese": 10,
// "quotaDefault": 300,
// "quotaConcordata": 280,
// "note": null,
// "dtIns": "2021-07-01T00:00:00",
// "dtUpd": null,
// "userIns": 1,
// "userUpd": null