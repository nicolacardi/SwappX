import { _UT_Risorsa } from "./_UT_Risorsa";

export interface _UT_Consenso {
    id:                                         number;
    tipo:                                       string; //"Consensi"/"Dati Economici"
    domanda:                                    string;
    numOpzioni:                                 number;
    testo1:                                     string;
    testo2:                                     string;
    testo3:                                     string;
    testo4:                                     string;
    testo5:                                     string;
    risorsaID:                                  number;
    risorsa?:                                   _UT_Risorsa;

  }

 