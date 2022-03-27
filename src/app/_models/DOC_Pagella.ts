import { CLS_Iscrizione } from "./CLS_Iscrizione";
import { MAT_Materia } from "./MAT_Materia";

export interface DOC_Pagella {
        id:                     number;
        iscrizioneID:           number;
        materiaID:              number;

        ckFrequenza:            boolean;
        ckAmmesso:              boolean;
        votoFinale:             string;
        dt1:                    string;
        dt2:                    string;
        giudizio1:              string;
        giudizio2:              string;
        n_assenze1:             number;
        n_assenze2:             number;

        note:                   string;
        dtIns:                  string;
        dtUpd:                  string;
        userIns:                number;
        userUpd:                number;

        materia:                MAT_Materia;
        iscrizione:             CLS_Iscrizione;
}



