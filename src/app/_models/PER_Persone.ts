export interface PER_Persona {
        id:                                     number;

        tipoPersonaID:                          number;

        nome:                                   string;
        cognome:                                string;
        genere:                                 string;
        dtNascita:                              string;
        comuneNascita:                          string;
        provNascita:                            string;
        nazioneNascita:                         string;
        CF:                                     string;
        indirizzo:                              string;
        comune:                                 string;
        cap:                                    string;
        prov:                                   string;
        nazione:                                string;

        email:                                  string;
        email1?:                                string;

        telefono:                               string;
        telefono1?:                             string;

        ckAttivo:                               boolean;

        note?:                                  string;
        dtIns?:                                 string;
        dtUpd?:                                 string;
        userIns?:                               number;
        userUpd?:                               number;

        tipoPersona?:                           PER_TipoPersona;
}

export interface PER_TipoPersona {
        id:                                     number;

        descrizione:                            string;
        ckDocente?:                             boolean;
        ckPersonale?:                           boolean;
        livello:                                number;
}