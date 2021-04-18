import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import {debounceTime, map, startWith, switchMap} from 'rxjs/operators';
import { delayWhen, finalize, tap } from 'rxjs/operators';

import { COMUNI } from 'src/app/_dbs/comuni';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { TBL_Comune } from 'src/app/_models/TBL_Comune';
import { _UT_Comuni } from 'src/app/_models/_UT_Comuni';
import { AlunniService } from 'src/app/_services/alunni.service';
import { ComuniService } from 'src/app/_services/comuni.service';

/*
interface Comune {
  istat: string;
  comune: string;
  regione: string;
  provincia: string;
  indirizzo: string;
}
*/
@Component({
  selector: 'app-alunno-details',
  templateUrl: './alunno-details.component.html',
  styleUrls: ['./alunno-details.component.css']
})
export class AlunnoDetailsComponent implements OnInit{
  
  alunno!: Observable<ALU_Alunno>;

  ctrlComune = new FormControl();

  filteredComuni!: _UT_Comuni[];
  filteredComuni$!: Observable<_UT_Comuni[]>;
  comuniIsLoading: boolean = false;

  //comuniList$!: Observable<Comune[]>;
  //filteredComuni$!: Observable<Comune[]>;
  //comuniNome: string[] = ['Padova', 'Vicenza', 'Ragusa'];
  //filteredComuniNome!: Observable<string[]>;


  //alunno!: ALU_Alunno;
  loading: boolean = true;
  emptyForm : boolean = false;
  alunnoForm! : FormGroup;

  constructor(private fb: FormBuilder, 
              private route:ActivatedRoute,
              private alunniSvc: AlunniService,
              private comuniSvc: ComuniService) {

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


      //this.comuni$ = of(COMUNI);
      //this.comuniList$ = of(COMUNI);
      //this.filteredComuniList$ = of(COMUNI);
      
      //this.comuniNome = this.comuni$.map(a => a.foo);

  }

  ngOnInit () {
    
    if (this.route.snapshot.params['id']) {
      //alunno è un observable di tipo ALU_Alunno
      //nell'html faccio la | async (==subscribe)
      this.alunno = this.alunniSvc.loadAlunno(this.route.snapshot.params['id'])
      .pipe(
          //delayWhen(() => timer(2000)),
          tap(
           alunno => this.alunnoForm.patchValue(alunno)
          ),
          finalize(()=>this.loading = false),
          tap ( val => console.log(val))
      );
    } else {
      this.emptyForm = true
      this.loading = false
    }



    
    this.filteredComuni$ = this.alunnoForm.valueChanges
    .pipe(
        //tap(()=>console.log(this.alunnoForm.value.comune)),
        debounceTime(300),
        tap(() => this.comuniIsLoading = true),
        switchMap(() => this.comuniSvc.filterComuni(this.alunnoForm.value.comune)
      )
    )
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


    
  }




  // displayFn(objComune: _UT_Comuni) {
  //   if (objComune) { return objComune.comune; }
  //   else return null;
  // }

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
}
