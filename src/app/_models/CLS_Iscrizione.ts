import { CLS_IscrizioneStato } from "./CLS_IscrizioneStato";

export interface CLS_Iscrizione {
        id:                   number;
        classeSezioneAnnoID:  number;
        alunnoID:             number;

        statoID:              number;
        dtIni:                string;
        dtEnd:                string;

        note:                 string;
        dtIns:                string;
        dtUpd:                string;
        userIns:              number;
        userUpd:              number;
        
        Stato:               CLS_IscrizioneStato;
}