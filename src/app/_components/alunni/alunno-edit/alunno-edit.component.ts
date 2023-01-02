import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { iif, Observable, of } from 'rxjs';
import { concatMap, debounceTime, switchMap, tap } from 'rxjs/operators';

//components
import { ClassiSezioniAnniListComponent } from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { GenitoreEditComponent } from '../../genitori/genitore-edit/genitore-edit.component';
import { GenitoriListComponent } from '../../genitori/genitori-list/genitori-list.component';

import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { AlunniService } from 'src/app/_components/alunni/alunni.service';
import { PersoneService } from '../../persone/persone.service';
import { ComuniService } from 'src/app/_services/comuni.service';
import { IscrizioniService } from '../../iscrizioni/iscrizioni.service';
import { LoadingService } from '../../utilities/loading/loading.service';

//models
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { _UT_Comuni } from 'src/app/_models/_UT_Comuni';
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { PER_Persona } from 'src/app/_models/PER_Persone';



@Component({
  selector:     'app-alunno-edit',
  templateUrl:  './alunno-edit.component.html',
  styleUrls:    ['./../alunni.css']
})

export class AlunnoEditComponent implements OnInit {

//#region ----- Variabili -------

  alunno$!:                   Observable<ALU_Alunno>;
  alunnoNomeCognome:          string = "";
  formPersona! :              FormGroup;
  formAlunno! :               FormGroup;

  emptyForm :                 boolean = false;
  loading:                    boolean = true;
  breakpoint!:                number;
  breakpoint2!:               number;

  filteredComuni$!:           Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:    Observable<_UT_Comuni[]>;
  comuniIsLoading:            boolean = false;
  comuniNascitaIsLoading:     boolean = false;

//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('genitoriFamiglia') genitoriFamigliaComponent!:            GenitoriListComponent; 
  @ViewChild('iscrizioniAlunno') classiAttendedComponent!:              ClassiSezioniAnniListComponent; 
  @ViewChild('classiSezioniAnniList') classiSezioniAnniListComponent!:  ClassiSezioniAnniListComponent; 
//#endregion

