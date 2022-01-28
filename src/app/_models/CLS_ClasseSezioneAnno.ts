import { ASC_AnnoScolastico } from './ASC_AnnoScolastico';
import { CLS_ClasseSezione } from './CLS_ClasseSezione';


export interface CLS_ClasseSezioneAnno {
        id:                       number;
        sezione:                  string;

        classeSezione:            CLS_ClasseSezione;
        ClasseSezioneAnnoSucc:    CLS_ClasseSezioneAnno;
        anno:                     ASC_AnnoScolastico;   //FORSE VA MINUSCOLO??
        numAlunni:                number;
}


export interface CLS_ClasseSezioneAnno_Sum {
        id:                     number;
        classe:                 string;
        sezione:                string;
        anno:                   string; 
        numAlunni:              number;
        numMaschi:              number;
        numFemmine:             number;
}

export interface CLS_ClasseSezioneAnno_Query {
        id:                     number;
        classeSezioneID:        number;

        descrizioneBreve:       string;
        descrizione2:           string; 
        sezione:                string;
        importo:                number;
        importo2:               number;

        annoID:                 number;
        anno1:                  number;
        anno2:                  number;
        annoScolastico:         string;

        sezioneAnnoSucc:        string;
        descrizione2AnnoSucc:   string;

        numAlunni:              number;
        numMaschi:              number;
        numFemmine:             number;
}
