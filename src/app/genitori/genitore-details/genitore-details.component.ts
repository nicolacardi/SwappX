import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { delayWhen, finalize, tap } from 'rxjs/operators';

import { GenitoriService } from 'src/app/_services/genitori.service';
import { ComuniService } from 'src/app/_services/comuni.service';

import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { _UT_Comuni } from 'src/app/_models/_UT_Comuni';

@Component({
  selector: 'app-genitore-details',
  templateUrl: './genitore-details.component.html',
  styleUrls: ['./genitore-details.component.css']
})

export class GenitoreDetailsComponent implements OnInit {

  genitoreForm! :         FormGroup;
  emptyForm :             boolean = false;
  genitore!:              Observable<ALU_Genitore>;
  loading:                boolean = true;

  filteredComuni$!:       Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:Observable<_UT_Comuni[]>;
  comuniIsLoading:        boolean = false;
  comuniNascitaIsLoading: boolean = false;

  constructor(private fb: FormBuilder, 
      private route:      ActivatedRoute,
      private genitoriSvc:  GenitoriService,
      private comuniSvc:  ComuniService) {

        this.genitoreForm = this.fb.group({
          nome:              ['', Validators.required],
          cognome:           ['', Validators.required],
          dtNascita:         ['', Validators.required],
          comuneNascita:     [''],
          provNascita:       [''],
          nazioneNascita:    [''],
          indirizzo:         [''],
          comune:            [''],
          prov:              [''],
          cap:               [''],
          nazione:           ['']
        });
  }




  ngOnInit(): void {
   //********************* POPOLAMENTO FORM *******************
    //serve distinguere tra form vuoto e form poolato in arrivo da lista alunni
    if (this.route.snapshot.params['id']) {
      //alunno è un observable di tipo ALU_Alunno
      //nell'html faccio la | async (==subscribe)
      this.genitore = this.genitoriSvc.loadAlunno(this.route.snapshot.params['id'])
      .pipe(
          //delayWhen(() => timer(2000)), //per ritardare
          tap(
            //patchValue assegna "qualche" campo, quelli che trova
            //setValue   assegna tutti i campi.
            alunno => this.genitoreForm.patchValue(alunno)
          ),
          finalize(()=>this.loading = false),
          //tap ( val => console.log(val))
      );
    } else {
      this.emptyForm = true
      this.loading = false
    }

    //********************* FILTRO COMUNE *******************
    this.filteredComuni$ = this.genitoreForm.controls['comune'].valueChanges
    .pipe(
      debounceTime(300),
      tap(() => this.comuniIsLoading = true),
      //delayWhen(() => timer(2000)),
      switchMap(() => this.comuniSvc.filterComuni(this.genitoreForm.value.comune)),
      tap(() => this.comuniIsLoading = false)
    )

    //********************* FILTRO COMUNE NASCITA ***********
    this.filteredComuniNascita$ = this.genitoreForm.controls['comuneNascita'].valueChanges
    .pipe(
      debounceTime(300),
      tap(() => this.comuniNascitaIsLoading = true),
      switchMap(() => this.comuniSvc.filterComuni(this.genitoreForm.value.comuneNascita)),
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
    this.genitoreForm.controls['prov'].setValue(prov);
    this.genitoreForm.controls['cap'].setValue(cap);
    this.genitoreForm.controls['nazione'].setValue('Italia');
  }

  popolaProvNascita(prov: string) {
    this.genitoreForm.controls['provNascita'].setValue(prov);
    this.genitoreForm.controls['nazioneNascita'].setValue('Italia');
  }

}
