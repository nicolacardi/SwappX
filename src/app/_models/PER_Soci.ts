export interface PER_Socio {
        id:                                     number;
        personaID:                              number;
        dtRichiesta:                            string;
        dtAccettazione:                         string;
        quota:                                  number;
        dtDisiscrizione:                        string;
        dtRestQuota:                            string;
        ckRinunciaQuota:                        string;

        note?:                                  string;
        dtIns?:                                 string;
        dtUpd?:                                 string;
        userIns?:                               number;
        userUpd?:                               number;

}
