import { _UT_TableCol } from "./_UT_TableCol";

export interface _UT_TableColVisible {
    id:                                         number;
    userID:                                     string;
    tableColID:                                 string;
    visible:                                    boolean;
    ordCol:                                     number;
    disabled:                                   boolean;

    tableCol?:                                  _UT_TableCol
  }

 