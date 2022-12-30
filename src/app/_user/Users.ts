import { PER_Persona, PER_TipoPersona } from "../_models/PER_Persone";

export interface User {
    id:             string;
    userID:         string;
    username:       string; 
    email:          string;

    fullname:       string;         //Da PER_Persona

    token?:         string;         //token restituito da EF
    isLoggedIn?:    boolean;        //dinamico: impostato da behaviour subject
    
    //ruoloID:        number;         //DA SOSTITUIRE con tipoPersonaID

    tipoPersonaID:  number;
    TipoPersona?:    PER_TipoPersona;

    personaID:      number;
    persona?:       PER_Persona;
}

/*
export enum UserRole {
    Alunno =1,
    Alunno_Rappresentante=2,
	Genitore=3,
	Genitore_Rappresentante=4,
	Segreteria=5,
    Maestro=6,
    Maestro_Coordinatore=7,
	Amministratore_Scuola=8,
	Dirigente=9,
    IT_Manager=10,
    SysAdmin=11
}
*/
// export interface Ruolo {
//     //User = 'User',
//     //Admin = 'Admin',
//     id: number;
//     descrizione: string;
// }

