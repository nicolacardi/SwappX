export interface TST_Voto {
  id:                                           number;
  LezioneID:                                    number;
  AlunnoID:                                     number;
  voto:                                         number;
  giudizio:                                     string;

  note?:                                        string;
  dtIns?:                                       string;
  dtUpd?:                                       string;
  userIns?:                                     number;
  userUpd?:                                     number;

}