import { TEM_BloccoFoto } from "./TEM_BloccoFoto";
import { TEM_BloccoTesto } from "./TEM_BloccoTesto";
import { TEM_TipoBlocco } from "./TEM_TipoBlocco";

export interface TEM_Blocco {
        id?:                                     number;

        paginaID:                               number;
        x:                                      number;
        y:                                      number;
        w:                                      number;
        h:                                      number;

        ckFill?:                                 boolean;
        color?:                                 string;

        borderTop:                              boolean;
        borderRight:                            boolean;
        borderBottom:                           boolean;
        borderLeft:                             boolean;


        tipoBloccoID:                           number;

        tipoBlocco?:                            TEM_TipoBlocco;

        bloccoFotoID?:                          number;

        bloccoTestoID?:                         number;

        bloccoFoto?:                            TEM_BloccoFoto;
        bloccoTesto?:                           TEM_BloccoTesto;

}

 