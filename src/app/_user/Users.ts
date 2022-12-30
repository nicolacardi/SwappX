import { PER_Persona, PER_TipoPersona } from "../_models/PER_Persone";

export interface User {
    id:             string;  //NC 230222
    userID:         string;
    username:       string; 
    email:          string;

    fullname:       string;         //Da PER_Persona

    token?:         string;         //token restituito da EF
    isLoggedIn?:    boolean;        //dinamico: impostato da behaviour subject
    
    tipoPersonaID:  number;
    TipoPersona?:    PER_TipoPersona;

    personaID:      number;
    persona?:       PER_Persona;
}


