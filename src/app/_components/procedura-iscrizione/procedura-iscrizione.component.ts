//#region ----- IMPORTS ------------------------

import { Component, OnInit, QueryList, ViewChild, ViewChildren }                    from '@angular/core';
import { Observable, firstValueFrom, map }           from 'rxjs';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatStepper }                           from '@angular/material/stepper';
import { ActivatedRoute }                       from '@angular/router';
import { FormatoData, Utility } from '../utilities/utility.component';

//components
import { SnackbarComponent }                    from '../utilities/snackbar/snackbar.component';
import { PersonaFormComponent }                 from '../persone/persona-form/persona-form.component';
import { IscrizioneConsensiComponent }          from './iscrizione-consensi/iscrizione-consensi.component';

//services
import { PersoneService }                       from '../persone/persone.service';
import { IscrizioniService }                    from '../iscrizioni/iscrizioni.service';
import { IscrizioneConsensiService }            from './iscrizione-consensi/iscrizione-consensi.service';
import { OpenXMLService }                       from '../utilities/openXML/open-xml.service';
import { RetteService }                         from '../pagamenti/rette.service';

//models
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { ALU_Genitore }                         from 'src/app/_models/ALU_Genitore';
import { ALU_GenitoreAlunno }                   from 'src/app/_models/ALU_GenitoreAlunno';
import { CLS_IscrizioneConsenso }               from 'src/app/_models/CLS_IscrizioneConsenso';
import { RPT_TagDocument }                      from 'src/app/_models/RPT_TagDocument';

//#endregion
@Component({
  selector: 'app-procedura-iscrizione',
  templateUrl: './procedura-iscrizione.component.html',
  styleUrls: ['./procedura-iscrizione.css']
})

export class ProceduraIscrizioneComponent implements OnInit {

//#region ----- Variabili ----------------------

  public obsIscrizione$!:                       Observable<CLS_Iscrizione>;
  public genitoriArr:                           ALU_Genitore[] = [];
  public iscrizione!:                           CLS_Iscrizione;
  //private form! :                               UntypedFormGroup;
  public iscrizioneID!:                         number;
  rettaConcordata!:                             number;

//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChildren(PersonaFormComponent) PersonaFormComponent!: QueryList<PersonaFormComponent>;
  @ViewChild('formIscrizioneConsensi') ConsensiFormComponent!: IscrizioneConsensiComponent;
  @ViewChild('formIscrizioneDatiEconomici') DatiEconomiciFormComponent!: IscrizioneConsensiComponent;

  @ViewChild('stepper') stepper!:               MatStepper;
//#endregion

//#region ----- Constructor --------------------

  constructor(
              private svcIscrizioni:            IscrizioniService,
              private svcIscrizioneConsensi:    IscrizioneConsensiService,
              private svcOpenXML:               OpenXMLService,
              private svcRette:                 RetteService,

              private actRoute:                 ActivatedRoute,
              private _snackBar:                MatSnackBar ) { 

    // this.form = this.fb.group({
    //   id:                         [null],
    //   tipoPersonaID:              [''],
    //   ckAttivo:                   [true],
    // });
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    //estraggo lo user
    // this.currUser = Utility.getCurrentUser();

    //verifico se è un genitore  //TODO va inserito campo ckGenitore
    // if (this.currUser.TipoPersona.ckGenitore) {
    //   this.genitoreBool = true;
    // }
    // this.genitoreBool = true; //per ora lo imposto fisso

    //se è un genitore vado a caricarne i figli
    //ma mi serve il genitoreID e non personaID

    // this.obsFigli$ = this.svcGenitori.getByPersona(this.currUser.personaID)
    // .pipe(
    //   //in base al genitoreID estraggo tutti i figli
    //   concatMap(genitore => this.svcAlunni.listByGenitore(genitore.id))
    // );

    this.actRoute.queryParams.subscribe(
      params => {
        this.iscrizioneID = params['iscrizioneID'];     
    });

    this.loadData()
  }

  loadData() {

    this.svcRette.sumConcordateByIscrizione(this.iscrizioneID).subscribe(rettaConcordata=> {this.rettaConcordata = rettaConcordata;})

    //ottengo dall'iscrizione tutti i dati: dell'alunno e dei genitori
    this.svcIscrizioni.get(this.iscrizioneID).subscribe(
      res => {
        // console.log ("res",res);
        this.iscrizione = res;
        res.alunno._Genitori!.forEach(
           (genitorealunno: ALU_GenitoreAlunno) =>{
             this.genitoriArr.push(genitorealunno.genitore!);   //AS: ATTENZIONE: questa riga carica o genitori ma manda in errore:
                                                                //ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value for 'tabIndex': '0'. Current value: '-1'.
           }
        )
      }
    );
  }
//#endregion

//#region ----- Altri metodi -------------------

