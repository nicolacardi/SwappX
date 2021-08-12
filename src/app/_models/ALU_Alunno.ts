import { ALU_Genitore } from './ALU_Genitore';

export interface ALU_Alunno {
        id:                     number;
        nome:                   string;
        cognome:                string;
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
        ckAttivo:               boolean;
        ckDisabile:             boolean;
        ckDSA:                  boolean;
        ckAuthFoto:             boolean;
        ckAuthUsoMateriale:     boolean;
        ckAuthuscite:           boolean;
        scuolaProvenienza:      string;
        indirizzoScuolaProvenienza: string;

        note:                   string;
        dtIns:                  string;
        dtUpd:                  string;
        userIns:                number;
        userUpd:                number;

        _Genitori:              ALU_Genitore[];
}


