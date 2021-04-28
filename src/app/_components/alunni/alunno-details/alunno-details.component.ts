import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { delayWhen, finalize, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

import { AlunniService } from 'src/app/_services/alunni.service';
import { ComuniService } from 'src/app/_services/comuni.service';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { _UT_Comuni } from 'src/app/_models/_UT_Comuni';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  id!:                    number;
  filteredComuni$!:       Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:Observable<_UT_Comuni[]>;
  comuniIsLoading:        boolean = false;
  comuniNascitaIsLoading: boolean = false;

  constructor(private fb: FormBuilder, 
      private route:      ActivatedRoute,
      private router:     Router,
      private _snackBar:  MatSnackBar,
      private alunniSvc:  AlunniService,
      private comuniSvc:  ComuniService,
      @Inject(MAT_DIALOG_DATA) id:number) {

        console.log("id:", id);
        
        this.id = id;

        this.alunnoForm = this.fb.group({
          id:                [null],
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
          nazione:           [''],
          ckAttivo:          [false],
          ckDSA:             [false],
          ckDisabile:        [false],
          ckAuthFoto:        [false],
          ckAuthUsoMateriale:[false],
          ckAuthUscite:      [false],
        });
  }

  ngOnInit () {
    //********************* POPOLAMENTO FORM *******************
    //serve distinguere tra form vuoto e form poolato in arrivo da lista alunni
    if (this.id && this.id != 0) {
      //alunno è un observable di tipo ALU_Alunno, nell'html faccio la | async (==subscribe)
      this.alunno = this.alunniSvc.loadAlunnoWithParents(this.id)
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

  save(){
    //console.log("Ecco il form che sto per passare al service", this.alunnoForm.value );
    if (this.alunnoForm.controls['id'].value == null) {
      this.alunniSvc.postAlunno(this.alunnoForm.value).subscribe(res=> console.log("return from post", res));
    } else {
      this.alunniSvc.putAlunno(this.alunnoForm.value).subscribe(res=> console.log("return from put", res));
    }
    
    this._snackBar.openFromComponent(SnackbarComponent,
      {data: 'Record salvato', panelClass: ['green-snackbar']});

    //this.router.navigate(['/alunni']);
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
    this.alunnoForm.controls['cap'].setValue(cap);
    this.alunnoForm.controls['nazione'].setValue('Italia');
  }

  popolaProvNascita(prov: string) {
    this.alunnoForm.controls['provNascita'].setValue(prov);
    this.alunnoForm.controls['nazioneNascita'].setValue('Italia');
  }

  dpclick(val: any){
    console.log (val);
  }

}