  salvaPersona(n: number){
    //this.form.controls.tipoPersonaID.setValue(n);
    //this.form.patchValue(PersonaFormComponentArray[this.stepper.selectedIndex-1].form.value);  //una volta ci portavamo qui il form......
    this.PersonaFormComponent.toArray()[this.stepper.selectedIndex-1].save()
    .subscribe({
      next: ()=> {},
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    })
  }

  async salvaConsensi(tipo: string) {

    await firstValueFrom(this.svcIscrizioneConsensi.deleteByIscrizioneAndTipo(this.iscrizioneID, tipo));

    let formValues! : any;

    if (tipo == 'Consensi')    formValues = this.ConsensiFormComponent.formConsensi.value;
    if (tipo == 'Dati Economici')    formValues = this.DatiEconomiciFormComponent.formConsensi.value;

    //devo trasformare questo ogetto in un altro
    //ad esempio da
    // const formValues = {
    //   3: true,
    //   8: '3',
    //   11: true,
    //   13: true,
    //   14: 2,
    //   15: true,
    //   16: 3,
    //   17: 4,
    //   18: 5
    // }; 
    //deve diventare

    // consensoID risposta1 risposta2 risposta3 risposta4 risposta5
    // 3 true false false false false
    // 8 false false true false false
    // 11 true false false false false
    // 13 true false false false false
    // 14 false true false false false
    // 15 true false false false false
    // 16 false false true false false

    let form : CLS_IscrizioneConsenso;

    for (const key in formValues) {
      if (formValues.hasOwnProperty(key)) {
        const value = formValues[key];
        const consensoId = parseInt(key);
        const risposta1 = value === true || parseInt(value) === 1 ? true : false;
        const risposta2 = parseInt(value) === 2 ? true : false;
        const risposta3 = parseInt(value) === 3 ? true : false;
        const risposta4 = parseInt(value) === 4 ? true : false;
        const risposta5 = parseInt(value) === 5 ? true : false;
        const risposta6 = parseInt(value) === 6 ? true : false;
    
        form = {
          iscrizioneID: this.iscrizioneID,
          consensoID: consensoId,
          tipo: tipo,
          risposta1: risposta1,
          risposta2: risposta2,
          risposta3: risposta3,
          risposta4: risposta4,
          risposta5: risposta5,
          risposta6: risposta6,
        };
        this.svcIscrizioneConsensi.post(form).subscribe(
          {
            next: res=> {
              // console.log ("inserita domanda", consensoId)
            },
            error: err=> {
              // console.log ("errore nell'nserimento", consensoId)
            }
          }
        )

      }
    }

  }

