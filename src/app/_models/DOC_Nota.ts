import { CLS_Iscrizione } from "./CLS_Iscrizione";
import { PER_Persona } from "./PER_Persone";

export interface DOC_Nota {
    id:                     number;
    iscrizioneID:           number;
    personaiD:              number;
    dtNota:                 string;
    periodo:                number;
    ckFirmato?:             boolean;
    dtFirma:                string;
    nota:                   string;


    note?:                  string;
    dtIns?:                 string;
    dtUpd?:                 string;
    userIns?:               number;
    userUpd?:               number;

    iscrizione?:            CLS_Iscrizione;
    persona?:               PER_Persona;

}

 