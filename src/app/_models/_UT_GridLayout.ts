export interface _UT_GridLayout {
        id:                                     number;
        
        userID:                                 string;
        gridName:                               string;
        context:                                string;
        columns:                                _UT_GridLayoutColumn[];
}

export interface _UT_GridLayoutColumn {
        columnName:                             string;
        isVisible:                              boolean;
        disabled:                               boolean;
}