export interface CLS_ClasseDocenteMateria {
        id:                     number;

        classeSezioneAnnoID:    number;
        docenteID:              number;
        materiaID:              number;

     

        note:                   string;
        dtIns:                  string;
        dtUpd:                  string;
        userIns:                number;
        userUpd:                number;
}

/*
 [Key]
        public int ID { get; set; }
        
        //[Column("ClasseDocenteID", TypeName = "int")]
        //public int ClasseDocenteiD { get; set; }

        [Column("ClasseSezioneAnnoID", TypeName = "int")]
        public int ClasseSezioneAnnoID { get; set; }
        [Column("DocenteID", TypeName = "int")]
        public int DocenteID { get; set; }

        [Column("MateriaID", TypeName = "int")]
        public int MateriaID { get; set; }


        [Column("note", TypeName = "nvarchar(max)")]
        public string note { get; set; }
        [Column("dtIns", TypeName = "date")]
        public DateTime dtIns { get; set; }
        [Column("dtUpd", TypeName = "date")]
        public Nullable<DateTime> dtUpd { get; set; }
        [Column("userIns", TypeName = "int")]
        public int userIns { get; set; }
        [Column("userUpd", TypeName = "int")]
        public Nullable<int> userUpd { get; set; }
*/
