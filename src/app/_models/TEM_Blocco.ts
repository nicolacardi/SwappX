import { TEM_BloccoCella } from "./TEM_BloccoCella";
import { TEM_BloccoFoto } from "./TEM_BloccoFoto";
import { TEM_BloccoTesto } from "./TEM_BloccoTesto";
import { TEM_TipoBlocco } from "./TEM_TipoBlocco";

export interface TEM_Blocco {
        id?:                                     number;

        paginaID:                               number;
        pageOrd:                                number;
        x:                                      number;
        y:                                      number;
        w:                                      number;
        h:                                      number;

        ckTrasp?:                               boolean;
        color?:                                 string;

        borderTop:                              boolean;
        borderRight:                            boolean;
        borderBottom:                           boolean;
        borderLeft:                             boolean;

        //borderColor:                            string; //#RRGGBB
        //borderType:                             string; //solid|dashed|dotted

        tipoBloccoID:                           number;

        tipoBlocco?:                            TEM_TipoBlocco;

        _BloccoTesti?:                          TEM_BloccoTesto[];
        _BloccoFoto?:                           TEM_BloccoFoto[];
        _BloccoCelle?:                          TEM_BloccoCella[];

}

 