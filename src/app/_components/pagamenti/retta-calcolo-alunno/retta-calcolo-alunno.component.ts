import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { concatMap, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

//components
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//services
import { AlunniService } from '../../alunni/alunni.service';
import { RetteService } from '../rette.service';
import { IscrizioniService } from '../../classi/iscrizioni.service';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { ParametriService } from 'src/app/_services/parametri.service';

//classi
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';

@Component({
  selector: 'app-retta-calcolo-alunno',
  templateUrl: './retta-calcolo-alunno.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RettaCalcoloAlunnoComponent implements OnInit {

//#region ----- Variabili -------
  form! :                             FormGroup;

  public mesiArr =                    [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=          ["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];

  public QuoteDefault =               "000000000000";
  public QuoteRidotteFratelli : boolean = false;

  public hasFratelloMaggiore  : boolean = false;
  public anno!:                        ASC_AnnoScolastico;
  public iscrizione!:                  CLS_Iscrizione;

  public strDescrizione!:              string;
  public strDescrizioneClasse!:              string;

//#endregion

//#region ----- ViewChild Input Output -------
  @Input() annoID!:         number;
  @Input() alunnoID!:         number;

  @ViewChildren('QuoteListElement') QuoteList!: QueryList<any>;
  @Output('ricalcoloRette')
  ricalcoloRetteEmitter = new EventEmitter<string>();
//#endregion
  constructor(
    private svcParametri:                 ParametriService,
    private svcAnni:                      AnniScolasticiService,
    private svcIscrizioni:                IscrizioniService,
    private svcAlunni:                    AlunniService,
    private svcRette:                     RetteService,
    private _snackBar:                    MatSnackBar, 
    private fb:                           FormBuilder, 

    
  ) {
    this.svcParametri.getByParName('QuoteDefault').subscribe(
      x=>{
        this.QuoteDefault = x.parValue
      });
      
    this.svcParametri.getByParName('QuoteRidotteFratelli').subscribe(
      x=> {
        if(x.parValue == "true") this.QuoteRidotteFratelli = true;
      });

      this.form = this.fb.group({
        quotaConcordata:                [null, Validators.required],
      });
   }

  ngOnInit(): void {

    //estraggo anno e iscrizione, utili per quando dovrò procedere con la put
    this.svcAnni.get(this.annoID).subscribe (anno => this.anno = anno);  

    this.caricaQuotaConcordataDefault();
  }

  caricaQuotaConcordataDefault() {
    this.svcIscrizioni.getByAlunnoAndAnno(this.annoID, this.alunnoID).pipe (
      tap((iscrizione: CLS_Iscrizione) => this.iscrizione = iscrizione),
      concatMap( (iscrizione: CLS_Iscrizione) => this.svcAlunni.hasFratelloMaggiore(this.annoID, this.alunnoID).pipe(
        tap ( val =>  {
          this.strDescrizioneClasse= "Di seguito la quota annuale prevista per la classe "+ iscrizione.classeSezioneAnno.classeSezione.classe.descrizione2;
          if (val && this.QuoteRidotteFratelli) {
            this.strDescrizione = "L'alunno ha almeno un fratello maggiore";
            
            this.form.controls.quotaConcordata.setValue(iscrizione.classeSezioneAnno.classeSezione.classe.importo2);
          } else {
            this.strDescrizione = "L'alunno non ha alcun fratello maggiore";
            this.form.controls.quotaConcordata.setValue(iscrizione.classeSezioneAnno.classeSezione.classe.importo);
          }
        })
      ))
    ).subscribe();
  }

  inserisciRetteConcordate(){


    //********************************************************************************************************************************************************
    //ATTENZIONE! DEVO ESSERE SICURO CHE SE C'è UNA RETTA IN UN MESE CI SIA IN TUTTI I 12 MESI ALTRIMENTI LA UPDATE NON FUNZIONA CORRETTAMENTE! ASSICURARSENE!

    //ho creato in ngOnInit l'oggetto anno e  in caricaQuotaConcordataDefault l'oggetto iscrizione, ora vado a usarli

    let annoRetta = 0;
    let importoMese  = 0;

    let importoMeseRound  = 0;
    let restoImportoMese  = 0;

    let mese = 0 ;
    let i = 0;
    let contaMesi = 0;

    let arrCheckMesi = this.QuoteList.toArray();
    for( i=1; i<=12; i++) if (arrCheckMesi[i-1].checked == true) contaMesi++;
  
    let anno1 = this.anno.anno1;
    let anno2 = this.anno.anno2;

    let importoAnno = this.form.controls.quotaConcordata.value;

    importoMeseRound = Math.floor(importoAnno/contaMesi);
    restoImportoMese = importoAnno - importoMeseRound * contaMesi;  //per applicare il resto alla prima quota devo essere sicuro che le quote vengano passate in ordine, quindi nel service metto una orderby

    let primaQuota =  true;

    //aggiorno lo status inserendo il codice 20
    let formData = {
      id: this.iscrizione.id,
      codiceStato: 20
    }
    this.svcIscrizioni.updateStato(formData)
      .subscribe(
        //() => this.viewListClassi.loadData()
    );


    this.svcRette.listByAlunnoAnno(this.alunnoID, this.annoID ).subscribe(async retteAnnoAlunno =>{

      console.log ("retteAnnoAlunno", retteAnnoAlunno);
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
              if (primaQuota) {
                importoMese = importoMeseRound + restoImportoMese;
                primaQuota = false;
              } 
              else  importoMese = importoMeseRound;
            // }
          }

          let rettaMese: PAG_Retta = {
            id : 0,
            iscrizioneID:           this.iscrizione.id,
            annoID:                 this.annoID,
            alunnoID:               this.alunnoID,
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
          this.svcRette.post(rettaMese).subscribe(
            res=>   this._snackBar.openFromComponent(SnackbarComponent, {data: 'Rette inserite per l\'alunno', panelClass: ['green-snackbar']}),
            err =>  this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore durante l\'inserimento delle rette', panelClass: ['red-snackbar']})
          );
          this.ricalcoloRetteEmitter.emit();  //questa deve partire solo a post terminata  TODO DA TESTARE CHE ACCADA COSI'

        } 
      } else {


        // const Loop = async (retteAnnoAlunno: any) => {
        //   retteAnnoAlunno.map(async (rettaMese: PAG_Retta) => {
        // //   //



// const arr = [1, 2, 3];

// arr.forEach(async (i) => {
// 	// each element takes a different amount of time to complete
// 	await sleep(10 - i);
// 	console.log(i);
// });


// const arr = [1, 2, 3];

// await Promise.all(arr.map(async (i) => {
// 	await sleep(10 - i);
// 	console.log(i);
// }));


        //await retteAnnoAlunno.reduce(async (memo, i) => {
        for (let rettaMese of retteAnnoAlunno) {
          await new Promise ((resolve, reject)=> {
          
        //await Promise.all(retteAnnoAlunno.map(async (rettaMese) => {
        //retteAnnoAlunno.forEach( rettaMese => {
            console.log ("inizio await promise");
            mese = rettaMese.meseRetta;

            if (mese <= 8) 
              i = mese + 3;
            else 
              i = mese - 9;
            
            if (arrCheckMesi[i].checked == false) 
              importoMese = 0;
            else {
                if (primaQuota) {
                  importoMese = importoMeseRound + restoImportoMese;
                  primaQuota = false;
                } 
                else importoMese = importoMeseRound;
            }

            rettaMese.quotaConcordata = importoMese;
            rettaMese.quotaDefault = importoMese;

            this.svcRette.put(rettaMese).subscribe(
              () => {
                console.log ("resolve");
                //resolve;
              }
            );

            console.log("fuori dalla await");


          })
        }
        
        // )).then (()=> {
        console.log ("sto per lanciare l'emit1");
        this.ricalcoloRetteEmitter.emit();
          
        //   this._snackBar.openFromComponent(SnackbarComponent, {data: 'Rette inserite per l\'alunno', panelClass: ['green-snackbar']})
        
        // })

        
        //);


         //questa deve partire solo a put terminate (await)

        //https://advancedweb.hu/how-to-use-async-functions-with-array-foreach-in-javascript/   NON FUNZIONA QUI



                
      }
    });


  


  }
}
function sleep(arg0: number) {
  throw new Error('Function not implemented.');
}

