import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { MatDialog } from '@angular/material/dialog';

import { GenitoriService } from 'src/app/_services/genitori.service';
import { ComuniService } from 'src/app/_services/comuni.service';
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { _UT_Comuni } from 'src/app/_models/_UT_Comuni';

import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { LoadingService } from '../../utilities/loading/loading.service';

@Component({
  selector: 'app-genitore-details',
  templateUrl: './genitore-details.component.html',
  styleUrls: ['./genitore-details.component.css']
})

export class GenitoreDetailsComponent implements OnInit {

  idGenitore!:                number;
  caller_page!:               string;
  caller_size!:               string;
  caller_filter!:             string;
  caller_sortField!:          string;
  caller_sortDirection!:      string;

  genitoreForm! :         FormGroup;
  emptyForm :             boolean = false;
  genitore!:              Observable<ALU_Genitore>;
  loading:                boolean = true;

  filteredComuni$!:       Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:Observable<_UT_Comuni[]>;
  comuniIsLoading:        boolean = false;
  comuniNascitaIsLoading: boolean = false;
  breakpoint!:                number;
  
  constructor(private fb:     FormBuilder, 
              private route:          ActivatedRoute,
              private router:         Router,
              private genitoriSvc:    GenitoriService,
              private comuniSvc:      ComuniService,
              public _dialog:         MatDialog,
              private _snackBar:      MatSnackBar,
              private _loadingService :LoadingService)
  {

        let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";
        
        this.genitoreForm = this.fb.group({
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
        });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){

    this.idGenitore = this.route.snapshot.params['id'];  
    this.caller_page = this.route.snapshot.queryParams["page"];
    this.caller_size = this.route.snapshot.queryParams["size"];
    this.caller_filter = this.route.snapshot.queryParams["filter"];
    this.caller_sortField = this.route.snapshot.queryParams["sortField"];
    this.caller_sortDirection = this.route.snapshot.queryParams["sortDirection"];
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;

    //********************* POPOLAMENTO FORM *******************
    //serve distinguere tra form vuoto e form popolato in arrivo da lista alunni
    
    if (this.idGenitore && this.idGenitore != 0) {

      const obsGenitore$: Observable<ALU_Genitore> = this.genitoriSvc.loadAlunno(this.idGenitore);
      const loadGenitore$ = this._loadingService.showLoaderUntilCompleted(obsGenitore$);
      //TODO: capire perchè serve sia alunno | async e sia il popolamento di genitoreForm
      this.genitore = loadGenitore$
      .pipe(
          tap(
            genitore => this.genitoreForm.patchValue(genitore)
          )
      );
    } else {
      this.emptyForm = true
    }
    
    //********************* FILTRO COMUNE *******************
    this.filteredComuni$ = this.genitoreForm.controls['comune'].valueChanges
    .pipe(
      tap(),
      debounceTime(300),
      tap(() => this.comuniIsLoading = true),
      //delayWhen(() => timer(2000)),
      switchMap(() => this.comuniSvc.filterComuni(this.genitoreForm.value.comune)),
      tap(() => this.comuniIsLoading = false)
    )

    //********************* FILTRO COMUNE NASCITA ***********
    this.filteredComuniNascita$ = this.genitoreForm.controls['comuneNascita'].valueChanges
    .pipe(
      tap(),
      debounceTime(300),
      tap(() => this.comuniNascitaIsLoading = true),
      switchMap(() => this.comuniSvc.filterComuni(this.genitoreForm.value.comuneNascita)),
      tap(() => this.comuniNascitaIsLoading = false)
    )
  }  

  save(){

    if (this.genitoreForm.controls['id'].value == null) 
      this.genitoriSvc.postGenitore(this.genitoreForm.value)
        .subscribe(res=> {
          //console.log("return from post", res);
          this.genitoreForm.markAsPristine();
        });
    else 
      this.genitoriSvc.putGenitore(this.genitoreForm.value)
        .subscribe(res=> {
          //console.log("return from put", res);
          this.genitoreForm.markAsPristine();
        });
    
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
  }

  back(){
    
    if (this.genitoreForm.dirty) {
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
    this.router.navigate(["genitori"], {queryParams:{
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
        this.genitoriSvc.deleteGenitore(this.idGenitore)
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


  popolaProv(prov: string, cap: string) {
    this.genitoreForm.controls['prov'].setValue(prov);
    this.genitoreForm.controls['cap'].setValue(cap);
    this.genitoreForm.controls['nazione'].setValue('ITA');
  }

  popolaProvNascita(prov: string) {
    this.genitoreForm.controls['provNascita'].setValue(prov);
    this.genitoreForm.controls['nazioneNascita'].setValue('ITA');
  }

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 3;
  }
}
