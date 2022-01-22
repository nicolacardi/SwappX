import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

//services
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { AlunniService } from '../../alunni/alunni.service';
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
import { LoadingService } from '../../utilities/loading/loading.service';

//classes
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';
import { ParametriService } from 'src/app/_services/parametri.service';
import { ClassiSezioniAnniListComponent } from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { IscrizioniService } from '../../classi/iscrizioni.service';
import { RetteService } from '../rette.service';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { RettameseEditComponent } from '../rettamese-edit/rettamese-edit.component';

@Component({
  selector: 'app-retta-calcolo',
  templateUrl: './retta-calcolo.component.html',
  styleUrls: ['../pagamenti.css']
})

export class RettaCalcoloComponent implements OnInit {

  obsAnni$!:                          Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  obsQuoteDefault$!:                  Observable<_UT_Parametro>;
  obsClassiSezioniAnni$!:             Observable<CLS_ClasseSezioneAnno[]>;
  obsRette$!:                         Observable<PAG_Retta[]>;
  
  // obsFilteredAlunni$!:                Observable<ALU_Alunno[]>;

  form! :                             FormGroup;
  public mesiArr =                    [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=          ["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];
  public QuoteDefault =               "000000000000";

  @ViewChild('ListClassi') viewListClassi!: ClassiSezioniAnniListComponent; 

  constructor(
    public _dialogRef:                    MatDialogRef<RettaCalcoloComponent>,
    private svcAnni:                      AnniScolasticiService,
    private svcClasseSezioneAnno:         ClassiSezioniAnniService,
    private svcIscrizioni:                IscrizioniService,
    private svcRette:                     RetteService,
    
    public _dialog:                       MatDialog,
    // private svcAlunni:                    AlunniService,
    private svcParametri:                 ParametriService,
    private _loadingService:              LoadingService,
    private fb:                           FormBuilder, 
  ) {

    _dialogRef.disableClose = true;

    // let obj = localStorage.getItem('AnnoCorrente');

    // this.form = this.fb.group({
    //   selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue,
    //   selectClasse:         ["0"],
    //   importo:              ["0"],
    //   importo2:              ["0"],
    //   nomeCognomeAlunno:    [null]
    // });

    this.svcParametri.loadParametro('QuoteDefault')
      .subscribe(x=>{
      this.QuoteDefault = x.parValue
      }
    );


  }

  ngOnInit(): void {

    // this.form.controls['selectAnnoScolastico'].valueChanges.subscribe(val => {
    //   // this.loadData();
    //   // this.annoIdEmitter.emit(val);
    //   this.obsClassiSezioniAnni$ = this.svcClasseSezioneAnno.loadClassiByAnnoScolastico(this.form.controls["selectAnnoScolastico"].value);
    // })

    // this.obsFilteredAlunni$ = this.form.controls['nomeCognomeAlunno'].valueChanges
    // .pipe(
    //   debounceTime(300),
    //   switchMap(() => this.svcAlunni.filterAlunni(this.form.value.nomeCognomeAlunno))
    // )

    // this.obsAnni$ = this.svcAnni.load();
    // this.obsClassiSezioniAnni$ = this.svcClasseSezioneAnno.loadClassiByAnnoScolastico(this.form.controls["selectAnnoScolastico"].value);

    //this.loadData();

    // this.form.controls['selectClasse'].valueChanges
    // .subscribe(
    //   val => {
    //     //this.form.controls['importo'].setValue(
    //    this.svcClasseSezioneAnno.loadClasse(val)
    //    .subscribe(
    //      res=> { 
    //       this.form.controls['importo'].setValue(res.classeSezione.classe.importo);
    //       this.form.controls['importo2'].setValue(res.classeSezione.classe.importo2);
    //      }
       
    //    );
    // })

  }

  loadData ( ) {

  }

  blur() {
  
  }
  
  enterAlunnoInput(){

  }

  selected(event: MatAutocompleteSelectedEvent): void {
    //this.data.idAlunno = parseInt(event.option.id);
    //this.form.controls['alunnoID'].setValue(parseInt(event.option.id));
    this.loadData();
  }

  calcola() {
    if (this.viewListClassi.isNoneSelected()) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Selezionare almeno una classe"}
      });

    } else {
      

      this.viewListClassi.getChecked().forEach(element => {     
        //this.viewListClassi.showProgress = true;
           
        this.elaboraClasse(element);
        //this.viewListClassi.endedProgress = false;

      }); 
      
      /*
      this.viewListClassi.showProgress = true;
      setTimeout(()  => {
        this.viewListClassi.showProgress = false;
        this.viewListClassi.endedProgress = true;
      }
      , 3000);
      */
    }
  }

  elaboraClasse(objClasseSezioneAnno: CLS_ClasseSezioneAnno){

    console.log("ElaboraClasse - objClasseSezioneAnno:", objClasseSezioneAnno );

    var ImportoAnno =objClasseSezioneAnno.classeSezione.classe.importo;
    var ImportoAnno2 =objClasseSezioneAnno.classeSezione.classe.importo2;

    let obsIscrizioni$: Observable<CLS_Iscrizione[]>;
    obsIscrizioni$= this.svcIscrizioni.listByClasseSezioneAnno(objClasseSezioneAnno.id);
    obsIscrizioni$.subscribe(val =>  {

      //console.log("loop: " , val);

        val.forEach( (iscrizione: CLS_Iscrizione) => {
            //iscrizione.statoID = 2;     //GET Stato ID ....
            //Update CLS_Iscrizione ....
            let anno = this.viewListClassi.form.controls["selectAnnoScolastico"].value;

            this.svcRette.loadByAlunnoAnno(iscrizione.alunnoID, anno )
              .subscribe(
                retteAnnoAlunno =>{
                  if(retteAnnoAlunno.length == 0){
                      console.log("INSERT - AlunnoID", iscrizione.alunnoID);

                      //QUI!!!
                      for( let i=1; i<=12; i++){

                        let rettaMese: PAG_Retta = {
                          id : 0,
                          annoID:                 anno,
                          alunnoID:               iscrizione.alunnoID,
                          
                          annoRetta:              0,
                          meseRetta:              0,
                          quotaDefault:           0,
                          quotaConcordata:        ImportoAnno,
                          
                          note:                   '',
                          dtIns:                  '',
                          dtUpd:                  '',
                          userIns:                1,
                          userUpd:                1
                      };

                      console.log("INSERT: ", rettaMese);

                      this.svcRette.put(rettaMese);
                    }


                  }
                  else{
                    console.log("UPDATE - retteAnnoAlunno", retteAnnoAlunno);
                    retteAnnoAlunno.forEach(rettaMese => {

                      //ImportoMESE!!!!
                      rettaMese.quotaConcordata = ImportoAnno;
                      //... importo2      TODO
                      console.log("PUT RettaMese: ", rettaMese);

                      this.svcRette.put(rettaMese);
                    });
                    
                  }
                }
              );


/*
            let alunnoID = iscrizione.alunnoID;

            for( let i=1; i<=12; i++){
              let obsRette$: Observable<CLS_Iscrizione[]>;

              - get PAG_Retta
        - exists ? yes:put; no: post
        -  
        - set PAG_Retta quotaConcordata = importoMese (+ restoImporto se primo mese)
        - save
            }
*/
        })

      }
    )
  }

  /*
  foreach CLS_ClasseSezioneAnno -->classeSezioneAnnoID

    GET CLS_Classe

    var importoMese;
    var ImportoAnno;
    
    foreach CLS_Iscrizione
      - stato iscrizione = ...
      - put CLS_Iscrizione

      ALU_Alunno alunno = CLS_Iscrizione.alunno
      if( alunno.FratelloMinore && parScontoFratelliMinori)
        importoAnno = importo2;
      else
        importoAnno = importo;

      var totMesi = count checkboxes mesi
      importoMese = round( importoAnno / totMesi )
      var restoImporto = ImportoAnno - importoMese * totMesi ;

      foreach( checkbox mese (DOM...) )
        
        if(checked){
          importoMese
        - get PAG_Retta
        - exists ? yes:put; no: post
        -  
        - set PAG_Retta quotaConcordata = importoMese (+ restoImporto se primo mese)
        - save
        }
      }
  */

  
}
