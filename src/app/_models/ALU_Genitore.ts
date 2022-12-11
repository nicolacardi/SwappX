import { ALU_Alunno } from "./ALU_Alunno";
import { PER_Persona } from "./PER_Persone";

export interface ALU_Genitore {
        id:             number;     
        personaID:      number;

        tipo:           string;
        //ckAttivo:       boolean;
        titoloStudio:   string;
        professione:    string;

        note?:          string;
        dtIns?:         string;
        dtUpd?:         string;
        userIns?:       number;
        userUpd?:       number;

        persona:        PER_Persona;

        _Figli?:        ALU_Alunno[];
}