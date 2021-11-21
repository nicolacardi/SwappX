import { ALU_Alunno } from "./ALU_Alunno";
import { ASC_AnnoScolastico } from "./ASC_AnnoScolastico";
import { PAG_Pagamento } from "./PAG_Pagamento";

export interface PAG_Retta {
       
        id:                     number,
        annoID:                 number,
        alunnoID:               number,
        alunno?:                ALU_Alunno;
        
        annoRetta:              number,
        meseRetta:              number,
        quotaDefault:           number,
        quotaConcordata:        number,
        
        note:                   string;
        dtIns:                  string;
        dtUpd:                  string;
        userIns:                number;
        userUpd:                number;

        pagamenti?:             PAG_Pagamento[];
        anno?:                  ASC_AnnoScolastico;
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


export interface PAG_RettePagamenti_Sum {
        id:                     number;
        annoRetta:              number;
        meseRetta:              number;

        importo:                number;
        quotaDefault:           number;
        quotaConcordata:        number;
}