  constructor( public _dialogRef: MatDialogRef<AlunnoEditComponent>,
               @Inject(MAT_DIALOG_DATA) public alunnoID: number,
               private fb:                           FormBuilder, 
               private svcIscrizioni:                IscrizioniService,
               private svcAlunni:                    AlunniService,
               private svcPersone:                   PersoneService,
               private svcComuni:                    ComuniService,

               public _dialog:                       MatDialog,
               private _snackBar:                    MatSnackBar,
               private _loadingService :             LoadingService ) {

    _dialogRef.disableClose = true;
    let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";
    
    this.formPersona = this.fb.group({
      id:                         [null],
      personaID:                  [null],
      tipoPersonaID:              [null],

      nome:                       ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      cognome:                    ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      dtNascita:                  ['', Validators.required],
      comuneNascita:              ['', Validators.maxLength(50)],
      provNascita:                ['', Validators.maxLength(2)] ,
      nazioneNascita:             ['', Validators.maxLength(3)],
      indirizzo:                  ['', Validators.maxLength(255)],
      comune:                     ['', Validators.maxLength(50)],
      prov:                       ['', Validators.maxLength(2)],
      cap:                        ['', Validators.maxLength(5)],
      nazione:                    ['', Validators.maxLength(3)],
      genere:                     ['',{ validators:[Validators.maxLength(1), Validators.required, Validators.pattern("M|F")]}],
      cf:                         ['',{ validators:[Validators.maxLength(16), Validators.pattern(regCF)]}],
      telefono:                   ['', Validators.maxLength(13)],
      telefono1:                   ['', Validators.maxLength(13)],

      email:                      ['', Validators.email],
      ckAttivo:                   [true]
      // scuolaProvenienza:          ['', Validators.maxLength(255)],
      // indirizzoScuolaProvenienza: ['', Validators.maxLength(255)],
      // ckAttivo:                   [true],
      // ckDSA:                      [false],
      // ckDisabile:                 [false],
      // ckAuthFoto:                 [false],
      // ckAuthUsoMateriale:         [false],
      // ckAuthUscite:               [false]
    });

    this.formAlunno = this.fb.group(
      {
        scuolaProvenienza:          ['', Validators.maxLength(255)],
        indirizzoScuolaProvenienza: ['', Validators.maxLength(255)],

        ckDSA:                      [false],
        ckDisabile:                 [false],
        ckAuthFoto:                 [false],
        ckAuthUsoMateriale:         [false],
        ckAuthUscite:               [false]
      });
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit () {
    this.loadData();
  }

  loadData(){

    //this.alunnoID = this.route.snapshot.params['id'];  
    // this.caller_page = this.route.snapshot.queryParams["page"];
    // this.caller_size = this.route.snapshot.queryParams["size"];
    // this.caller_filter = this.route.snapshot.queryParams["filter"];
    // this.caller_sortField = this.route.snapshot.queryParams["sortField"];
    // this.caller_sortDirection = this.route.snapshot.queryParams["sortDirection"];
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;


    //********************* POPOLAMENTO FORM *******************
    //serve distinguere tra form vuoto e form popolato in arrivo da lista alunni
    
    if (this.alunnoID && this.alunnoID + '' != "0") {

      const obsAlunno$: Observable<ALU_Alunno> = this.svcAlunni.get(this.alunnoID);
      const loadAlunno$ = this._loadingService.showLoaderUntilCompleted(obsAlunno$);
      //TODO: capire perchè serve sia alunno | async e sia il popolamento di form
      this.alunno$ = loadAlunno$
      .pipe(
          tap(
            alunno => {

              this.alunnoNomeCognome = alunno.persona.nome + " " + alunno.persona.cognome;

              this.formPersona.controls['id'].setValue(alunno.id);
              this.formPersona.controls['personaID'].setValue(alunno.personaID);  //non dovrebbe essere parte del formAlunno?

              this.formPersona.controls['nome'].setValue(alunno.persona!.nome);
              this.formPersona.controls['cognome'].setValue(alunno.persona!.cognome);
              this.formPersona.controls['dtNascita'].setValue(alunno.persona!.dtNascita);
              this.formPersona.controls['genere'].setValue(alunno.persona!.genere);
              this.formPersona.controls['cf'].setValue(alunno.persona!.CF);

              this.formPersona.controls['comuneNascita'].setValue(alunno.persona!.comuneNascita);
              this.formPersona.controls['provNascita'].setValue(alunno.persona!.provNascita);
              this.formPersona.controls['nazioneNascita'].setValue(alunno.persona!.nazioneNascita);

              this.formPersona.controls['comune'].setValue(alunno.persona!.comune);
              this.formPersona.controls['prov'].setValue(alunno.persona!.prov);
              this.formPersona.controls['nazione'].setValue(alunno.persona!.nazione);

              this.formPersona.controls['indirizzo'].setValue(alunno.persona!.indirizzo);
              this.formPersona.controls['cap'].setValue(alunno.persona!.cap);

              this.formPersona.controls['telefono'].setValue(alunno.persona!.telefono);
              this.formPersona.controls['telefono1'].setValue(alunno.persona!.telefono1);

              this.formPersona.controls['email'].setValue(alunno.persona!.email);
              this.formPersona.controls['ckAttivo'].setValue(alunno.persona.ckAttivo);

              this.formAlunno.controls['scuolaProvenienza'].setValue(alunno.scuolaProvenienza);
              this.formAlunno.controls['indirizzoScuolaProvenienza'].setValue(alunno.indirizzoScuolaProvenienza);

              this.formAlunno.controls['ckDSA'].setValue(alunno.ckDSA);
              this.formAlunno.controls['ckDisabile'].setValue(alunno.ckDisabile);
              this.formAlunno.controls['ckAuthFoto'].setValue(alunno.ckAuthFoto);
              this.formAlunno.controls['ckAuthUscite'].setValue(alunno.ckAuthUscite);
              this.formAlunno.controls['ckAuthUsoMateriale'].setValue(alunno.ckAuthUsoMateriale);
            }       
          )
      );
    }
    else this.emptyForm = true
        
    //********************* FILTRO COMUNE *******************
    this.filteredComuni$ = this.formPersona.controls['comune'].valueChanges
    .pipe(
      tap(),
      debounceTime(300),
      tap(() => this.comuniIsLoading = true),
      //delayWhen(() => timer(2000)),
      switchMap(() => this.svcComuni.filterList(this.formPersona.value.comune)),
      tap(() => this.comuniIsLoading = false)
    )

    //********************* FILTRO COMUNE NASCITA ***********
    this.filteredComuniNascita$ = this.formPersona.controls['comuneNascita'].valueChanges
    .pipe(
      tap(),
      debounceTime(300),
      tap(() => this.comuniNascitaIsLoading = true),
      switchMap(() => this.svcComuni.filterList(this.formPersona.value.comuneNascita)),
      tap(() => this.comuniNascitaIsLoading = false)
    )
  }
//#endregion



//#region ----- Operazioni CRUD -------
  save(){

    let personaObj: PER_Persona = {

      nome :          this.formPersona.value.nome,
      cognome :       this.formPersona.value.cognome,
      dtNascita :     this.formPersona.value.dtNascita,
      comuneNascita : this.formPersona.value.comuneNascita,
      provNascita :   this.formPersona.value.provNascita,
      nazioneNascita : this.formPersona.value.nazioneNascita,
      indirizzo :     this.formPersona.value.indirizzo,
      comune :        this.formPersona.value.comune,
      prov :          this.formPersona.value.prov,
      cap :           this.formPersona.value.cap,
      nazione :       this.formPersona.value.nazione,
      genere :        this.formPersona.value.genere,
      CF :            this.formPersona.value.cf,
      telefono :      this.formPersona.value.telefono,
      telefono1 :     this.formPersona.value.telefono1,

      email :         this.formPersona.value.email,
      ckAttivo:       this.formPersona.value.ckAttivo,

      tipoPersonaID : 1, //Alunno
      id : this.formPersona.value.personaID
    }

    let alunnoObj: ALU_Alunno = {
      id:                         this.formPersona.value.id,
      personaID:                  this.formPersona.value.personaID,

      ckDisabile:                 this.formAlunno.value.ckDisabile,
      ckDSA:                      this.formAlunno.value.ckDSA,
      ckAuthFoto:                 this.formAlunno.value.ckAuthFoto,
      ckAuthUsoMateriale:         this.formAlunno.value.ckAuthUsoMateriale,
      ckAuthUscite:               this.formAlunno.value.ckAuthUscite,
      scuolaProvenienza:          this.formAlunno.value.scuolaProvenienza,
      indirizzoScuolaProvenienza: this.formAlunno.value.indirizzoScuolaProvenienza,

      persona: personaObj
    }

    if (this.alunnoID == null || this.alunnoID == 0)    {
      this.svcPersone.post(personaObj)
      .pipe(
        tap(res=> {
          console.log ("res", res); 
          alunnoObj.personaID = res.id;  
        }),
        concatMap( () => this.svcAlunni.post(alunnoObj))
      ).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      ) 
    }
    else {
      this.svcPersone.put(personaObj)
      .pipe(
        concatMap( () => this.svcAlunni.put(alunnoObj))
      ).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      ) 
    }
  }

  delete()
  {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });

    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {
        this.svcAlunni.delete(Number(this.alunnoID)).subscribe (
          res=> {
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
            this._dialogRef.close();
          },
          err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']}  )
        );
      }
    });
  }

