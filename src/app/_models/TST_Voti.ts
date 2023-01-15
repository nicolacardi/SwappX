export interface TST_Voto {
  id:                                           number;
  lezioneID:                                    number;
  alunnoID:                                     number;
  voto:                                         number;
  giudizio:                                     string;

  note?:                                        string;
  dtIns?:                                       string;
  dtUpd?:                                       string;
  userIns?:                                     number;
  userUpd?:                                     number;

}