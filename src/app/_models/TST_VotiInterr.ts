export interface TST_VotoInterr {
  id:                                           number;
  lezioneID:                                    number;
  alunnoID:                                     number;
  voto:                                         number;
  giudizio:                                     string;
  argomento:                                    string;
  note?:                                        string;
  dtIns?:                                       string;
  dtUpd?:                                       string;
  userIns?:                                     number;
  userUpd?:                                     number;

}