import { ALU_Alunno } from "./ALU_Alunno";

export interface ALU_Genitore {
        id:             number;
        personaID:      number;

        /*
        nome:           string;
        cognome:        string;
        dtNascita:      string;
        comuneNascita:  string;
        provNascita:    string;
        nazioneNascita: string;
        CF:             string;
        indirizzo:      string;
        comune:         string;
        cap:            string;
        prov:           string;
        nazione:        string;
        email:          string;
        telefono:       string;
        */

        telefono2:      string;

        note:           string;
        dtIns:          string;
        dtUpd:          string;
        userIns:        number;
        userUpd:        number;

        _Figli:         ALU_Alunno[];
}