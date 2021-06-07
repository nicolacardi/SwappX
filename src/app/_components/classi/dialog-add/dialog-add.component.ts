import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, timer } from 'rxjs';
import { debounceTime, delayWhen, switchMap, tap } from 'rxjs/operators';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from 'src/app/_services/alunni.service';
import { DialogData } from '../../utilities/dialog-yes-no/dialog-yes-no.component';


@Component({
  selector: 'app-dialog-add',
  templateUrl: './dialog-add.component.html',
  styleUrls: ['./dialog-add.component.css']
})
export class DialogAddComponent implements OnInit {
  form! :                   FormGroup;
  filteredAlunni$!:         Observable<ALU_Alunno[]>;
  alunniSelezionati:        string[] = [];
  idAlunniSelezionati:      number[] = [];
  removable =               true;
  selectable =              true;
  alunniIsLoading:          boolean = false;


  @ViewChild('nomeCognomeAlunno') nomeCognomeAlunno!: ElementRef<HTMLInputElement>;

  constructor(private fb:                             FormBuilder,
                      private alunniSvc:              AlunniService,
                      public dialogRef:               MatDialogRef<DialogAddComponent>,
                      @Inject(MAT_DIALOG_DATA) public data: DialogData) { 

    this.form = this.fb.group({
      nomeCognomeAlunno:     [null]
    });
  }


  ngOnInit(): void {

    this.filteredAlunni$ = this.form.controls['nomeCognomeAlunno'].valueChanges
    .pipe(
      debounceTime(300),
      tap(() => this.alunniIsLoading = true),
      //delayWhen(() => timer(2000)),
      switchMap(() => this.alunniSvc.filterAlunni(this.form.value.nomeCognomeAlunno)), 
      tap(() => this.alunniIsLoading = false)
    )
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.nomeCognomeAlunno.nativeElement.value = '';
    const alunnoToAdd = event.option.viewValue;
    const idAlunnoToAdd = parseInt(event.option.id);
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

}
