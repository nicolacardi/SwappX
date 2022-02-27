import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, timer } from 'rxjs';
import { debounceTime, delayWhen, finalize, map, switchMap, tap } from 'rxjs/operators';
import { DialogData } from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { AlunniService } from 'src/app/_components/alunni/alunni.service';
import { IscrizioniService } from '../iscrizioni.service';

//classi
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

@Component({
  selector: 'app-iscrizioni-add',
  templateUrl: './iscrizioni-add.component.html',
  styleUrls: ['./../classi.css']
})

export class IscrizioniAddComponent implements OnInit {

//#region ----- Variabili -------
  form! :                   FormGroup;
  filteredAlunni$!:         Observable<ALU_Alunno[]>;
  alunniSelezionati:        string[] = [];
  idAlunniSelezionati:      number[] = [];
  removable =               true;
  selectable =              true;
  alunniIsLoading:          boolean = false;
  idClasse!:                number;
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('nomeCognomeAlunno') nomeCognomeAlunno!: ElementRef<HTMLInputElement>;
//#endregion

  constructor(private fb:                             FormBuilder,
                      private svcAlunni:              AlunniService,
                      private svcIscrizioni:          IscrizioniService,
                      public dialogRef:               MatDialogRef<IscrizioniAddComponent>,
                      private _snackBar:              MatSnackBar,
                      @Inject(MAT_DIALOG_DATA) public data: DialogData) { 

    this.form = this.fb.group({
      nomeCognomeAlunno:     [null]
    });
  }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {

    this.idClasse = this.data.idClasse;
    this.filteredAlunni$ = this.form.controls['nomeCognomeAlunno'].valueChanges
      .pipe(
        tap(() => this.alunniIsLoading = true),
        debounceTime(300),
        //delayWhen(() => timer(2000)),
        switchMap(val => 
          this.svcAlunni.listByAnnoNoClasse(this.form.value.nomeCognomeAlunno, this.data.idAnno)
              .pipe(
                map( val2 => val2.filter(val=>!this.idAlunniSelezionati.includes(val.id)) )//FANTASTICO!!! NON MOSTRA QUELLI GIA'SELEZIONATI! MEGLIO DI GOOGLE CHE LI RIMOSTRA!
              ) 
        ),
        // switchMap(() => 
        //   this.svcAlunni.listByAnnoNoClasse(this.form.value.nomeCognomeAlunno, this.data.idAnno)
        // )
        tap(() => this.alunniIsLoading = false)
    )
  }

//#endregion

//#region ----- Altri metodi -------

  selected(event: MatAutocompleteSelectedEvent): void {

    this.nomeCognomeAlunno.nativeElement.value = '';
    const alunnoToAdd = event.option.viewValue;
    const idAlunnoToAdd = parseInt(event.option.id);

    //in verità dopo la miglioria per cui non si vede più quanto giù selezionato questa if non servirebbe
    if (!this.alunniSelezionati.includes(alunnoToAdd)) { 
      this.alunniSelezionati.push(alunnoToAdd);
      this.idAlunniSelezionati.push(idAlunnoToAdd);
    }
  }

  remove(alunnoSelezionato: string): void {

    const index = this.alunniSelezionati.indexOf(alunnoSelezionato);
    if (index >= 0) {
      this.alunniSelezionati.splice(index, 1);
      this.idAlunniSelezionati.splice(index, 1);
    }
    this.form.controls['nomeCognomeAlunno'].setValue('');
  }
//#endregion

//#region ----- Operazioni CRUD -------

  save() {
    this.idAlunniSelezionati.forEach(
      val=>{
        let objIscrizione = {
          AlunnoID: val,
          ClasseSezioneAnnoID: this.data.idClasse
        };
        this.svcIscrizioni.post(objIscrizione)
          .pipe( finalize(()=>this.dialogRef.close()))
          .subscribe(
            val=>{
             // console.log("iscrizioni-add.component.ts - save:Record Salvato:", val);
            },
            err =>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
              console.log("iscrizioni-add.component.ts - errore:", err);
            }
          );
      });
  }

//#endregion


}
