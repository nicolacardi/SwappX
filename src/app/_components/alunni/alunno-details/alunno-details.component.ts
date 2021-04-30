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
  idAlunno!:              number;
  filteredComuni$!:       Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:Observable<_UT_Comuni[]>;
  comuniIsLoading:        boolean = false;
  comuniNascitaIsLoading: boolean = false;
  breakpoint!:            number;

  constructor(private fb: FormBuilder, 
      private route:      ActivatedRoute,
      private router:     Router,
      private _snackBar:  MatSnackBar,
      private alunniSvc:  AlunniService,
      private comuniSvc:  ComuniService) {
        
        this.alunnoForm = this.fb.group({
          id:                [null],
          nome:              ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
          cognome:           ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
          dtNascita:         ['', Validators.required],
          comuneNascita:     ['', Validators.maxLength(50)],
          provNascita:       ['', Validators.maxLength(2)] ,
          nazioneNascita:    ['', Validators.maxLength(3)],
          indirizzo:         ['', Validators.maxLength(255)],
          comune:            ['', Validators.maxLength(50)],
          prov:              ['', Validators.maxLength(2)],
          cap:               ['', Validators.maxLength(5)],
          nazione:           ['', Validators.maxLength(3)],
          ckAttivo:          [false],
          ckDSA:             [false],
          ckDisabile:        [false],
          ckAuthFoto:        [false],
          ckAuthUsoMateriale:[false],
          ckAuthUscite:      [false]

        });
  }

  ngOnInit () {
    this.loadData();
  }

  loadData(){
    this.idAlunno = this.route.snapshot.params['id'];  
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;

    //********************* POPOLAMENTO FORM *******************
    //serve distinguere tra form vuoto e form poolato in arrivo da lista alunni
    
    if (this.idAlunno && this.idAlunno != 0) {
      //alunno è un observable di tipo ALU_Alunno, nell'html faccio la | async (==subscribe)
      this.alunno = this.alunniSvc.loadAlunnoWithParents(this.idAlunno)
      .pipe(
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

  //#region ----- Funzioni -------

  save(){

    if (this.alunnoForm.controls['id'].value == null) 
      this.alunniSvc.postAlunno(this.alunnoForm.value).subscribe(res=> console.log("return from post", res));
    else 
      this.alunniSvc.putAlunno(this.alunnoForm.value).subscribe(res=> console.log("return from put", res));
    
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
  }

  back(){
    this.router.navigate(['/alunni?page=1']);
  }
  refresh(){
    this.loadData();
  }
  delete(){
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Funzione non abilitata', panelClass: ['red-snackbar']});
    this.router.navigate(['/alunni']);
  }
  //#endregion

  popolaProv(prov: string, cap: string) {
    this.alunnoForm.controls['prov'].setValue(prov);
    this.alunnoForm.controls['cap'].setValue(cap);
    this.alunnoForm.controls['nazione'].setValue('ITA');
  }

  popolaProvNascita(prov: string) {
    this.alunnoForm.controls['provNascita'].setValue(prov);
    this.alunnoForm.controls['nazioneNascita'].setValue('ITA');
  }
  
  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 3;
  }
}

