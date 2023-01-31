import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup }               from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { iif, Observable, of }                  from 'rxjs';
import { concatMap, debounceTime, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router }               from '@angular/router';

//components
import { AlunniListComponent }                  from '../../alunni/alunni-list/alunni-list.component';
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { PersonaFormComponent }                 from '../../persone/persona-form/persona-form.component';

//services
import { GenitoriService }                      from 'src/app/_components/genitori/genitori.service';
import { PersoneService }                       from '../../persone/persone.service';
import { ComuniService }                        from 'src/app/_services/comuni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { AlunniService }                        from '../../alunni/alunni.service';
import { TipiGenitoreService }                  from '../tipi-genitore.service';


//models
import { ALU_Genitore }                         from 'src/app/_models/ALU_Genitore';
import { _UT_Comuni }                           from 'src/app/_models/_UT_Comuni';
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { ALU_TipoGenitore }                     from 'src/app/_models/ALU_Tipogenitore';


@Component({
  selector: 'app-genitore-edit',
  templateUrl: './genitore-edit.component.html',
  styleUrls: ['./../genitori.css']
})

export class GenitoreEditComponent implements OnInit {

//#region ----- Variabili -------
  public personaID!:                            number;

  genitore$!:                                   Observable<ALU_Genitore>;
  obsTipiGenitore$!:                            Observable<ALU_TipoGenitore[]>;
  genitoreNomeCognome :                         string = "";
  formGenitore! :                               FormGroup;

  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;

  filteredComuni$!:                             Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:                      Observable<_UT_Comuni[]>;
  comuniIsLoading:                              boolean = false;
  comuniNascitaIsLoading:                       boolean = false;
  breakpoint!:                                  number;
  selectedTab:                                  number = 0;

//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('alunniFamiglia') alunniFamigliaComponent!: AlunniListComponent; 
  @ViewChild(PersonaFormComponent) personaFormComponent!: PersonaFormComponent; 

//#endregion

  constructor(
    public _dialogRef: MatDialogRef<GenitoreEditComponent>,
    @Inject(MAT_DIALOG_DATA) public genitoreID: number,
    private fb:                                 FormBuilder, 
    private svcGenitori:                        GenitoriService,
    private svcTipiGenitore:                    TipiGenitoreService,

    private svcPersone:                         PersoneService,
    private svcAlunni:                          AlunniService, //serve perchè è in questa che si trovano le addToFamily e RemoveFromFamily"
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar,
    private _loadingService :                   LoadingService
  ) {

    _dialogRef.disableClose = true;


    this.formGenitore = this.fb.group(
    {
      id:                         [null],

      tipoGenitoreID:             [''],
      titoloStudio:               [''],
      professione:                ['']
    });

    this.obsTipiGenitore$ = this.svcTipiGenitore.list();

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
            //genitore => this.formPersona.patchValue(genitore)
            genitore => {

              this.personaID = genitore.personaID;

              this.genitoreNomeCognome = genitore.persona.nome + " "+ genitore.persona.cognome;

              this.formGenitore.controls.id.setValue(genitore.id); 
              this.formGenitore.controls.tipoGenitoreID.setValue(genitore.tipoGenitoreID); 
              this.formGenitore.controls.titoloStudio.setValue(genitore.titoloStudio );
              this.formGenitore.controls.professione.setValue(genitore.professione);
            }
          )
      );
    } 
    else this.emptyForm = true
    
  }  

//#endregion

//#region ----- Operazioni CRUD -------

  save()
  {

    let genitoreObj: ALU_Genitore = {
      id:                         this.formGenitore.value.id,
      personaID:                  this.personaFormComponent.form.value.id,

      tipoGenitoreID:             this.formGenitore.value.tipoGenitoreID,
      titoloStudio:               this.formGenitore.value.titoloStudio,
      professione:                this.formGenitore.value.professione,

      persona: this.personaFormComponent.form.value
    }

    if (this.genitoreID == null || this.genitoreID == 0) {


      this.personaFormComponent.save();
      genitoreObj.personaID =   this.personaFormComponent.form.value.id;
      
      this.svcGenitori.post(genitoreObj)
      .subscribe(
        res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        err => this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      ) 
    }
    else {

      this.svcPersone.put(this.personaFormComponent.form.value)
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
    
  }


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

  selectedTabValue(event: any){
    this.selectedTab = event.index;
  }
//#endregion
}
