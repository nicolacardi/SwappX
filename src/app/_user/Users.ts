import { PER_Persona, PER_TipoPersona } from "../_models/PER_Persone";

export interface User {
    id:             string;
    userID:         string;
    username:       string; 
    email:          string;

    fullname:       string;         //Da PER_Persona
    //fullname: string = this.persona.nome + ' ' + this.persona.cognome;

    token?:         string;         //token restituito da EF
    isLoggedIn?:    boolean;        //dinamico: impostato da behaviour subject
    
    tipoPersonaID:  number;
    TipoPersona?:    PER_TipoPersona;

    personaID:      number;
    persona?:       PER_Persona;
}


