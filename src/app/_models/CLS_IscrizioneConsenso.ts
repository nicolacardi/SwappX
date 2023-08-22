export interface CLS_IscrizioneConsenso {
        id?:                                     number;
        tipo:                                   string;
        iscrizioneID:                           number;
        consensoID:                             number;
        risposta1:                              boolean;
        risposta2:                              boolean;
        risposta3:                              boolean;
        risposta4:                              boolean;
        risposta5:                              boolean;
        risposta6:                              boolean;
        dtIns?:                                 string;
        userIns?:                               number;
}