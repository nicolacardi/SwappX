export interface CAL_Scadenza {
  id:                                           number;

  dtCalendario:                                 string;

  //campi di FullCalendar

  start:                                        string;     //YYYY-MM-DDTHH:MM:SS
  end:                                          string;     //YYYY-MM-DDTHH:MM:SS

  h_Ini:                                        string;
  h_End:                                        string;
  
  title:                                        string;
  color:                                        string;


//   note:                 string;
//   dtIns:                string;
//   dtUpd:                string;
//   userIns:              number;
//   userUpd:              number;

}