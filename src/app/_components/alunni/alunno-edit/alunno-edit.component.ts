import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { iif, Observable, of } from 'rxjs';
import { concatMap, debounceTime, finalize, map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { AlunniService } from 'src/app/_components/alunni/alunni.service';
import { ComuniService } from 'src/app/_services/comuni.service';

import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { _UT_Comuni } from 'src/app/_models/_UT_Comuni';

import { DialogData, DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { LoadingService } from '../../utilities/loading/loading.service';
import { GenitoreEditComponent } from '../../genitori/genitore-edit/genitore-edit.component';
import { AlunniListComponent } from '../alunni-list/alunni-list.component';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ClassiSezioniAnniAlunniService } from '../../classi/classi-sezioni-anni-alunni.service';
import { ClassiSezioniAnniComponent } from '../../classi/classi-sezioni-anni/classi-sezioni-anni.component';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { GenitoriListComponent } from '../../genitori/genitori-list/genitori-list.component';


@Component({
  selector:     'app-alunno-edit',
  templateUrl:  './alunno-edit.component.html',
  styleUrls:    ['./../alunni.css']
})

export class AlunnoEditComponent implements OnInit {

  alunno$!:                    Observable<ALU_Alunno>;

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  loading:                    boolean = true;
  
  caller_page!:               string;
  caller_size!:               string;
  caller_filter!:             string;
  caller_sortField!:          string;
  caller_sortDirection!:      string;
  
  filteredComuni$!:           Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:    Observable<_UT_Comuni[]>;
  comuniIsLoading:            boolean = false;
  comuniNascitaIsLoading:     boolean = false;
  breakpoint!:                number;
  breakpoint2!:               number;


  @ViewChild('genitoriFamiglia') genitoriFamigliaComponent!: GenitoriListComponent; 
  @ViewChild('classiSezioniAnniAttended') classiAttendedComponent!: ClassiSezioniAnniComponent; 
  @ViewChild('classiSezioniAnniList') classiSezioniAnniListComponent!: ClassiSezioniAnniComponent; 
  
  constructor(public _dialogRef: MatDialogRef<AlunnoEditComponent>,
              @Inject(MAT_DIALOG_DATA) public idAlunno: number,
              private fb:                           FormBuilder, 
              private alunniSvc:                    AlunniService,
              private comuniSvc:                    ComuniService,
              public _dialog:                       MatDialog,
              private _snackBar:                    MatSnackBar,
              private _loadingService :             LoadingService,
              private svcClassiSezioniAnniAlunni:   ClassiSezioniAnniAlunniService, ) 
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

    //this.idAlunno = this.route.snapshot.params['id'];  
    // this.caller_page = this.route.snapshot.queryParams["page"];
    // this.caller_size = this.route.snapshot.queryParams["size"];
    // this.caller_filter = this.route.snapshot.queryParams["filter"];
    // this.caller_sortField = this.route.snapshot.queryParams["sortField"];
    // this.caller_sortDirection = this.route.snapshot.queryParams["sortDirection"];
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 4;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 4;

    //********************* POPOLAMENTO FORM *******************
    //serve distinguere tra form vuoto e form popolato in arrivo da lista alunni
    
    if (this.idAlunno && this.idAlunno + '' != "0") {

      const obsAlunno$: Observable<ALU_Alunno> = this.alunniSvc.loadAlunno(this.idAlunno);
      const loadAlunno$ = this._loadingService.showLoaderUntilCompleted(obsAlunno$);
      //TODO: capire perch?? serve sia alunno | async e sia il popolamento di form
      this.alunno$ = loadAlunno$
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

  save(){

    if (this.form.controls['id'].value == null) 
      this.alunniSvc.post(this.form.value)
        .subscribe(res=> {
          //console.log("return from post", res);
          //this.form.markAsPristine();
          this._dialogRef.close();
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
    );
    else 
      this.alunniSvc.put(this.form.value)
        .subscribe(res=> {
          //console.log("return from put", res);
          //this.form.markAsPristine();
          this._dialogRef.close();
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
    );
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
  }

  delete(){

    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(result => {
      if(result){
        this.alunniSvc.delete(Number(this.idAlunno))
        //.pipe (
        //  finalize(()=>this.router.navigate(['/alunni']))
        //)
        .subscribe(
          res=>{
            this._snackBar.openFromComponent(SnackbarComponent,
              {data: 'Record cancellato', panelClass: ['red-snackbar']}
            );
            this._dialogRef.close();
          },
          err=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          )
        );
      }
    });
  }

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
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 4;
    this.breakpoint2 = (event.target.innerWidth <= 800) ? 2 : 4;
  }

  addGenitore(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: 0
    };

    const dialogRef = this._dialog.open(GenitoreEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
  }

  addToFamily(genitore: ALU_Genitore) {
    //devo fare una verifica prima della post:
    //per caso ?? gi?? figlio? Per questo faccio una concatMap (la post deve avvenire in sequenza quando la verifica ?? finita)
    //ma con una condizione: la iif specifica proprio che SE il risultato della verifica ?? vuoto allora si pu?? procedere con la post
    //altrimenti si mette in successione l'observable vuoto (of())
    
    this.alunniSvc.getGenitoreAlunno(genitore.id, this.idAlunno)
    .pipe(
      concatMap( res => iif (()=> res.length == 0, this.alunniSvc.postGenitoreAlunno(genitore.id, this.idAlunno), of() )
      )
    ).subscribe(
      res=> {
        this.genitoriFamigliaComponent.loadData();
      },
      err=> {
      }
    )
  }

  removeFromFamily(genitore: ALU_Genitore) {
    const alunnoID = this.idAlunno;
    this.alunniSvc.deleteGenitoreAlunno(genitore.id, this.idAlunno).subscribe(
      res=> {
          //console.log("addToFamily OK");
          this.genitoriFamigliaComponent.loadData();
      },
      err=> {
        //console.log("addToFamily KO");
      }
    )

   
  }

  addToAttended(classeSezioneAnno: CLS_ClasseSezioneAnno) {
    //cos?? come ho fatto in dialog-add mi costruisco un oggetto "stile" form e lo passo alla postClasseSezioneAnnoAlunno
    //avrei potuto anche passare i valori uno ad uno, ma ?? gi?? pronta cos?? avendola usata in dialog-add
    let objClasseSezioneAnnoAlunno = {AlunnoID: this.idAlunno, ClasseSezioneAnnoID: classeSezioneAnno.id};
    console.log (this.idAlunno, classeSezioneAnno.anno.id);
    const checks$ = this.svcClassiSezioniAnniAlunni.getByAlunnoAndClasseSezioneAnno(classeSezioneAnno.id, this.idAlunno)
    .pipe(
      //se trova che la stessa classe ?? gi?? presente res.length ?? != 0 quindi non procede con la getByAlunnoAnno ma restituisce of()
      //se invece res.length == 0 dovrebbe proseguire e concatenare la verifica successiva ch ?? getByAlunnoAndAnno...
      //invece "test" non compare mai...quindi? sta uscendo sempre con of()?
      tap(res=> {
        console.log("err1");
        if (res.length !=0) {
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: "Questa classe ?? gi?? stata inserita!"}
          });
        }
      }),
      concatMap( res => iif (()=> res.length == 0,
      this.svcClassiSezioniAnniAlunni.getByAlunnoAndAnno(classeSezioneAnno.anno.id, this.idAlunno) , of() )
      ),
      tap(res=> {
        console.log("err2");
        if (res.length !=0) {
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: "E' gi?? stata inserita una classe in quest'anno!"}
          });
        }
      })

    )


    checks$
    .pipe(

      concatMap( res => iif (()=> res.length == 0,this.svcClassiSezioniAnniAlunni.postClasseSezioneAnnoAlunno(objClasseSezioneAnnoAlunno) , of() )
      )
    ).subscribe(
      res=> {
        //loadData del component attended
        this.classiAttendedComponent.loadData(0);
      },
      err=> {
      }
    )

  }

  removeFromAttended(classeSezioneAnno: CLS_ClasseSezioneAnno) {
    this.svcClassiSezioniAnniAlunni.deleteClasseSezioneAnnoAlunno(classeSezioneAnno.id , this.idAlunno).subscribe(
      res=> {
          //console.log("addToFamily OK");
          this.classiAttendedComponent.loadData(0);
      },
      err=> {
        //console.log("addToFamily KO");
      }
    )
  }
//#region FUNZIONI NON PIU' UTILIZZATE IN QUANTO ORA SI USA SOLO COME DIALOG

  // back(){
  //   if (this.form.dirty) {
  //     const dialogRef = this._dialog.open(DialogYesNoComponent, {
  //       width: '320px',
  //       data: {titolo: "ATTENZIONE", sottoTitolo: "Dati modificati: si conferma l'uscita?"}
  //     });
  //     dialogRef.afterClosed().subscribe(result => {
  //       if(!result) return;
  //       else this.navigateBack();
  //     });
  //   } else {
  //     this.navigateBack();
  //   }   
  // }
  //NON PIU' UTILIZZATA IN QUANTO ORA SI USA SOLO COME DIALOG
  // navigateBack(){
  //   this.router.navigate(["alunni"], {queryParams:{
  //     page: this.caller_page,
  //     size: this.caller_size,
  //     filter: this.caller_filter,
  //     sortField: this.caller_sortField,
  //     sortDirection: this.caller_sortDirection
  //    }});
  // }

  //#endregion
}

