import { ALU_Alunno }                           from "./ALU_Alunno";
import { CLS_ClasseSezioneAnno }                from "./CLS_ClasseSezioneAnno";
import { CLS_IscrizioneStato }                  from "./CLS_IscrizioneStato";
import { DOC_Pagella }                          from "./DOC_Pagella";

export interface CLS_Iscrizione {
        id:                                     number;
        classeSezioneAnnoID:                    number;
        alunnoID:                               number;

        statoID:                                number;
        dtIni:                                  string;
        dtEnd:                                  string;

        note:                                   string;
        dtIns:                                  string;
        dtUpd:                                  string;
        userIns:                                number;
        userUpd:                                number;
        
        stato:                                  CLS_IscrizioneStato;               
        alunno:                                 ALU_Alunno;
        classeSezioneAnno:                      CLS_ClasseSezioneAnno;

        _Pagelle1:                              DOC_Pagella[];
        _Pagelle2:                              DOC_Pagella[];
}