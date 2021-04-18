import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { delayWhen, finalize, tap } from 'rxjs/operators';

import { COMUNI } from 'src/app/_dbs/comuni';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from 'src/app/_services/alunni.service';

interface Comune {
  istat: string;
  comune: string;
  regione: string;
  provincia: string;
  indirizzo: string;
}

@Component({
  selector: 'app-alunno-details',
  templateUrl: './alunno-details.component.html',
  styleUrls: ['./alunno-details.component.css']
})
export class AlunnoDetailsComponent implements OnInit{
  
  alunno!: Observable<ALU_Alunno>;

  ctrlComune = new FormControl();
  comuniList$!: Observable<Comune[]>;
  filteredComuniList$!: Observable<Comune[]>;

  comuniNome: string[] = ['Padova', 'Vicenza', 'Ragusa'];
  filteredComuniNome!: Observable<string[]>;


  //alunno!: ALU_Alunno;
  loading: boolean = true;
  emptyForm : boolean = false;
  form! : FormGroup;

  constructor(private fb: FormBuilder, 
              private route:ActivatedRoute,
              private alunniSvc: AlunniService) {

                this.form = this.fb.group({
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
      this.comuniList$ = of(COMUNI);
      this.filteredComuniList$ = of(COMUNI);
      
      //this.comuniNome = this.comuni$.map(a => a.foo);

      // this.alunniSvc.loadAlunno(this.route.snapshot.params['id'])
      // .subscribe(
      //   val=>{
      //   console.log (val);
      //   this.form = this.fb.group({
      //     nome:          [val.nome,       Validators.required],
      //     cognome:       [val.cognome,    Validators.required],
      //     dtNascita:     [val.dtNascita,  Validators.required],
      //     indirizzo:     [val.indirizzo],
      //     comune:        [val.comune],
      //     prov:          [val.prov],
      //     nazione:       [val.nazione],
      //     CAP:           [val.CAP],
      //     comuneNascita: [val.comuneNascita],
      //     provNascita:   [val.provNascita],
      //     nazioneNascita:[val.nazioneNascita],
      //   })
      
      // });

  }

  ngOnInit () {
    
    if (this.route.snapshot.params['id']) {
      //alunno è un observable di tipo ALU_Alunno
      //nell'html faccio la | async (==subscribe)
      this.alunno = this.alunniSvc.loadAlunno(this.route.snapshot.params['id'])
      .pipe(
          //delayWhen(() => timer(2000)),
          tap(
           alunno => this.form.patchValue(alunno)
          ),
          finalize(()=>this.loading = false),
          tap ( val => console.log(val))
      );
    } else {
      this.emptyForm = true
      this.loading = false
    }

    //AS  
    this.filteredComuniNome = this.ctrlComune.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value))
    );
      
    //AS: MERDA NON VA!
    /*
    this.filteredComuniList$ = this.ctrlComune.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filterComune(value))
    );
    */
  }

//AS
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.comuniNome.filter(option => option.toLowerCase().includes(filterValue));
  }

  private _filterComune(query: string): Observable<Comune[]> {
    if (query === '') return of([]);

    const queryRegExp = new RegExp(query, 'i');

    return this.comuniList$
      .pipe(map((comuni) => {
        return comuni
            .filter(char => queryRegExp.test(char.comune))
            .sort((a, b) => a.comune.length - b.comune.length)
      }));
  }
 
}