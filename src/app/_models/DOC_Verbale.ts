import { PER_Persona } from "./PER_Persone";

export interface DOC_Verbale {
    id:                                         number;
    
    annoID:                                     number;
    personaID:                                  number;
    dtVerbale:                                  string;
    hVerbale:                                   string;
    titolo:                                     string;
    contenuti:                                  string;

    note?:                                      string;
    dtIns?:                                     string;
    dtUpd?:                                     string;
    userIns?:                                   number;
    userUpd?:                                   number;

    persona:                                    PER_Persona;
}

 

export interface DOC_TipoVerbale {
    id:                                         number;

    descrizione:                                number;
    ord:                                        number;
    ckMostraGenitori:                           boolean;
}

export interface DOC_VerbalePresente {
    id?:                                         number;
    
    personaID:                                  number;
    verbaleID:                                  number;
}