//#endregion

  popolaProv(prov: string, cap: string) {
    this.formPersona.controls['prov'].setValue(prov);
    this.formPersona.controls['cap'].setValue(cap);
    this.formPersona.controls['nazione'].setValue('ITA');
  }

  popolaProvNascita(prov: string) {
    this.formPersona.controls['provNascita'].setValue(prov);
    this.formPersona.controls['nazioneNascita'].setValue('ITA');
  }

//#region ----- Metodi di gestione Genitori, Famiglia e Classi -------
  addGenitore(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
      data: 0
    };

    const dialogRef = this._dialog.open(GenitoreEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        () => this.loadData()
    );
  }

  addToFamily(genitore: ALU_Genitore) {
    //devo fare una verifica prima della post:
    //per caso è già figlio? Per questo faccio una concatMap (la post deve avvenire in sequenza quando la verifica è finita)
    //ma con una condizione: la iif specifica proprio che SE il risultato della verifica è vuoto allora si può procedere con la post
    //altrimenti si mette in successione l'observable vuoto (of())
    
    this.svcAlunni.listByGenitoreAlunno(genitore.id, this.alunnoID)
    .pipe(
      concatMap( res => iif (()=> res.length == 0, this.svcAlunni.postGenitoreAlunno(genitore.id, this.alunnoID), of() ))
    ).subscribe(
      res=> this.genitoriFamigliaComponent.loadData(),
      err=> { }
    )
  }

  removeFromFamily(genitore: ALU_Genitore) {
    const alunnoID = this.alunnoID;
    this.svcAlunni.deleteByGenitoreAlunno(genitore.id, this.alunnoID).subscribe(
      res=> this.genitoriFamigliaComponent.loadData(),
      err=> { }
    )
  }

  addToAttended(classeSezioneAnno: CLS_ClasseSezioneAnnoGroup) {
    //così come ho fatto in dialog-add mi costruisco un oggetto "stile" form e lo passo alla postClasseSezioneAnnoAlunno
    //avrei potuto anche passare i valori uno ad uno, ma è già pronta così avendola usata in dialog-add
    let objClasseSezioneAnnoAlunno = {AlunnoID: this.alunnoID, ClasseSezioneAnnoID: classeSezioneAnno.id};
    const checks$ = this.svcIscrizioni.getByAlunnoAndClasseSezioneAnno(classeSezioneAnno.id, this.alunnoID)
    .pipe(
      //se trova che la stessa classe è già presente res.length è != 0 quindi non procede con la getByAlunnoAnno ma restituisce of()
      //se invece res.length == 0 dovrebbe proseguire e concatenare la verifica successiva ch è getByAlunnoAndAnno...
      //invece "test" non compare mai...quindi? sta uscendo sempre con of()?
      tap(res=> {
          if (res != null) {
            this._dialog.open(DialogOkComponent, {
              width: '320px',
              data: {titolo: "ATTENZIONE!", sottoTitolo: "Questa classe è già stata inserita!"}
            });
          } else {
            //l'alunno non frequenta la classe a cui sto cercando di iscriverlo, posso procedere
          }
        }
      ),
      concatMap( res => iif (()=> res == null,
        this.svcIscrizioni.getByAlunnoAndAnno(classeSezioneAnno.annoID, this.alunnoID) , of() )
      ),
      tap(res=> {
        if (res != null) {
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: "E' già stata inserita una classe in quest'anno!"}
          });
        } else {
          //console.log("l'alunno non frequenta alcuna classe nell'anno a cui sto cercando di iscriverlo, posso procedere
        }
      })

    )
    checks$.pipe(
      concatMap( res => iif (()=> res == null, this.svcIscrizioni.post(objClasseSezioneAnnoAlunno) , of() )
      )
    ).subscribe(
      res=> { this.classiAttendedComponent.loadData() },
      err=> { }
    )
  }

  removeFromAttended(classeSezioneAnno: CLS_ClasseSezioneAnno) {
    this.svcIscrizioni.deleteByAlunnoAndClasseSezioneAnno(classeSezioneAnno.id , this.alunnoID).subscribe(
      res=> { this.classiAttendedComponent.loadData() },
      err=> { }
    )
  }
//#endregion

//#region ----- Eventi -------

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (event.target.innerWidth <= 800) ? 2 : 4;
  }
//#endregion

}

