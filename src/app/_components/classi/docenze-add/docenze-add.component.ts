import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { iif, Observable, of } from 'rxjs';
import { concatMap, debounceTime, delayWhen, finalize, switchMap, tap } from 'rxjs/operators';
import { DialogData } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { MatSnackBar } from '@angular/material/snack-bar';

//components
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//services
import { ClassiDocentiMaterieService } from '../classi-docenti-materie.service';
import { DocentiService } from '../../persone/docenti.service';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';

//classi
import { PER_Docente } from 'src/app/_models/PER_Docente';
import { MAT_Materia } from 'src/app/_models/MAT_Materia';
import { MaterieService } from 'src/app/_services/materie.service';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

@Component({
  selector: 'app-docenze-add',
  templateUrl: './docenze-add.component.html',
  styleUrls: ['./../classi.css']
})

export class DocenzeAddComponent implements OnInit {

//#region ----- Variabili -------
  form! :                     FormGroup;
  obsFilteredDocenti$!:       Observable<PER_Docente[]>;
  obsMaterie$!:               Observable<MAT_Materia[]>;
  docentiIsLoading:           boolean = false;
  classeSezioneAnno!:         CLS_ClasseSezioneAnno;
  public docenteSelectedID!:         number;
  public materiaSelectedID!:         number;
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('nomeCognomeDocente') nomeCognomeDocente!: ElementRef<HTMLInputElement>;
//#endregion

  constructor(
    private fb:                             FormBuilder,
    private svcMaterie:                     MaterieService,
    private svcDocenti:                     DocentiService,
    private svcClasseSezioneAnno:           ClassiSezioniAnniService,
    private svcClassiDocentiMaterie:        ClassiDocentiMaterieService,
    public dialogRef:                       MatDialogRef<DocenzeAddComponent>,
    private _snackBar:                      MatSnackBar,
    public _dialog:                         MatDialog,

    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { 

    this.form = this.fb.group({
      nomeCognomeDocente:     [null],
      selectMateria:          ['']
    });
  }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {

  
    this.svcClasseSezioneAnno.get(this.data.idClasse).subscribe(res => this.classeSezioneAnno = res)

    this.obsFilteredDocenti$ = this.form.controls['nomeCognomeDocente'].valueChanges
      .pipe(
        tap(() => this.docentiIsLoading = true),
        debounceTime(300),
        //delayWhen(() => timer(2000)),
        switchMap(val => 
          this.svcDocenti.filterDocenti(this.form.value.nomeCognomeDocente)       
              // .pipe(
              //   map( val2 => val2.filter(val=>!this.idDocentiSelezionati.includes(val.id)) )//FANTASTICO!!! NON MOSTRA QUELLI GIA'SELEZIONATI! MEGLIO DI GOOGLE CHE LI RIMOSTRA!
              // ) 
        ),
        // switchMap(() => 
        //   this.svcAlunni.listByAnnoNoClasse(this.form.value.nomeCognomeAlunno, this.data.annoID)
        // )
        tap(() => this.docentiIsLoading = false)
    )

    this.form.controls['selectMateria'].valueChanges
          .subscribe(
            val=> this.materiaSelectedID = val
          )
    this.obsMaterie$ = this.svcMaterie.list();
  }

//#endregion
docenteSelected(event: MatAutocompleteSelectedEvent): void {
  this.docenteSelectedID = parseInt(event.option.id);
  console.log ("selected" , this.docenteSelectedID);
}

//#region ----- Operazioni CRUD -------

  save() {

    let objDocenza = {
      DocenteID: this.docenteSelectedID,
      MateriaID: this.materiaSelectedID,
      ClasseSezioneAnnoID: this.data.idClasse,

      ckOrario: true,
      ckPagella: true
    };

    //Bisogna verificare che già in questa classe non ci sia il maestro di questa materia
    //e anche che questo stesso maestro non sia già maestro di questa materia in questa classe

    const checks$ = 
    this.svcClassiDocentiMaterie.getByClasseSezioneAnnoAndMateriaAndDocente(this.data.idClasse, this.materiaSelectedID, this.docenteSelectedID)
    .pipe(
      //se trova che la stessa classe è già presente res.length è != 0 quindi non procede con la getByAlunnoAnno ma restituisce of()
      //se invece res.length == 0 dovrebbe proseguire e concatenare la verifica successiva ch è getByAlunnoAndAnno...
      //invece "test" non compare mai...quindi? sta uscendo sempre con of()?
      tap(res=> {
          if (res != null) {
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: "Il docente insegna già questa materia in questa classe"}
          });
          
          } else {
            //la materia non è già insegnata per la classe in cui sto cercando di inserirla da questo insegnante, posso procedere
          }
        }
      ),
      concatMap( res => iif (()=> res == null,
        this.svcClassiDocentiMaterie.getByClasseSezioneAnnoAndMateria(this.data.idClasse, this.materiaSelectedID) , of() )
      ),
      tap(res=> {
        if (res != null) {
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: "Questa materia ha già una docenza assegnata in questa classe"}
          });
        } else {
          //la materia non è già insegnata per la classe in cui sto cercando di inserirla, posso procedere
        }
      })
    )


    checks$
    .pipe(
       concatMap( res => iif (()=> res == null, this.svcClassiDocentiMaterie.post(objDocenza) , of() )
      )
    ).subscribe(
      res=> {
        this.dialogRef.close()
      },
      err=> {
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
       }
    )



  }

//#endregion


}
