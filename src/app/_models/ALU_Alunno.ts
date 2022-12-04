import { ALU_Genitore } from './ALU_Genitore';
import { PER_Persona } from './PER_Persone';
export interface ALU_Alunno {

        id:                     number;
        personaID:              number;

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

        persona:                PER_Persona;

        _Genitori:              ALU_Genitore[];
}

 