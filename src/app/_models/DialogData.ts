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
        personaID:                              number;
        nome?:                                  string;
        cognome?:                               string;
        dtNota?:                                string;
      }

