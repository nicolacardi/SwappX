import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable, pipe, Subscription } from 'rxjs';
import { debounceTime, map, switchMap, tap, concatMap, mergeMap } from 'rxjs/operators';
import { RequireMatch } from '../requireMatch/requireMatch';
import { FiltriService } from './filtri.service';

import { AlunniService } from 'src/app/_components/alunni/alunni.service';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { GenitoriService } from 'src/app/_components/genitori/genitori.service';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';


@Component({
  selector: 'app-filtri',
  templateUrl: './filtri.component.html',
  styleUrls: ['./filtri.component.css']
})
export class FiltriComponent implements OnInit, AfterViewInit {
  form! :                   FormGroup;
  filteredAlunni$!:         Observable<ALU_Alunno[]>;
  filteredGenitori$!:       Observable<ALU_Genitore[]>;
  filteredAnniScolastici$!: Observable<ASC_AnnoScolastico[]>;
  page$!:                   Observable<string>;
  subscription!: Subscription;

  //@ViewChild(MatAutocompleteTrigger) trigger!: MatAutocompleteTrigger;  //serve per cancellare quando non si seleziona qualcosa
  
  @ViewChild(MatAutocomplete) matAutocomplete!: MatAutocomplete;

  @ViewChild('auto1', { read: MatAutocompleteTrigger }) 
  auto1!: MatAutocompleteTrigger;
  @ViewChild('auto2', { read: MatAutocompleteTrigger }) 
  auto2!: MatAutocompleteTrigger;
  @ViewChild('auto3', { read: MatAutocompleteTrigger }) 
  auto3!: MatAutocompleteTrigger;

  constructor(private fb:                     FormBuilder,
              private _filtriService:         FiltriService,
              private alunniSvc:              AlunniService,
              private genitoriSvc:            GenitoriService,
              private anniScolasticiSvc:      AnniScolasticiService) {

    this.form = this.fb.group({
      nomeCognomeGenitore:   [null], // [RequireMatch]]
      nomeCognomeAlunno:     [null], // [RequireMatch]]
      annoScolastico:        [null]
    });


    this._filtriService.getAlunno()
      .subscribe(
        val=>{
        if (val!=0 && val!= null && val!= undefined){
          
            this.alunniSvc.loadAlunno(val)
            .subscribe(val3=>this.form.controls['nomeCognomeAlunno'].setValue(val3.nome + ' ' + val3.cognome, {emitEvent:false}))
            ;
        }
    });

    this._filtriService.getGenitore()
    .subscribe(
      val=>{
      if (val!=0 && val!= null && val!= undefined){
        
          this.genitoriSvc.loadGenitore(val)
          .subscribe(val3=>this.form.controls['nomeCognomeGenitore'].setValue(val3.nome + ' ' + val3.cognome, {emitEvent:false}))
          ;
      }

      this._filtriService.getAnnoScolastico()
      .subscribe(
        val=>{
        if (val!=0 && val!= null && val!= undefined){
          
            this.anniScolasticiSvc.loadAnnoScolastico(val)
            .subscribe(val3=>this.form.controls['annoScolastico'].setValue(val3.annoscolastico, {emitEvent:false}))
            ;
        }
    });

      this.page$ = this._filtriService.getPage();


  });

    // this._filtriService.getGenitore()
    //   .subscribe(
    //     val=>{
    //     if (val!=0 && val!= null && val!= undefined){
    //       this.form.controls['idGenitore'].setValue(val, {emitEvent:false});
    //     }
    //   });



   }

