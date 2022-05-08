export interface DOC_Pagella {
        id?:                    number;
        iscrizioneID:           number;
        periodo:                number;
        ckStampato?:            boolean; //indica se i dati in database e la pagella salvata sono allineati con quelli dell'ultima stampa

        note?:                  string;
        dtIns?:                 string;
        dtUpd?:                 string;
        userIns?:               number;
        userUpd?:               number;
}




