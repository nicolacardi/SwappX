import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, finalize, map, switchMap, tap } from 'rxjs/operators';

//services
import { AlunniService } from 'src/app/_components/alunni/alunni.service';
import { IscrizioniService } from '../iscrizioni.service';

//models
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

//components
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { DialogData } from 'src/app/_models/DialogData';

@Component({
  selector: 'app-iscrizioni-add',
  templateUrl: './iscrizioni-add.component.html',
  styleUrls: ['./../iscrizioni.css']
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
  classeSezioneAnnoID!:                number;
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('nomeCognomeAlunno') nomeCognomeAlunno!: ElementRef<HTMLInputElement>;
//#endregion

  constructor(private fb:                     FormBuilder,
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

    this.classeSezioneAnnoID = this.data.classeSezioneAnnoID;
    this.filteredAlunni$ = this.form.controls['nomeCognomeAlunno'].valueChanges
      .pipe(
        tap(() => this.alunniIsLoading = true),
        debounceTime(300),
        //delayWhen(() => timer(2000)),
        switchMap(val => 
          this.svcAlunni.listByAnnoNoClasse(this.form.value.nomeCognomeAlunno, this.data.annoID)
              .pipe(
                map( val2 => val2.filter(val=>!this.idAlunniSelezionati.includes(val.id)) )//FANTASTICO!!! NON MOSTRA QUELLI GIA'SELEZIONATI! MEGLIO DI GOOGLE CHE LI RIMOSTRA!
              ) 
        ),
        // switchMap(() => 
        //   this.svcAlunni.listByAnnoNoClasse(this.form.value.nomeCognomeAlunno, this.data.annoID)
        // )
        tap(() => this.alunniIsLoading = false)
    )
  }

//#endregion

//#region ----- Altri metodi -------

  selected(event: MatAutocompleteSelectedEvent): void {

    this.nomeCognomeAlunno.nativeElement.value = '';
    const alunnoToAdd = event.option.viewValue;
    const alunnoIDToAdd = parseInt(event.option.id);

    //in verità dopo la miglioria per cui non si vede più quanto giù selezionato questa if non servirebbe
    if (!this.alunniSelezionati.includes(alunnoToAdd)) { 
      this.alunniSelezionati.push(alunnoToAdd);
      this.idAlunniSelezionati.push(alunnoIDToAdd);
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
          ClasseSezioneAnnoID: this.data.classeSezioneAnnoID
        };
        this.svcIscrizioni.post(objIscrizione)
          .pipe( finalize(()=>this.dialogRef.close()))
          .subscribe(
            val=>{},
            err =>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
            }
          );
      });
  }

//#endregion


}
