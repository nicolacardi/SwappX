export interface DialogData {
        titolo:               string;
        sottoTitolo:          string;
        annoID:               number;
        classeSezioneAnnoID:  number;
        alunnoID:             number;
      }
      
export interface DialogDataLezione {
        lezioneID:            number;
        start:                string;
        end:                  string;
        dtCalendario:         string;
        h_Ini:                string;
        h_End:                string;
        classeSezioneAnnoID:  number;
        dove:                 string;
      }
      
export interface DialogDataLezioniUtils {
        start:                Date;
        classeSezioneAnnoID:  number;
      }