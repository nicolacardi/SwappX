import { ASC_AnnoScolastico } from './ASC_AnnoScolastico';
import { CLS_ClasseSezione } from './CLS_ClasseSezione';


export interface CLS_ClasseSezioneAnno {
        id:                       number;
        sezione:                  string;
        classeSezione:            CLS_ClasseSezione;
        classeSezioneAnnoSucc:    CLS_ClasseSezioneAnno;
        anno:                     ASC_AnnoScolastico;
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

