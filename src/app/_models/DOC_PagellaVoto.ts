import { CLS_ClasseAnnoMateria } from "./CLS_ClasseAnnoMateria";
import { CLS_Iscrizione } from "./CLS_Iscrizione";
import { MAT_Materia } from "./MAT_Materia";

export interface DOC_PagellaVoto {
        id?:                     number;
        pagellaID?:              number;
        materiaID:              number;

        ckFrequenza:            boolean;
        ckAmmesso:              boolean;
        voto?:                  number;
        dtVoto:                 string;
        tipoGiudizioID?:        number;
        n_assenze:              number;

        note?:                  string;

        dtIns?:                 string;
        dtUpd?:                 string;
        userIns?:               number;
        userUpd?:               number;

        tipoVotoID?:            number;


        materia?:               MAT_Materia;
        iscrizione?:            CLS_Iscrizione
        tipoGiudizio?:          DOC_TipoGiudizio;

        //classeAnnoMateria?:      CLS_ClasseAnnoMateria;
}

export interface DOC_TipoGiudizio {
        id:                     number;
        descrizione:            number;
        descrizione2:           number;
}




