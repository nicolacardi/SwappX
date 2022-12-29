import { PER_Persona } from "../_models/PER_Persone";

export interface User {
    id:             string;  //NC 230222
    userID:         string;
    fullname:       string;
    email:          string;
    username:       string;
    //badge: string;
    token?:         string;
    isLoggedIn?:    boolean;
    
    ruoloID:        number;
    ruolo:          Ruolo;

    tipoPersonaID:  number;
    personaID:      number;
    persona?:       PER_Persona;
}


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

export interface Ruolo {
    //User = 'User',
    //Admin = 'Admin',
    id: number;
    descrizione: string;
}

