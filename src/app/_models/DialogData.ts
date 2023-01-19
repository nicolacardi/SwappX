import { TST_VotoInterr } from "./TST_VotiInterr";

//I dialog Data si usano ogni volta che da un form ad una Dialog non bisogna passare una sola info ma un serie di informazioni
export interface DialogData {
        titolo:                                 string;
        sottoTitolo:                            string;
        annoID:                                 number;
        classeSezioneAnnoID:                    number;
        alunnoID:                               number;
      }
      
export interface DialogDataLezione {
        lezioneID:                              number;
        start:                                  string;
        end:                                    string;
        dtCalendario:                           string;
        h_Ini:                                  string;
        h_End:                                  string;
        classeSezioneAnnoID:                    number;
        dove:                                   string;
        docenteID:                              number;
      }

export interface DialogDataScadenza {
        scadenzaID:                              number;
        start:                                  string;
        end:                                    string;
        dtCalendario:                           string;
        h_Ini:                                  string;
        h_End:                                  string;

      }

export interface DialogDataLezioniUtils {
        start:                                  Date;
        classeSezioneAnnoID:                    number;
      }


export interface DialogDataVotiObiettivi {
        iscrizioneID:                           number
        pagellaID:                              number;
        pagellaVotoID:                          number;
        periodo:                                number;
        classeSezioneAnnoID:                    number;
        materiaID:                              number;
      }

export interface DialogDataColoreMateria {
        ascRGB:                                 string;
      }

export interface DialogDataNota {
        notaID:                                 number;
        iscrizioneID:                           number;
        classeSezioneAnnoID:                    number;
        personaID:                              number;
        nome?:                                  string;
        cognome?:                               string;
        dtNota?:                                string;
      }


export interface DialogDataVotoInterr {
        votoInterr:                             TST_VotoInterr;
        classeSezioneAnnoID:                    number;
        docenteID:                              number;
        lezioneID:                              number;  //se undefined serve a capire che ci troviamo in orario-docenti!

      }