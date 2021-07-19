
export interface PAG_Pagamento {

        id:             number;
        importo:        number;
        dtPagamento:    Date;

        tipoPagID:      number;                 //Sostituire con oggetto PAG_TipoPagamenti
        causaleID:      number;                 //Sostituire con oggetto PAG_Causali
        rettaID:        number;                 //Sostituire con oggetto PAG_Rette

        alunnoID:        number;                //Sostituire con oggetto ALU_Alunno
        genitoreID:      number;                //Sostituire con oggetto ALU_Genitore 
        soggetto:        string;

        note:           string;
        dtIns:          string;
        dtUpd:          string;
        userIns:        number;
        userUpd:        number;
}



/*
        public virtual PAG_TipoPagamento _TipoPagamento { get; set; }
        public virtual PAG_CausalePagamento _CausalePagamento{ get; set; }
        public virtual PAG_Retta _Retta { get; set; }
        public virtual ALU_Alunno _Alunno { get; set; }
        public virtual ALU_Genitore _Genitore{ get; set; }
*/
