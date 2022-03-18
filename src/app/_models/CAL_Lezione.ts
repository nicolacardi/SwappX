import { CLS_ClasseSezioneAnno } from "./CLS_ClasseSezioneAnno";
import { PER_Docente } from "./PER_Docente";
import { PER_Persona } from "./PER_Persone";

export interface CAL_Lezione {
  id:                   number;
  classeSezioneAnnoID:  number;
  dtCalendario:         string;

  //campi di FullCalendar
  title:                string;
  start:                string;     //YYYY-MM-DDTHH:MM:SS
  end:                  string;     //YYYY-MM-DDTHH:MM:SS
  colore:               string;

  h_Ini:                string;
  h_End:                string;
  docenteID:            number;
  materiaID:            number;
  supplenteID:          number;
  ckEpoca:              number;
  ckFirma:              number;
  dtFirma:              string;
  ckAssente:            number;
  argomento:            string;
  compiti:              string;
  
  docente:              PER_Docente;
  persona:              PER_Persona;
  classeSezioneAnno:    CLS_ClasseSezioneAnno;
//   note:                 string;
//   dtIns:                string;
//   dtUpd:                string;
//   userIns:              number;
//   userUpd:              number;

}