export interface PER_Persona {
        id:                     number;
        tipoID:                 number;
        nome:                   string;
        cognome:                string;
        genere:                 string;
        dtNascita:              string;
        comuneNascita:          string;
        provNascita:            string;
        nazioneNascita:         string;
        CF:                     string;
        indirizzo:              string;
        comune:                 string;
        cap:                    string;
        prov:                   string;
        nazione:                string;
        email:                  string;
        telefono:               string;

        note:                   string;
        dtIns:                  string;
        dtUpd:                  string;
        userIns:                number;
        userUpd:                number;

        tipo:                   PER_Tipo;
}


export interface PER_Tipo {
        id:                            number;
        descrizione:                   string;
}