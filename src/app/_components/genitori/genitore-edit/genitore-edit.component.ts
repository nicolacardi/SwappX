import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { iif, Observable, of } from 'rxjs';
import { concatMap, debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

//components
import { AlunniListComponent } from '../../alunni/alunni-list/alunni-list.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { GenitoriService } from 'src/app/_components/genitori/genitori.service';
import { PersoneService } from '../../persone/persone.service';
import { ComuniService } from 'src/app/_services/comuni.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { AlunniService } from '../../alunni/alunni.service';

//models
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { _UT_Comuni } from 'src/app/_models/_UT_Comuni';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { PER_Persona } from 'src/app/_models/PER_Persone';
import { TOUCH_BUFFER_MS } from '@angular/cdk/a11y/input-modality/input-modality-detector';

@Component({
  selector: 'app-genitore-edit',
  templateUrl: './genitore-edit.component.html',
  styleUrls: ['./../genitori.css']
})

export class GenitoreEditComponent implements OnInit {

//#region ----- Variabili -------

  genitore$!:                 Observable<ALU_Genitore>;
  genitoreNomeCognome :       string = "";
  form! :                     FormGroup;
  formGenitore! :             FormGroup;

  emptyForm :                 boolean = false;
  loading:                    boolean = true;

  filteredComuni$!:           Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:    Observable<_UT_Comuni[]>;
  comuniIsLoading:            boolean = false;
  comuniNascitaIsLoading:     boolean = false;
  breakpoint!:                number;
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('alunniFamiglia') alunniFamigliaComponent!: AlunniListComponent; 
//#endregion

  constructor(
    public _dialogRef: MatDialogRef<GenitoreEditComponent>,
    @Inject(MAT_DIALOG_DATA) public genitoreID: number,
    private fb:             FormBuilder, 
    private route:          ActivatedRoute,
    private router:         Router,
    private svcGenitori:    GenitoriService,
    private svcPersone:     PersoneService,
    private svcAlunni:      AlunniService, //serve perchè è in questa che si trovano le addToFamily e RemoveFromFamily"
    private svcComuni:      ComuniService,
    public _dialog:         MatDialog,
    private _snackBar:      MatSnackBar,
    private _loadingService :LoadingService  ) {

    _dialogRef.disableClose = true;
    let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";
    let regemail = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$";
    
    this.form = this.fb.group({
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
      tipo:                       ['',{ validators:[Validators.maxLength(1), Validators.required, Validators.pattern("P|M|T")]}],
      cf:                         ['',{ validators:[Validators.maxLength(16), Validators.pattern(regCF)]}],
      telefono:                   ['', Validators.maxLength(13)],
      telefono2:                  ['', Validators.maxLength(13)],
      email:                      ['',Validators.email],
      //email:                      ['', Validators.pattern(regemail)]

      ckAttivo:                   [true]
    });

    this.formGenitore = this.fb.group(
    {
      titoloStudio:               [''],
      professione:                ['']
    });
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;

    //********************* POPOLAMENTO FORM *******************
    //serve distinguere tra form vuoto e form popolato in arrivo da lista alunni
    
    if (this.genitoreID && this.genitoreID + '' != "0") {

      const obsGenitore$: Observable<ALU_Genitore> = this.svcGenitori.get(this.genitoreID);
      const loadGenitore$ = this._loadingService.showLoaderUntilCompleted(obsGenitore$);
      //TODO: capire perchè serve sia alunno | async e sia il popolamento di form
      this.genitore$ = loadGenitore$
      .pipe(
          tap(
            //genitore => this.form.patchValue(genitore)
            genitore => {

              this.genitoreNomeCognome = genitore.persona.nome + " "+ genitore.persona.cognome;
              //Dati PER_Persona
              this.form.controls['id'].setValue(genitore.id);
              this.form.controls['personaID'].setValue(genitore.personaID);

              this.form.controls['nome'].setValue(genitore.persona!.nome);
              this.form.controls['cognome'].setValue(genitore.persona!.cognome);
              this.form.controls['dtNascita'].setValue(genitore.persona!.dtNascita);
              
              this.form.controls['cf'].setValue(genitore.persona!.CF);

              this.form.controls['comuneNascita'].setValue(genitore.persona!.comuneNascita);
              this.form.controls['provNascita'].setValue(genitore.persona!.provNascita);
              this.form.controls['nazioneNascita'].setValue(genitore.persona!.nazioneNascita);

              this.form.controls['comune'].setValue(genitore.persona!.comune);
              this.form.controls['prov'].setValue(genitore.persona!.prov);
              this.form.controls['nazione'].setValue(genitore.persona!.nazione);

              this.form.controls['indirizzo'].setValue(genitore.persona!.indirizzo);
              this.form.controls['cap'].setValue(genitore.persona!.cap);
              this.form.controls['telefono'].setValue(genitore.persona!.telefono);
              this.form.controls['email'].setValue(genitore.persona!.email);

              this.form.controls['ckAttivo'].setValue(genitore.persona!.ckAttivo);

              //Dati ALU_Genitore
              this.form.controls['tipo'].setValue(genitore.tipo);  //incredibile: non esisteva tipo nel model e funzionava con il patchValue!
              //this.formGenitore.controls['ckAttivo'].setValue(genitore.persona.ckAttivo);
              this.formGenitore.controls['titoloStudio'].setValue(genitore.titoloStudio );
              this.formGenitore.controls['professione'].setValue(genitore.professione);
            }
          )
      );
    } 
    else this.emptyForm = true
    
    //********************* FILTRO COMUNE *******************
    this.filteredComuni$ = this.form.controls['comune'].valueChanges
    .pipe(
      tap(),
      debounceTime(300),
      tap(() => this.comuniIsLoading = true),
      switchMap(() => this.svcComuni.filterList(this.form.value.comune)),
      tap(() => this.comuniIsLoading = false)
    )

    //********************* FILTRO COMUNE NASCITA ***********
    this.filteredComuniNascita$ = this.form.controls['comuneNascita'].valueChanges
    .pipe(
      tap(),
      debounceTime(300),
      tap(() => this.comuniNascitaIsLoading = true),
      switchMap(() => this.svcComuni.filterList(this.form.value.comuneNascita)),
      tap(() => this.comuniNascitaIsLoading = false)
    )
  }  

//#endregion

//#region ----- Operazioni CRUD -------

  save()
  {
    let personaObj: PER_Persona = {
      
      nome :          this.form.value.nome,
      cognome :       this.form.value.cognome,
      dtNascita :     this.form.value.dtNascita,
      comuneNascita : this.form.value.comuneNascita,
      provNascita :   this.form.value.provNascita,
      nazioneNascita : this.form.value.nazioneNascita,
      indirizzo :     this.form.value.indirizzo,
      comune :        this.form.value.comune,
      prov :          this.form.value.prov,
      cap :           this.form.value.cap,
      nazione :       this.form.value.nazione,
      genere :        this.form.value.genere,
      CF :            this.form.value.cf,
      telefono :      this.form.value.telefono,
      email :         this.form.value.email,

      ckAttivo:       this.form.value.ckAttivo,
      
      tipoPersonaID : 10,
      id : this.form.value.personaID
    }

    let genitoreObj: ALU_Genitore = {
      id:                         this.form.value.id,
      personaID:                  this.form.value.personaID,

      tipo:                       this.form.value.tipo,
      //ckAttivo:                   this.formGenitore.value.ckAttivo,
      titoloStudio:               this.formGenitore.value.titoloStudio,
      professione:                this.formGenitore.value.professione,

      persona: personaObj
    }

    if (this.genitoreID == null || this.genitoreID == 0) {
      this.svcPersone.post(personaObj)
      .pipe (
        tap(res => {
          genitoreObj.personaID = res.id;
        }),
        concatMap( () => this.svcGenitori.post(genitoreObj))
      ).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      ) 
    }
    else {
      //console.log("put personaObj: ", personaObj);
      this.svcPersone.put(personaObj)
      .pipe(
        concatMap( () => this.svcGenitori.put(genitoreObj))
      ).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      ) 
    }
    
    /*
    this.svcGenitori.post(this.form.value).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      );
    }
    else 
      this.svcGenitori.put(this.form.value).subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']}
      )
    );
    */
  }

  //NON PIU' UTILIZZATA IN QUANTO ORA SI USA SOLO COME DIALOG
  // back(){
  //   if (this.form.dirty) {
  //     const dialogRef = this._dialog.open(DialogYesNoComponent, {
  //       width: '320px',
  //       data: {titolo: "ATTENZIONE", sottoTitolo: "Dati modificati: si conferma l'uscita?"}
  //     });
  //     dialogRef.afterClosed().subscribe(result => {
  //       if(!result) return;
  //       else this.navigateBack();
  //     });
  //   } else {
  //     this.navigateBack();
  //   }               
  // }
  //NON PIU' UTILIZZATA IN QUANTO ORA SI USA SOLO COME DIALOG
  // navigateBack(){
  //   this.router.navigate(["genitori"], {queryParams:{
  //     page: this.caller_page,
  //     size: this.caller_size,
  //     filter: this.caller_filter,
  //     sortField: this.caller_sortField,
  //     sortDirection: this.caller_sortDirection
  //    }});
  // }

  delete()
  {
    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe( result => {
        if(result) {
          this.svcGenitori.delete(Number(this.genitoreID)).subscribe(
            res=>{
              this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          );
        }
    });
  }
//#endregion

//#region ----- Altri metodi -------
  popolaProv(prov: string, cap: string) {
    this.form.controls['prov'].setValue(prov);
    this.form.controls['cap'].setValue(cap);
    this.form.controls['nazione'].setValue('ITA');
  }

  popolaProvNascita(prov: string) {
    this.form.controls['provNascita'].setValue(prov);
    this.form.controls['nazioneNascita'].setValue('ITA');
  }

//#endregion

//#region ----- Metodi di gestione Genitori, Famiglia e Classi -------

  addAlunno() 
  {
     //TODO
  }

  addToFamily(figlio: ALU_Alunno) {
    //devo fare una verifica prima della post:
    //per caso è già figlio? Per questo faccio una concatMap (la post deve avvenire in sequenza quando la verifica è finita)
    //ma con una condizione: la iif specifica proprio che SE il risultato della verifica è vuoto allora si può procedere con la post
    //altrimenti si mette in successione l'observable vuoto (of())
    
    this.svcAlunni.listByGenitoreAlunno(this.genitoreID, figlio.id)
    .pipe(
      concatMap( res => iif (()=> res.length == 0, this.svcAlunni.postGenitoreAlunno(this.genitoreID, figlio.id), of() )
      )
    ).subscribe(
      res=> this.alunniFamigliaComponent.loadData(),
      err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    )
  }

  removeFromFamily(figlio: ALU_Alunno) {
    //devo fare una verifica prima della post:
    //per caso è già figlio? In teoria dovremmo aver nascosto il genitore dalla lista da cui pescare, no?
    const genitoreID = this.genitoreID;
    this.svcAlunni.deleteByGenitoreAlunno(genitoreID, figlio.id).subscribe(
      res=> this.alunniFamigliaComponent.loadData(),
      err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
    )
  }
//#endregion

//#region ----- Altri metodi -------
  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 3;
  }
//#endregion
}
