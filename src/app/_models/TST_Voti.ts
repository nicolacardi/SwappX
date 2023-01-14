export interface TST_Voto {
  id:                                           number;
  LezioneID:                                    number;
  AlunnoID:                                     number;
  voto:                                         string;
  giudizio:                                     string;

  note?:                                        string;
  dtIns?:                                       string;
  dtUpd?:                                       string;
  userIns?:                                     number;
  userUpd?:                                     number;

}