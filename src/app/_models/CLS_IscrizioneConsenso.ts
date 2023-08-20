export interface CLS_IscrizioneConsenso {
        id?:                                     number;
        iscrizioneID:                           number;
        consensoID:                             number;
        risposta1:                              boolean;
        risposta2:                              boolean;
        risposta3:                              boolean;
        risposta4:                              boolean;
        risposta5:                              boolean;

        dtIns?:                                 string;
        userIns?:                               number;
}