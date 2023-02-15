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

        tipoBloccoID:                           number;

        tipoBlocco?:                             TEM_TipoBlocco;

        bloccoFotoID?:                           number;
}

 