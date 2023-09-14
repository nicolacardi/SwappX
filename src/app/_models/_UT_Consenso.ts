import { _UT_Risorsa } from "./_UT_Risorsa";

export interface _UT_Consenso {
    id:                                         number;
    contesto:                                   string; //"Consensi"/"Dati Economici"/"Cert.Compoetenze"/"Cons. Orientativo"
    tipo:                                       string; //"Scelta Singola"/"Scelta Multipla"/"Risposta Libera"
    titolo:                                     string;
    domanda:                                    string;
    numOpzioni:                                 number;
    testo1:                                     string;
    testo2:                                     string;
    testo3:                                     string;
    testo4:                                     string;
    testo5:                                     string;
    testo6:                                     string;

    risorsaID:                                  number;
    risorsa?:                                   _UT_Risorsa;

  }

 