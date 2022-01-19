import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

//components
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//services
import { ComuniService } from 'src/app/_services/comuni.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { PersoneService } from '../persone.service';

//models
import { PER_Persona } from 'src/app/_models/PER_Persone';
import { _UT_Comuni } from 'src/app/_models/_UT_Comuni';


@Component({
  selector: 'app-persona-edit',
  templateUrl: './persona-edit.component.html',
  styleUrls: ['../persone.css']
})
export class PersonaEditComponent implements OnInit {

//#region ----- Variabili -------
  persona$!:                    Observable<PER_Persona>;
  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  filteredComuni$!:           Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:    Observable<_UT_Comuni[]>;
  comuniIsLoading:            boolean = false;
  comuniNascitaIsLoading:     boolean = false;
  breakpoint!:                number;
  breakpoint2!:               number;
//#endregion

  constructor(
    public _dialogRef: MatDialogRef<PersonaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public idPersona: number,
    private fb:                           FormBuilder, 
    private svcPersone:                   PersoneService,
    private svcComuni:                    ComuniService,
    public _dialog:                       MatDialog,
    private _snackBar:                    MatSnackBar,
    private _loadingService :             LoadingService,
  ) { 
    _dialogRef.disableClose = true;
    let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";

    this.form = this.fb.group({
      id:                         [null],
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
      email:                      ['',Validators.email],

    });
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;

    if (this.idPersona && this.idPersona + '' != "0") {

      const obsPersona$: Observable<PER_Persona> = this.svcPersone.loadPersona(this.idPersona);
      const loadPersona$ = this._loadingService.showLoaderUntilCompleted(obsPersona$);

      this.persona$ = loadPersona$
      .pipe(
          tap(
            persona => this.form.patchValue(persona)
          )
      );
    } else {
      this.emptyForm = true
    }
    
    //********************* FILTRO COMUNE *******************
    this.filteredComuni$ = this.form.controls['comune'].valueChanges
    .pipe(
      tap(),
      debounceTime(300),
      tap(() => this.comuniIsLoading = true),
      //delayWhen(() => timer(2000)),
      switchMap(() => this.svcComuni.filterComuni(this.form.value.comune)),
      tap(() => this.comuniIsLoading = false)
    )

    //********************* FILTRO COMUNE NASCITA ***********
    this.filteredComuniNascita$ = this.form.controls['comuneNascita'].valueChanges
    .pipe(
      tap(),
      debounceTime(300),
      tap(() => this.comuniNascitaIsLoading = true),
      switchMap(() => this.svcComuni.filterComuni(this.form.value.comuneNascita)),
      tap(() => this.comuniNascitaIsLoading = false)
    )
  }
//#endregion

//#region ----- Operazioni CRUD -------

  save(){

    if (this.form.controls['id'].value == null) 
      this.svcPersone.post(this.form.value)
        .subscribe(res=> {
          //console.log("return from post", res);
          //this.form.markAsPristine();
          this._dialogRef.close();
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
    );
    else 
      this.svcPersone.put(this.form.value)
        .subscribe(res=> {
          //console.log("return from put", res);
          //this.form.markAsPristine();
          this._dialogRef.close();
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
    );
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
  }

  delete(){

    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(result => {
      if(result){
        this.svcPersone.delete(Number(this.idPersona))
        //.pipe (
        //  finalize(()=>this.router.navigate(['/alunni']))
        //)
        .subscribe(
          res=>{
            this._snackBar.openFromComponent(SnackbarComponent,
              {data: 'Record cancellato', panelClass: ['red-snackbar']}
            );
            this._dialogRef.close();
          },
          err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          )
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

onResize(event: any) {
  this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 4;
  this.breakpoint2 = (event.target.innerWidth <= 800) ? 2 : 4;
}
//#endregion
}
