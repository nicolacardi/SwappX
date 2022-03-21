import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

//components
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { ClassiSezioniAnniListComponent } from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//services
import { AlunniService } from '../../alunni/alunni.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { ParametriService } from 'src/app/_services/parametri.service';
import { IscrizioniService } from '../../classi/iscrizioni.service';
import { RetteService } from '../rette.service';

//classes
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';

@Component({
  selector: 'app-retta-calcolo',
  templateUrl: './retta-calcolo.component.html',
  styleUrls: ['../pagamenti.css']
})

export class RettaCalcoloComponent implements OnInit {

  obsAnni$!:                          Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  //obsQuoteDefault$!:                  Observable<_UT_Parametro>;
  //obsQuoteRidotteFratelli$!:          Observable<_UT_Parametro>;
  
  obsClassiSezioniAnni$!:             Observable<CLS_ClasseSezioneAnno[]>;
  obsRette$!:                         Observable<PAG_Retta[]>;
  // obsFilteredAlunni$!:                Observable<ALU_Alunno[]>;

  form! :                             FormGroup;
  public mesiArr =                    [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=          ["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];
  public QuoteDefault =               "000000000000";
  public QuoteRidotteFratelli =       false;

  @ViewChild('ListClassi') viewListClassi!:     ClassiSezioniAnniListComponent; 
  @ViewChildren('QuoteListElement') QuoteList!: QueryList<any>;

  constructor(
    public _dialogRef:                    MatDialogRef<RettaCalcoloComponent>,

    private svcIscrizioni:                IscrizioniService,
    private svcRette:                     RetteService,
    private svcAlunni:                    AlunniService,
    
    private svcParametri:                 ParametriService,
    private _loadingService:              LoadingService,
    public _dialog:                       MatDialog,
    private _snackBar:                    MatSnackBar ) {

    _dialogRef.disableClose = true;

    this.svcParametri.getByParName('QuoteDefault').subscribe(
      x=>{
        this.QuoteDefault = x.parValue
      });

    this.svcParametri.getByParName('QuoteRidotteFratelli').subscribe(
      x=> {
        if(x.parValue == "true") this.QuoteRidotteFratelli = true;
      });
  }

  ngOnInit(): void {
  }


  calcola() {
    if (this.viewListClassi.isNoneSelected()) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Selezionare almeno una classe"}
      });

    } else {
      this.viewListClassi.getChecked().forEach(element => {     
           
        this.elaboraClasse(element);
        
        this.viewListClassi.selection.toggle(element);
        //crea l'array di icone di fine procedura
        let arrEndedIcons = this.viewListClassi.endedIcons.toArray();
        //imposta l'icona che ha id = "endedIcon_idDellaClasse" a visibility= visible
        (arrEndedIcons.find(x=>x.nativeElement.id=="endedIcon_"+element.id)?.nativeElement as HTMLElement).style.visibility = "visible";
        (arrEndedIcons.find(x=>x.nativeElement.id=="endedIcon_"+element.id)?.nativeElement as HTMLElement).style.opacity = "1";
      }); 



      this._snackBar.openFromComponent(SnackbarComponent, {data: 'Rette inserite per le classi selezionate', panelClass: ['green-snackbar']});
    }

  }

  private elaboraClasse(objClasseSezioneAnno: CLS_ClasseSezioneAnnoGroup){

    //********************************************************************************************************************************************************
    //ATTENZIONE! DEVO ESSERE SICURO CHE SE C'è UNA RETTA IN UN MESE CI SIA IN TUTTI I 12 MESI ALTRIMENTI LA UPDATE NON FUNZIONA CORRETTAMENTE! ASSICURARSENE!

    let annoRetta = 0;
    let importoMese  = 0;

    let importoMeseRound  = 0;
    let importoMeseRound2  = 0;
    let restoImportoMese  = 0;
    let restoImportoMese2  = 0;

    let mese = 0 ;
    let i = 0;
    let contaMesi = 0;

    let arrCheckMesi = this.QuoteList.toArray();
    for( i=1; i<=12; i++)
      if (arrCheckMesi[i-1].checked == true) contaMesi++;
    
    let annoID = objClasseSezioneAnno.annoID; 
    let anno1 = objClasseSezioneAnno.anno1;
    let anno2 = objClasseSezioneAnno.anno2;

    let importoAnno =objClasseSezioneAnno.importo;
    let importoAnno2 =objClasseSezioneAnno.importo2;

    importoMeseRound = Math.floor(importoAnno/contaMesi);
    restoImportoMese = importoAnno - importoMeseRound * contaMesi;  //per applicare il resto alla prima quota devo essere sicuro che le quote vengano passate in ordine, quindi nel service metto una orderby
    importoMeseRound2 = Math.floor(importoAnno2/contaMesi);
    restoImportoMese2 = importoAnno2 - importoMeseRound2 * contaMesi; 

    let obsIscrizioni$: Observable<CLS_Iscrizione[]>;
    obsIscrizioni$= this.svcIscrizioni.listByClasseSezioneAnno(objClasseSezioneAnno.id);
    
    obsIscrizioni$.subscribe(val =>  {

        val.forEach( (iscrizione: CLS_Iscrizione) => {
            let primaQuota =  true;

            let formData = {
              id: iscrizione.id,
              codiceStato: 20
            }
            //this.svcIscrizioni.updateStato(formData).subscribe();
            this.svcIscrizioni.updateStato(formData)
              .subscribe(
                () => this.viewListClassi.loadData()
              );

            

            let hasFratelloMaggiore= false;
            this.svcAlunni.hasFratelloMaggiore(iscrizione.alunnoID )
              .pipe (
                tap (val=> {
                  hasFratelloMaggiore = val;
                }),  
                concatMap(() => this.svcRette.listByAlunnoAnno(iscrizione.alunnoID, annoID )))
                  .subscribe( retteAnnoAlunno =>{

                    //se array vuoto, INSERT
                    if(retteAnnoAlunno.length == 0){

                      const d = new Date();
                      d.setSeconds(0,0);
                      let dateNow = d.toISOString().split('.')[0];

                      //loop per i 12 mesi, i primi quattro dell'anno1, gli altri dell'anno2
                      for( i=1; i<=12; i++){
                        if (i <= 4) {
                          mese = i + 8;
                          annoRetta = anno1;
                        } 
                        else {
                          mese = i - 4;
                          annoRetta = anno2;
                        }

                        if (arrCheckMesi[i-1].checked == false) 
                          importoMese = 0;             
                        else {
                          if( this.QuoteRidotteFratelli && hasFratelloMaggiore){
                            if (primaQuota) {
                              importoMese = importoMeseRound2 + restoImportoMese2;
                              primaQuota = false;
                            } 
                            else importoMese = importoMeseRound2;
                          }
                          else{
                            if (primaQuota) {
                              importoMese = importoMeseRound + restoImportoMese;
                              primaQuota = false;
                            } 
                            else  importoMese = importoMeseRound;
                          }
                        }

                        let rettaMese: PAG_Retta = {
                          id : 0,
                          iscrizioneID:           iscrizione.id,
                          annoID:                 annoID,
                          alunnoID:               iscrizione.alunnoID,
                          annoRetta:              annoRetta,
                          meseRetta:              mese,
                          quotaDefault:           importoMese,
                          quotaConcordata:        importoMese,
                          
                          note:                   '',
                          dtIns:                  dateNow,
                          dtUpd:                  dateNow,
                          userIns:                1,
                          userUpd:                1
                        };
                        this.svcRette.post(rettaMese).subscribe();
                      } 
                    }
                    else {
                      retteAnnoAlunno.forEach((rettaMese) => {
                        mese = rettaMese.meseRetta;

                        if (mese <= 8) 
                          i = mese + 3;
                        else 
                          i = mese - 9;
                        
                        if (arrCheckMesi[i].checked == false) 
                          importoMese = 0;
                        else {
                          if( this.QuoteRidotteFratelli && hasFratelloMaggiore){
                            if (primaQuota) {
                              importoMese = importoMeseRound2 + restoImportoMese2;
                              primaQuota = false;
                            } 
                            else importoMese = importoMeseRound2;
                          }
                          else{
                            if (primaQuota) {
                              importoMese = importoMeseRound + restoImportoMese;
                              primaQuota = false;
                            } 
                            else importoMese = importoMeseRound;
                          }
                        }

                        rettaMese.quotaConcordata = importoMese;
                        rettaMese.quotaDefault = importoMese;

                        this.svcRette.put(rettaMese).subscribe();
                      });
                    }
                }
            );
        });
      }
    )
  }

  // selected(event: MatAutocompleteSelectedEvent): void {
  // }

  // loadData ( ) {
  // }

  // blur() {
  // }
  
  // enterAlunnoInput(){
  // }


  /*
  foreach CLS_ClasseSezioneAnno -->classeSezioneAnnoID

    GET CLS_Classe

    let importoMese;
    let ImportoAnno;
    
    foreach CLS_Iscrizione
      - stato iscrizione = ...
      - put CLS_Iscrizione

      ALU_Alunno alunno = CLS_Iscrizione.alunno
      if( alunno.FratelloMinore && parScontoFratelliMinori)
        importoAnno = importo2;
      else
        importoAnno = importo;

      let totMesi = count checkboxes mesi
      importoMese = round( importoAnno / totMesi )
      let restoImporto = ImportoAnno - importoMese * totMesi ;

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
