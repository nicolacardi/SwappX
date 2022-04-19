import { CLS_Classe } from "./CLS_Classe";
import { CLS_ClasseAnnoMateria } from "./CLS_ClasseAnnoMateria";
import { CLS_ClasseSezioneAnno } from "./CLS_ClasseSezioneAnno";
import { CLS_Iscrizione } from "./CLS_Iscrizione";
import { MAT_Materia } from "./MAT_Materia";

export interface DOC_PagellaVoto {
        id:                     number;
        iscrizioneID:           number;                 //ATTENZIONE: da modificare il legame! (DOC_Pagella)
        materiaID:              number;

        ckFrequenza:            boolean;
        ckAmmesso:              boolean;
        voto1?:                 number;
        voto2?:                 number;

        dt1:                    string;
        dt2:                    string;
        tipoGiudizio1ID?:       number;
        tipoGiudizio2ID?:       number;
        n_assenze1:             number;
        n_assenze2:             number;

        note1?:                 string;
        note2?:                 string;

        dtIns?:                  string;
        dtUpd?:                  string;
        userIns?:                number;
        userUpd?:                number;

        materia?:               MAT_Materia;
        iscrizione?:            CLS_Iscrizione
        tipoGiudizio1?:         DOC_TipoGiudizio;
        tipoGiudizio2?:         DOC_TipoGiudizio; 

        classeAnnoMateria:      CLS_ClasseAnnoMateria;
}

export interface DOC_TipoGiudizio {
        id:                     number;
        descrizione:           number;
        descrizione2:              number;
}




