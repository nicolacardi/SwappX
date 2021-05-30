import { ASC_AnnoScolastico } from './ASC_AnnoScolastico';

export interface CLS_Classe {
  descrizioneBreve:     string;
  descrizione:          string;
  descrizione2:         string;
}

export interface CLS_ClasseSezione {
  classeId:             number;
  sezione:              string;
  classe:               CLS_Classe;
}

export interface CLS_ClasseSezioneAnno {
        id:                   number;
        sezione:              string;
        // descrizioneBreve:     string;
        // descrizione:          string;
        classeSezione:        CLS_ClasseSezione;
        anno:                 ASC_AnnoScolastico;
}

/*
 {
"id": 1,
"classeSezioneID": 1,
"annoID": 1,
"classeSezione": {
"id": 1,
"classeID": 1,
"sezione": "A",
"classe": {
"id": 1,
"tipoID": 3,
"descrizioneBreve": "I",
"descrizione": "Prima",
"descrizione2": "Prima Elementare",
"seq": 1,
"tipo": null
}
},
"anno": {
"id": 1,
"anno1": 2019,
"anno2": 2020,
"annoscolastico": "2019-20",
"iD_annoscolasticoPrec": 0,
"dtInizio": "2019-09-15T00:00:00",
"dtFine": "2020-06-15T00:00:00",
"dtFineQ1": "2020-02-01T00:00:00",
"_ClassiSezioniAnni": []
}
},
*/ 