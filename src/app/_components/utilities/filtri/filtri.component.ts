import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Event } from '@angular/router';
import { fromEvent, Observable, pipe, Subscription } from 'rxjs';
import { debounceTime, map, switchMap, tap, concatMap, mergeMap } from 'rxjs/operators';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from 'src/app/_services/alunni.service';
import { RequireMatch } from '../requireMatch/requireMatch';
import { FiltriService } from './filtri.service';


@Component({
  selector: 'app-filtri',
  templateUrl: './filtri.component.html',
  styleUrls: ['./filtri.component.css']
})
export class FiltriComponent implements OnInit, AfterViewInit {
  form! : FormGroup;
  filteredAlunni$!:       Observable<ALU_Alunno[]>;
  subscription!: Subscription;

  //@ViewChild('nomeCognomeAlunno') InputNomeCognome!: ElementRef;
  @ViewChild(MatAutocompleteTrigger) trigger!: MatAutocompleteTrigger;  //serve per cancellare quando non si seleziona qualcosa
  @ViewChild(MatAutocomplete) matAutocomplete!: MatAutocomplete;
  @ViewChild("park") parkInput!: ElementRef;

  constructor(private fb:               FormBuilder,
              private _filtriService:   FiltriService,
              private alunniSvc:        AlunniService) {

    this.form = this.fb.group({
      //idAlunno:       [null],
      idGenitore:     [null],
      nomeCognomeAlunno:     [null] // [RequireMatch]]
    });

    // this._filtriService.getAlunno()
    // .subscribe(
    //   val=>{
    //   if (val!=0 && val!= null && val!= undefined){
    //     this.form.controls['idAlunno'].setValue(val, {emitEvent:false});
    //   }
    // });



    this._filtriService.getAlunno()
      .subscribe(
        val=>{
        console.log("filtri.component.ts: ", val);
        if (val!=0 && val!= null && val!= undefined){
          
            this.alunniSvc.loadAlunno(val)
            .subscribe(val3=>this.form.controls['nomeCognomeAlunno'].setValue(val3.nome + ' ' + val3.cognome, {emitEvent:false}))
            ;
        }
    });

    // this._filtriService.getAlunno()
    //   .pipe(
    //     tap(val=>console.log("ho estratto dal service:"+val)),
    //     concatMap(val => this.alunniSvc.loadAlunno(val))    //concatMap attende l'observable esterno prima di eseguire quello interno
    //   )
    //   .subscribe();     /////NON FUNZIONA!!!!!!!!!!!!!!!!!!!!!!!! E INVECE DOVREBBE!!!! cry cry cry!!!

    this._filtriService.getGenitore()
      .subscribe(
        val=>{
        if (val!=0 && val!= null && val!= undefined){
          this.form.controls['idGenitore'].setValue(val, {emitEvent:false});
        }
      });



   }

  ngOnInit(): void {
    //this.form.controls['nomeCognomeAlunno'].setValue("cucu", {emitEvent:false});


    // this.form.controls['idAlunno'].valueChanges
    // .pipe(
    //   debounceTime(500),
    // )
    // .subscribe(val=>
    //   {
    //     this._filtriService.passAlunno(val)
    // });


    this.form.controls['idGenitore'].valueChanges
    .pipe(
      debounceTime(500),
    )
    .subscribe(val=>
      {
        this._filtriService.passGenitore(val)
    });
    
    //************* DROPDOWN RISULTATI SU INPUT NOME O COGNOME ***********
    //switchMap trasforma l'input del form in un Observable di risultati della filterAlunni
    //il tutto viene assegnato a  filteredAlunni$ di cui si fa la | async nell'html per mostrare la lista

    this.filteredAlunni$ = this.form.controls['nomeCognomeAlunno'].valueChanges
    .pipe(
      debounceTime(300),                                                      //attendiamo la digitazione
      //tap(() => this.nomiIsLoading = true),                                 //attiviamo il loading
      //delayWhen(() => timer(2000)),                                         //se vogliamo vedere il loading allunghiamo i tempi

      switchMap(() => this.alunniSvc.filterAlunni(this.form.value.nomeCognomeAlunno)), 
      // tap(()=> {
      //   alert(this.getCountItems())
      // }),                        //Bisognerebbe selezionare se ce n'è uno solo!!!!!
      //tap(() => this.comuniIsLoading = false)                               //disattiviamo il loading
    )



  }

  ngAfterViewInit() {
    this._subscribeToClosingActions();   
  }


  resetInput (formControlName: string) {
    this.form.controls[formControlName].setValue('');
    this._filtriService.passAlunno(0);
    //this.matAutocomplete.showPanel = false;
    //this.trigger.panelClosingActions;

  }

  resetAllInputs () {
    //this.form.controls['idAlunno'].setValue('');
    this.form.controls['idGenitore'].setValue('');
  }


  displayFn(alunno: ALU_Alunno): string {
    return alunno && alunno.cognome ? alunno.nome + ' '+ alunno.cognome : '';
  }
  
  private _subscribeToClosingActions(): void {
    //questa funzione cancella il valore se non viene fatta una selezione
    //trovata qui https://stackblitz.com/edit/autocomplete-force-selection-tests-w2fqww?file=app%2Fapp.component.ts
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.trigger.panelClosingActions
      .subscribe(val => {
        if (!val || !val.source) {
          //this.form.controls['nomeCognomeAlunno'].setValue(null);
        }
      },
      err => this._subscribeToClosingActions(),
      () => this._subscribeToClosingActions());
  }

  onclick(element : ALU_Alunno) {
    this._filtriService.passAlunno(element.id);
    //this.parkInput.nativeElement.value = element.id;
  }

  onEnter () {
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



}
