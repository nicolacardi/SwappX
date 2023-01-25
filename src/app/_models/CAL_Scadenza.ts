import { PER_Persona } from "./PER_Persone";

export interface CAL_Scadenza {
  id:                                           number;

  dtCalendario:                                 string;
  ckPromemoria:                                 boolean;
  ckRisposta:                                   boolean;
  PersonaID:                                    number;
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

  _ScadenzaPersone?:                             CAL_ScadenzaPersone[];

}

export interface CAL_ScadenzaPersone {
  id?:                                          number;
  
  personaID:                                    number;
  scadenzaID:                                   number;
  ckLetto:                                      boolean;
  ckAccettato:                                  boolean;
  ckRespinto:                                   boolean;

  scadenza?:                                    CAL_Scadenza;   
  persona?:                                     PER_Persona;
}