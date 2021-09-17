import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from 'src/app/_components/alunni/alunni.service';

import { AlunnoDashboardNewService } from './alunno-dashboard-new.service';

@Component({
  selector: 'app-alunno-dashboard-new',
  templateUrl: './alunno-dashboard-new.component.html',
  styleUrls: ['./alunno-dashboard-new.component.css']
})
export class AlunnoDashboardNewComponent implements OnInit {

  form! :                   FormGroup;
  filteredAlunni$!:         Observable<ALU_Alunno[]>;

  @ViewChild(MatAutocomplete) matAutocomplete!: MatAutocomplete;
  @ViewChild('auto1', { read: MatAutocompleteTrigger }) 
  auto1!: MatAutocompleteTrigger;
  
  constructor(private fb:                     FormBuilder,
              private alunniSvc:              AlunniService,
              private _alunnoDashboardNewService:         AlunnoDashboardNewService  ) {

      this.form = this.fb.group({
        nomeCognomeAlunno:     [null]
      });

      this._alunnoDashboardNewService.getAlunno()
      .subscribe(
        val=>{
        if (val!=0 && val!= null && val!= undefined){
          
            this.alunniSvc.loadAlunno(val)
            .subscribe(val3=>this.form.controls['nomeCognomeAlunno'].setValue(val3.nome + ' ' + val3.cognome, {emitEvent:false}))
            ;
        }
    });
  }
  
  ngOnInit(): void {
    this.filteredAlunni$ = this.form.controls['nomeCognomeAlunno'].valueChanges
    .pipe(
      debounceTime(300),                                                      //attendiamo la digitazione
      //tap(() => this.nomiIsLoading = true),                                 //attiviamo il loading
      //delayWhen(() => timer(2000)),                                         //se vogliamo vedere il loading allunghiamo i tempi
      switchMap(() => this.alunniSvc.filterAlunni(this.form.value.nomeCognomeAlunno)), 
    )
  }

  resetInputAlunno (formControlName: string) {
    this.form.controls[formControlName].setValue('');
    this._alunnoDashboardNewService.passAlunno(0);
    //this.auto1.closePanel(); //sui filtri questa funziona e qui no! perchè?
  }

  enterAlunnoInput () {
    //Su pressione di enter devo dapprima selezionare il PRIMO valore della lista aperta (a meno che non sia vuoto)
    //Una volta selezionato devo trovare, SE esiste, il valore dell'id che corrisponde a quanto digitato e quello passarlo a passAlunno del service
    //Mancherebbe qui la possibilità di selezionare solo con le freccette e Enter
    if (this.form.controls['nomeCognomeAlunno'].value != '') {
      this.matAutocomplete.options.first.select();
      //Questo è il valore che devo cercare: this.matAutocomplete.options.first.viewValue;
      this.alunniSvc.findIdAlunno(this.matAutocomplete.options.first.viewValue)
      .pipe(
        tap(val=> this._alunnoDashboardNewService.passAlunno(val.id))
      )
      .subscribe();
    }
  }

  clickAlunnoCombo(element : ALU_Alunno) {
    this._alunnoDashboardNewService.passAlunno(element.id);
  }
}
