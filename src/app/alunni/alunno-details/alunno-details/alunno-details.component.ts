import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { delayWhen, finalize, tap } from 'rxjs/operators';

import { AlunniService } from 'src/app/_services/alunni.service';
import { ComuniService } from 'src/app/_services/comuni.service';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { _UT_Comuni } from 'src/app/_models/_UT_Comuni';

@Component({
  selector:     'app-alunno-details',
  templateUrl:  './alunno-details.component.html',
  styleUrls:    ['./alunno-details.component.css']
})
export class AlunnoDetailsComponent implements OnInit{

  alunnoForm! :           FormGroup;
  emptyForm :             boolean = false;
  alunno!:                Observable<ALU_Alunno>;
  loading:                boolean = true;

  filteredComuni$!:       Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:Observable<_UT_Comuni[]>;
  comuniIsLoading:        boolean = false;
  comuniNascitaIsLoading: boolean = false;

  constructor(private fb: FormBuilder, 
      private route:      ActivatedRoute,
      private alunniSvc:  AlunniService,
      private comuniSvc:  ComuniService) {

        this.alunnoForm = this.fb.group({
          nome:              ['', Validators.required],
          cognome:           ['', Validators.required],
          dtNascita:         ['', Validators.required],
          comuneNascita:     [''],
          provNascita:       [''],
          nazioneNascita:    [''],
          indirizzo:         [''],
          comune:            [''],
          prov:              [''],
          CAP:               [''],
          nazione:           [''],
          ckAttivo:          [false],
          ckDSA:             [false],
          ckDisabile:        [false],
          ckAuthFoto:        [false],
          ckAuthUsoMateriale:[false],
          ckAuthUscite:      [false]
        });
  }

  ngOnInit () {
    //********************* POPOLAMENTO FORM *******************
    //serve distinguere tra form vuoto e form poolato in arrivo da lista alunni
    if (this.route.snapshot.params['id']) {
      //alunno è un observable di tipo ALU_Alunno
      //nell'html faccio la | async (==subscribe)
      this.alunno = this.alunniSvc.loadAlunno(this.route.snapshot.params['id'])
      .pipe(
          //delayWhen(() => timer(2000)), //per ritardare
          tap(
            //patchValue assegna "qualche" campo, quelli che trova
            //setValue   assegna tutti i campi.
            alunno => this.alunnoForm.patchValue(alunno)
          ),
          finalize(()=>this.loading = false),
          //tap ( val => console.log(val))
      );
    } else {
      this.emptyForm = true
      this.loading = false
    }

    //********************* FILTRO COMUNE *******************
    this.filteredComuni$ = this.alunnoForm.controls['comune'].valueChanges
    .pipe(
      debounceTime(300),
      tap(() => this.comuniIsLoading = true),
      //delayWhen(() => timer(2000)),
      switchMap(() => this.comuniSvc.filterComuni(this.alunnoForm.value.comune)),
      tap(() => this.comuniIsLoading = false)
    )

    //********************* FILTRO COMUNE NASCITA ***********
    this.filteredComuniNascita$ = this.alunnoForm.controls['comuneNascita'].valueChanges
    .pipe(
      debounceTime(300),
      tap(() => this.comuniNascitaIsLoading = true),
      switchMap(() => this.comuniSvc.filterComuni(this.alunnoForm.value.comuneNascita)),
      tap(() => this.comuniNascitaIsLoading = false)
    )

  }


  displayComune(objComune: any) {
    //metodo usato da displayWith
    if (objComune.comune) {
      return objComune.comune;
    } else {
      //in fase di popolamento iniziale non si ha a disposizione un Object ma una stringa
      return objComune
    }
  }

  popolaProv(prov: string, cap: string) {
    this.alunnoForm.controls['prov'].setValue(prov);
    this.alunnoForm.controls['CAP'].setValue(cap);
    this.alunnoForm.controls['nazione'].setValue('Italia');
  }

  popolaProvNascita(prov: string) {
    this.alunnoForm.controls['provNascita'].setValue(prov);
    this.alunnoForm.controls['nazioneNascita'].setValue('Italia');
  }

}



//***************PROVE VECCHIE DA TOGLIERE**************/

      //this.comuni$ = of(COMUNI);
      //this.comuniList$ = of(COMUNI);
      //this.filteredComuniList$ = of(COMUNI);
      
      //this.comuniNome = this.comuni$.map(a => a.foo);


    //).subscribe(val=> this.filteredComuni = val);
    //).subscribe(val=> console.log(val)); //funziona


    //   switchMap(value => this.comuniSvc.search({name: value}, 1)
    //   .pipe(
    //     finalize(() => this.comuniIsLoading = false),
    //     )
    //   )
    // ).subscribe(comuni => this.filteredComuni= comuni.results);


    //AS 
    /* 
    this.filteredComuniNome = this.ctrlComune.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value))
    );
      */

//AS
/*
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.comuniNome.filter(option => option.toLowerCase().includes(filterValue));
  }
*/
  /*
  private _filterComune(query: string): Observable<Comune[]> {
  //private _filterComune(query: string):  string[] {
    //if (query === '') return of([]);


    //objArray.map(({ foo }) => foo)

    
    const queryRegExp = new RegExp(query, 'i');

    return this.comuniList$ <Comune[]>
      .pipe(
        map( 
          (comuni) => {
            comuni.filter( query );
        // comuni.filter(char => queryRegExp.test(char.comune))
       //.sort((a, b) => a.comune.length - b.comune.length)
            }
          )
        )
      ;
  }
 */

