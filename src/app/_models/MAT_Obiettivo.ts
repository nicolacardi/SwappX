import { CLS_ClasseSezioneAnno } from "./CLS_ClasseSezioneAnno";
import { MAT_Materia } from "./MAT_Materia";

export interface MAT_Obiettivo {
        id:                     number;
        classeSezioneAnnoID:    number;
        materiaID:              number;
        titolo:                 string;
        descrizione:            string;

        materia?:               MAT_Materia;
        classeSezioneAnno?:     CLS_ClasseSezioneAnno        
}
