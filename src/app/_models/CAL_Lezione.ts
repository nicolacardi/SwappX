
export interface CAL_Lezione {
  id:                   number;
  classeSezioneAnnoID:  number;
  dtCalendario:         string;

  //campi di FullCalendar
  title:                string;
  start:                string;     //YYYY-MM-DDTHH:MM:SS
  end:                  string;     //YYYY-MM-DDTHH:MM:SS
  colore:               string;

  docenteID:            number;
  materiaID:            number;
  supplenteID:          number;
  ckFirma:              number;
  dtFirma:              string;
  ckAssente:            number;
  argomento:            string;
  compiti:              string;
  
//   note:                 string;
//   dtIns:                string;
//   dtUpd:                string;
//   userIns:              number;
//   userUpd:              number;

}