  downloadModuloIscrizione() {

    let nomeFile = "ModuloIscrizione"  + '_' + this.iscrizione.classeSezioneAnno.anno.annoscolastico + "_" + this.iscrizione.alunno.persona.cognome + ' ' + this.iscrizione.alunno.persona.nome + '.docx'

    let tagDocument : RPT_TagDocument = {
      templateName: "ModuloIscrizioni",
      tagFields:
      [
        { tagName: "AnnoScolastico",            tagValue: this.iscrizione.classeSezioneAnno.anno.annoscolastico},

        { tagName: "TipoGenitore1",             tagValue: this.iscrizione.alunno._Genitori![0].genitore?.tipoGenitore?.descrizione},
        { tagName: "NomeGenitore1",             tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.nome},
        { tagName: "CognomeGenitore1",          tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.cognome},
        { tagName: "ComuneNascitaGenitore1",    tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.comuneNascita},
        { tagName: "ProvNascitaGenitore1",      tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.provNascita},
        { tagName: "dtNascitaGenitore1",        tagValue: Utility.formatDate(this.iscrizione.alunno._Genitori![0].genitore?.persona.dtNascita, FormatoData.dd_mm_yyyy)},
        { tagName: "PaeseNascitaGenitore1",     tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.nazioneNascita},
        { tagName: "CFGenitore1",               tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.cf},
        { tagName: "IndirizzoGenitore1",        tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.indirizzo},
        { tagName: "CAPGenitore1",              tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.cap},
        { tagName: "ComuneGenitore1",           tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.comune},
        { tagName: "ProvGenitore1",             tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.prov},
        { tagName: "Tel1Genitore1",             tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.telefono},
        { tagName: "Tel2Genitore1",             tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.telefono1},
        { tagName: "EmailGenitore1",            tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.email},

        { tagName: "TipoGenitore2",             tagValue: this.iscrizione.alunno._Genitori![1].genitore?.tipoGenitore?.descrizione},
        { tagName: "NomeGenitore2",             tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.nome},
        { tagName: "CognomeGenitore2",          tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.cognome},
        { tagName: "ComuneNascitaGenitore2",    tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.comuneNascita},
        { tagName: "ProvNascitaGenitore2",      tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.provNascita},
        { tagName: "dtNascitaGenitore2",        tagValue: Utility.formatDate(this.iscrizione.alunno._Genitori![1].genitore?.persona.dtNascita, FormatoData.dd_mm_yyyy)},
        { tagName: "PaeseNascitaGenitore2",     tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.nazioneNascita},
        { tagName: "CFGenitore2",               tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.cf},
        { tagName: "IndirizzoGenitore2",        tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.indirizzo},
        { tagName: "CAPGenitore2",              tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.cap},
        { tagName: "ComuneGenitore2",           tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.comune},
        { tagName: "ProvGenitore2",             tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.prov},
        { tagName: "Tel1Genitore2",             tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.telefono},
        { tagName: "Tel2Genitore2",             tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.telefono1},
        { tagName: "EmailGenitore2",            tagValue: this.iscrizione.alunno._Genitori![1].genitore?.persona.email},

        { tagName: "ilFigliolaFiglia",          tagValue: this.iscrizione.alunno.persona.genere == "M"? "il figlio": "la figlia"},

        { tagName: "NomeAlunno",                tagValue: this.iscrizione.alunno.persona.nome},
        { tagName: "CognomeAlunno",             tagValue: this.iscrizione.alunno.persona.cognome},
        { tagName: "ComuneNascitaAlunno",       tagValue: this.iscrizione.alunno.persona.comuneNascita},
        { tagName: "ProvNascitaAlunno",         tagValue: this.iscrizione.alunno.persona.provNascita},
        { tagName: "dtNascitaAlunno",           tagValue: Utility.formatDate(this.iscrizione.alunno.persona.dtNascita, FormatoData.dd_mm_yyyy)},
        { tagName: "PaeseNascitaAlunno",        tagValue: this.iscrizione.alunno.persona.nazioneNascita},
        { tagName: "CFAlunno",                  tagValue: this.iscrizione.alunno.persona.cf},
        { tagName: "IndirizzoAlunno",           tagValue: this.iscrizione.alunno.persona.indirizzo},
        { tagName: "CAPAlunno",                 tagValue: this.iscrizione.alunno.persona.cap},
        { tagName: "ComuneAlunno",              tagValue: this.iscrizione.alunno.persona.comune},
        { tagName: "ProvAlunno",                tagValue: this.iscrizione.alunno.persona.prov},
        { tagName: "TelAlunno",                 tagValue: this.iscrizione.alunno.persona.telefono},
        { tagName: "EmailAlunno",               tagValue: this.iscrizione.alunno.persona.email},
        { tagName: "ckDisabile",                tagValue: this.iscrizione.alunno.ckDisabile? "[SI]": "[NO]"},
        { tagName: "ckDSA",                     tagValue: this.iscrizione.alunno.ckDSA? "[SI]": "[NO]"},

        { tagName: "DescrizioneClasse",         tagValue: this.iscrizione.classeSezioneAnno.classeSezione.classe?.descrizione2},
        { tagName: "RettaConcordata",           tagValue: this.rettaConcordata.toString()},


      ]
    }

    //aggiungo a tagDocument i tag delle domande "DatiEconomici" su CLS_IscrizioneConsensi
    //estraggo le domande e le risposte

    this.svcIscrizioneConsensi.list()
    // .subscribe(val=>console.log("val", val));
    .pipe( 
      map(res=> res.filter((x) => x.tipo == "Dati Economici")), //carico domande xdati economici a seconda del valore in input
    ).subscribe()
    ;  

    console.log (tagDocument);
    this.svcOpenXML.downloadFile(tagDocument, nomeFile );

  }


//#endregion

}
