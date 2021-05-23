export interface CLS_Classe {
  descrizioneBreve:     string;
  descrizione:          string;
  descrizione2:          string;
}

export interface CLS_ClasseSezione {
        id:                   number;
        sezione:              string;
        // descrizioneBreve:     string;
        // descrizione:          string;
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