  ngOnInit(): void {

    // this.form.controls['idGenitore'].valueChanges
    // .pipe(
    //   debounceTime(500),
    // )
    // .subscribe(val=>
    //   {
    //     this._filtriService.passGenitore(val)
    // });
    
    //************* DROPDOWN RISULTATI SU INPUT NOME O COGNOME ***********
    //switchMap trasforma l'input del form in un Observable di risultati della filterAlunni
    //il tutto viene assegnato a  filteredAlunni$ di cui si fa la | async nell'html per mostrare la lista

    this.filteredAlunni$ = this.form.controls['nomeCognomeAlunno'].valueChanges
    .pipe(
      debounceTime(300),                                                      //attendiamo la digitazione
      //tap(() => this.nomiIsLoading = true),                                 //attiviamo il loading
      //delayWhen(() => timer(2000)),                                         //se vogliamo vedere il loading allunghiamo i tempi

      switchMap(() => this.alunniSvc.filterAlunni(this.form.value.nomeCognomeAlunno)), 
    )

    this.filteredGenitori$ = this.form.controls['nomeCognomeGenitore'].valueChanges
    .pipe(
      debounceTime(300),                                                      //attendiamo la digitazione
      //tap(() => this.nomiIsLoading = true),                                 //attiviamo il loading
      //delayWhen(() => timer(2000)),                                         //se vogliamo vedere il loading allunghiamo i tempi

      switchMap(() => this.genitoriSvc.filterGenitori(this.form.value.nomeCognomeGenitore)), 
    )

    this.filteredAnniScolastici$ = this.form.controls['annoScolastico'].valueChanges
    .pipe(
      debounceTime(300),                                                      //attendiamo la digitazione
      //tap(() => this.nomiIsLoading = true),                                 //attiviamo il loading
      //delayWhen(() => timer(2000)),                                         //se vogliamo vedere il loading allunghiamo i tempi

      switchMap(() => this.anniScolasticiSvc.filterAnniScolastici(this.form.value.annoScolastico)), 
    )

  }

  ngAfterViewInit() {
    //this._subscribeToClosingActions();   
  }


  resetInputAlunno (formControlName: string) {
    this.form.controls[formControlName].setValue('');
    this._filtriService.passAlunno(0);
    this.auto1.closePanel();
  }

  resetInputGenitore (formControlName: string) {
    this.form.controls[formControlName].setValue('');
    this._filtriService.passGenitore(0);
  }

  resetInputAnnoScolastico (formControlName: string) {
    this.form.controls[formControlName].setValue('');
    this._filtriService.passAnnoScolastico(0);
  }

  resetAllInputs() {

  }

  // displayFn(alunno: ALU_Alunno): string {
  //   return alunno && alunno.cognome ? alunno.nome + ' '+ alunno.cognome : '';
  // }
  
  // private _subscribeToClosingActions(): void {
  //   //questa funzione cancella il valore se non viene fatta una selezione
  //   //trovata qui https://stackblitz.com/edit/autocomplete-force-selection-tests-w2fqww?file=app%2Fapp.component.ts
  //   if (this.subscription && !this.subscription.closed) {
  //     this.subscription.unsubscribe();
  //   }
  //   this.subscription = this.trigger.panelClosingActions
  //     .subscribe(val => {
  //       if (!val || !val.source) {
  //         //this.form.controls['nomeCognomeAlunno'].setValue(null);
  //       }
  //     },
  //     err => this._subscribeToClosingActions(),
  //     () => this._subscribeToClosingActions());
  // }

  clickAlunnoCombo(element : ALU_Alunno) {
    this._filtriService.passAlunno(element.id);
  }

  clickGenitoreCombo(element : ALU_Genitore) {
    this._filtriService.passGenitore(element.id);
  }

  clickAnnoScolasticoCombo(element : ASC_AnnoScolastico) {
    this._filtriService.passAnnoScolastico(element.id);
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
        tap(val=> this._filtriService.passAlunno(val.id))
      )
      .subscribe();
    }
  }

  enterGenitoreInput () {
    if (this.form.controls['nomeCognomeGenitore'].value != '') {
      this.matAutocomplete.options.first.select();
      //Questo è il valore che devo cercare: this.matAutocomplete.options.first.viewValue;
      this.genitoriSvc.findIdGenitore(this.matAutocomplete.options.first.viewValue)
      .pipe(
        tap(val=> this._filtriService.passGenitore(val.id))
      )
      .subscribe();
    }
  }

  enterAnnoScolasticoInput() {
    if (this.form.controls['annoScolastico'].value != '') {
      this.matAutocomplete.options.first.select();
      //Questo è il valore che devo cercare: this.matAutocomplete.options.first.viewValue;
      this.anniScolasticiSvc.findIdAnnoScolastico(this.matAutocomplete.options.first.viewValue)
      .pipe(
        tap(val=> this._filtriService.passAnnoScolastico(val.id))
      )
      .subscribe();
    }
  }

}
