import { CLS_Classe } from './CLS_Classe';

export interface CLS_ClasseSezione {
        id:                   number;
        classeID:             number;
        sezione:              string;

        classe:               CLS_Classe;
}


/*
  {
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
  }
*/ 