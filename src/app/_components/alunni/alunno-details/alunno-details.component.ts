import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { MatDialog } from '@angular/material/dialog';

import { AlunniService } from 'src/app/_components/alunni/alunni.service';
import { ComuniService } from 'src/app/_services/comuni.service';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { _UT_Comuni } from 'src/app/_models/_UT_Comuni';

import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { LoadingService } from '../../utilities/loading/loading.service';
import { FiltriService } from '../../utilities/filtri/filtri.service';

@Component({
  selector:     'app-alunno-details',
  templateUrl:  './alunno-details.component.html',
  styleUrls:    ['./../alunni.css']
})

export class AlunnoDetailsComponent implements OnInit{

  idAlunno!:                  number;
  caller_page!:               string;
  caller_size!:               string;
  caller_filter!:             string;
  caller_sortField!:          string;
  caller_sortDirection!:      string;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  alunno!:                    Observable<ALU_Alunno>;
  loading:                    boolean = true;
  
  filteredComuni$!:           Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:    Observable<_UT_Comuni[]>;
  comuniIsLoading:            boolean = false;
  comuniNascitaIsLoading:     boolean = false;
  breakpoint!:                number;
  breakpoint2!:               number;

  constructor(private fb:     FormBuilder, 
      private route:          ActivatedRoute,
      private router:         Router,
      private alunniSvc:      AlunniService,
      private comuniSvc:      ComuniService,
      public _dialog:         MatDialog,
      private _snackBar:      MatSnackBar,
      private _loadingService :LoadingService,

      ) 
  {

        let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";
        
        this.form = this.fb.group({
          id:                         [null],
          nome:                       ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
          cognome:                    ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
          dtNascita:                  ['', Validators.required],
          comuneNascita:              ['', Validators.maxLength(50)],
          provNascita:                ['', Validators.maxLength(2)] ,
          nazioneNascita:             ['', Validators.maxLength(3)],
          indirizzo:                  ['', Validators.maxLength(255)],
          comune:                     ['', Validators.maxLength(50)],
          prov:                       ['', Validators.maxLength(2)],
          cap:                        ['', Validators.maxLength(5)],
          nazione:                    ['', Validators.maxLength(3)],
          genere:                     ['',{ validators:[Validators.maxLength(1), Validators.required, Validators.pattern("M|F")]}],
          cf:                         ['',{ validators:[Validators.maxLength(16), Validators.pattern(regCF)]}],
          telefono:                   ['', Validators.maxLength(13)],
          email:                      ['',Validators.email],
          scuolaProvenienza:          ['', Validators.maxLength(255)],
          indirizzoScuolaProvenienza: ['', Validators.maxLength(255)],
          ckAttivo:                   [false],
          ckDSA:                      [false],
          ckDisabile:                 [false],
          ckAuthFoto:                 [false],
          ckAuthUsoMateriale:         [false],
          ckAuthUscite:               [false]

        });
  }

  ngOnInit () {
    this.loadData();
  }

  loadData(){

    this.idAlunno = this.route.snapshot.params['id'];  
    this.caller_page = this.route.snapshot.queryParams["page"];
    this.caller_size = this.route.snapshot.queryParams["size"];
    this.caller_filter = this.route.snapshot.queryParams["filter"];
    this.caller_sortField = this.route.snapshot.queryParams["sortField"];
    this.caller_sortDirection = this.route.snapshot.queryParams["sortDirection"];
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;

    //********************* POPOLAMENTO FORM *******************
    //serve distinguere tra form vuoto e form popolato in arrivo da lista alunni
    
    if (this.idAlunno && this.idAlunno != 0) {

      const obsAlunno$: Observable<ALU_Alunno> = this.alunniSvc.loadAlunno(this.idAlunno);
      const loadAlunno$ = this._loadingService.showLoaderUntilCompleted(obsAlunno$);
      //TODO: capire perchè serve sia alunno | async e sia il popolamento di form
      this.alunno = loadAlunno$
      .pipe(
          tap(
            alunno => this.form.patchValue(alunno)
          )
      );
    } else {
      this.emptyForm = true
    }
    
    //********************* FILTRO COMUNE *******************
    this.filteredComuni$ = this.form.controls['comune'].valueChanges
    .pipe(
      tap(),
      debounceTime(300),
      tap(() => this.comuniIsLoading = true),
      //delayWhen(() => timer(2000)),
      switchMap(() => this.comuniSvc.filterComuni(this.form.value.comune)),
      tap(() => this.comuniIsLoading = false)
    )

    //********************* FILTRO COMUNE NASCITA ***********
    this.filteredComuniNascita$ = this.form.controls['comuneNascita'].valueChanges
    .pipe(
      tap(),
      debounceTime(300),
      tap(() => this.comuniNascitaIsLoading = true),
      switchMap(() => this.comuniSvc.filterComuni(this.form.value.comuneNascita)),
      tap(() => this.comuniNascitaIsLoading = false)
    )
  }

  //#region ----- Funzioni -------

  save(){

    if (this.form.controls['id'].value == null) 
      this.alunniSvc.post(this.form.value)
        .subscribe(res=> {
          //console.log("return from post", res);
          this.form.markAsPristine();
        });
    else 
      this.alunniSvc.put(this.form.value)
        .subscribe(res=> {
          //console.log("return from put", res);
          this.form.markAsPristine();
        });
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
  }

  back(){
    if (this.form.dirty) {
      const dialogRef = this._dialog.open(DialogYesNoComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Dati modificati: si conferma l'uscita?"}
      });
      dialogRef.afterClosed().subscribe(result => {
        if(!result) return;
        else this.navigateBack();
      });
    } else {
      this.navigateBack();
    }   
  }

  navigateBack(){
    this.router.navigate(["alunni"], {queryParams:{
      page: this.caller_page,
      size: this.caller_size,
      filter: this.caller_filter,
      sortField: this.caller_sortField,
      sortDirection: this.caller_sortDirection
     }});
  }

  delete(){
    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.alunniSvc.delete(this.idAlunno)
        .pipe (
          finalize(()=>this.router.navigate(['/alunni']))
        )
        .subscribe(
          res=>{
            this._snackBar.openFromComponent(SnackbarComponent,
              {data: 'Record cancellato', panelClass: ['red-snackbar']}
            );
          },
          err=> (
            console.log("ERRORE")
          )
        );
      }
    });
  }
  //#endregion

  popolaProv(prov: string, cap: string) {
    this.form.controls['prov'].setValue(prov);
    this.form.controls['cap'].setValue(cap);
    this.form.controls['nazione'].setValue('ITA');
  }

  popolaProvNascita(prov: string) {
    this.form.controls['provNascita'].setValue(prov);
    this.form.controls['nazioneNascita'].setValue('ITA');
  }
  
  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (event.target.innerWidth <= 800) ? 2 : 3;
  }
}

