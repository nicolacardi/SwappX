import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from 'src/app/_user/user.service';
import { User } from 'src/app/_user/Users';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { LoadingService } from '../../utilities/loading/loading.service';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['../users.css']
})
export class UserEditComponent implements OnInit {

  user$!:                     Observable<User>;
  form! :                     FormGroup;
  emptyForm :                 boolean = false;

  ruoli =[1,3,4,9];
  constructor(
    @Inject(MAT_DIALOG_DATA) public idUser: string,
    public _dialogRef:                          MatDialogRef<UserEditComponent>,
  
    private svcUser:                            UserService,
    public _dialog:                             MatDialog,
    private _snackBar:                          MatSnackBar,
    private _loadingService :                   LoadingService,
    private fb:                                 FormBuilder,
  ) { 

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      userName:         [''],
      fullName:         [''],
      email:            [''],
      badge:            [''],
      password:         [''],
      ruolo:            [''],
    });

  }


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.idUser && this.idUser + '' != "0") {

      const obsUser$: Observable<User> = this.svcUser.get(this.idUser);
      const loadUser$ = this._loadingService.showLoaderUntilCompleted(obsUser$);
      
      this.user$ = loadUser$
      .pipe(
          tap(utente => {
            console.log("utente", utente);
            this.form.patchValue(utente)
          })
      );
    } else {
      this.emptyForm = true

    }
  }
//#endregion

  delete() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(result => {
      if(result){
        this.svcUser.delete(this.idUser)
        .subscribe(
          ()=>{
            this._snackBar.openFromComponent(SnackbarComponent,
              {data: 'Record cancellato', panelClass: ['red-snackbar']}
            );
            this._dialogRef.close();
          },
          ()=> (
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          )
        );
      }
    });
  }

  save() {

    var formData = {
      userID:     this.idUser,   
      UserName:   this.form.controls.userName.value,
      Email:      this.form.controls.email.value,
      FullName:   this.form.controls.fullName.value,
      Badge:      this.form.controls.badge.value,
      Ruolo:      this.form.controls.ruolo.value
    };
    console.log("formData", formData);

    if (formData.userID == "0") {
        this.svcUser.post(this.form.value)
             .subscribe(res=> {
               this._dialogRef.close();
             },
             err=> (
               this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
             ));
    } else {
      this.svcUser.put(formData)
        .subscribe( ()=> {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Profilo utente salvato (MANCANO PASSWORD E RUOLO)', panelClass: ['green-snackbar']})}
        );
    }

    var formDataPwd = {
      userID:     this.idUser,   
      Password:   this.form.controls.password.value
    };

    if(this.form.controls.password.dirty && this.form.controls.password.value != "" ){

      console.log("Dirty Diana");

      this.svcUser.ResetPassword(formDataPwd)
        .subscribe( res=> {
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Password modificata', panelClass: ['green-snackbar']});
          this._dialogRef.close();
        },
        err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel cambio password', panelClass: ['red-snackbar']})
        ));
      }

    //   if (this.form.controls['id'].value == null) //ma non sarebbe == 0?
    //   this.svcAlunni.post(this.form.value)
    //     .subscribe(res=> {
    //       this._dialogRef.close();
    //     },
    //     err=> (
    //       this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    //     )
    // );
    // else 
    //   this.svcAlunni.put(this.form.value)
    //     .subscribe(res=> {
    //       this._dialogRef.close();
    //     },
    //     err=> (
    //       this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    //     )
    // );
    // this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});



  }

}



// //**********************

// //#region ----- Variabili -------

// classeSezioneAnno$!:        Observable<CLS_ClasseSezioneAnno>;
  
// obsAnni$!:                  Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
// obsClassi$!:                Observable<CLS_Classe[]>;
// obsClassiSezioniAnniSucc$!: Observable<CLS_ClasseSezioneAnnoGroup[]>;
// obsClasseSezione$!:         Observable<CLS_ClasseSezione>;

// obs!: Subscription;

// form! :                     FormGroup;
// emptyForm :                 boolean = false;
// breakpoint!:                number;
// //#endregion

// constructor( 
//   @Inject(MAT_DIALOG_DATA) public idClasseSezioneAnno: number,
//   public _dialogRef:                          MatDialogRef<ClasseSezioneAnnoEditComponent>,

//   private svcAnni:                            AnniScolasticiService,
//   public _dialog:                             MatDialog,
//   private _snackBar:                          MatSnackBar,
//   private _loadingService :                   LoadingService
// ) { 
//   _dialogRef.disableClose = true;
//   this.form = this.fb.group({
//     id:                         [null],
//     annoID:                     ['', Validators.required],
//     classeSezioneAnnoSuccID:    [''],
//     classeSezioneID:            [null],
    
//     sezione:                    ['', Validators.required],
//     classeID:                   ['', Validators.required]
//   });

// }

// //#region ----- LifeCycle Hooks e simili-------


// loadData(){


//   //TODO per ottenere l'elenco di tutte le classi dell'anno scolastico successivo 
//   //forse bisogna prelevare l'id dell'anno della classe che si sta guardando, e poi prendere le classi
//   //tramite loadClassiByAnnoScolastico a cui si passa l'id + 1? Solo e si è sicuri che gli anni scolastici sono stati inseriti tutti
//   //con una sequenza di id...altrimenti serve che ogni anno scolastico abbia l'indicazione dell'id dell'anno successivo...per poter estrarre l'id
//   //dell'anno successivo e con quello fare la loadClassiByAnnoScolastico....

//   //********************* POPOLAMENTO FORM *******************
//   if (this.idClasseSezioneAnno && this.idClasseSezioneAnno + '' != "0") {

//     const obsClasseSezioneAnno$: Observable<CLS_ClasseSezioneAnno> = this.svcClasseSezioneAnno.loadClasse(this.idClasseSezioneAnno);
//     const loadClasseSezioneAnno$ = this._loadingService.showLoaderUntilCompleted(obsClasseSezioneAnno$);
    
//     this.classeSezioneAnno$ = loadClasseSezioneAnno$
//     .pipe(
//         tap(classe => {
          
//           //this.form.patchValue(classe); //non funziona bene, perchè ci sono dei "sotto-oggetti"
//           this.form.controls.id.setValue(classe.id); //NB in questo modo si setta il valore di un campo del formBuilder quando NON compare anche come Form-field nell'HTML
//           this.form.controls['sezione'].setValue(classe.classeSezione.sezione); 
//           this.form.controls['classeID'].setValue(classe.classeSezione.classe.id);
//           this.form.controls['annoID'].setValue(classe.anno.id);

//           let annoIDsucc=0;
//           this.svcAnni.getAnnoSucc(classe.anno.id) 
//           .pipe (
//             tap ( val   =>  annoIDsucc= val.id),
//             concatMap(() => this.obsClassiSezioniAnniSucc$ = this.svcClasseSezioneAnno.listByAnnoGroupByClasse(annoIDsucc))
//           ).subscribe(
//             res=>{
//             },
//             err=>{
//               this.obs.unsubscribe();  ///NC ??? serve nel caso di errore, ma qui dentro cosa accade se c'è un errore?
//             }

//           );
//           this.form.controls['classeSezioneAnnoSuccID'].setValue(classe.ClasseSezioneAnnoSucc?.id); 
//         })
//     );
//   } else 
//     this.emptyForm = true
// }

// //#endregion

// //#region ----- Operazioni CRUD -------
// save(){
//   //console.log ("form.id", this.form.controls['id'].value );

//   var piDClasse = this.form.controls['classeID'].value;
//   var pSezione = this.form.controls['sezione'].value;

//   if (this.form.controls['id'].value == null){
//     this.svcClasseSezione.loadByClasseSezione (piDClasse, pSezione) 
//       .pipe (
//           tap ( val   =>   this.form.controls['classeSezioneID'].setValue(val.id)),
//           concatMap(() => this.svcClasseSezioneAnno.post(this.form.value))
//         ).subscribe(
//           () => { 
//             this._dialogRef.close();
//           },
//           err=> (
//             console.log("ERRORE POST" ),
//             this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
//           )
//     );
//   }
//   else{
//     this.svcClasseSezione.loadByClasseSezione (piDClasse, pSezione) 
//       .pipe (
//           tap ( val   =>   this.form.controls['classeSezioneID'].setValue(val.id)),
//           concatMap(() => this.svcClasseSezioneAnno.put(this.form.value))
//         ).subscribe(
//           () => { 
//             this._dialogRef.close();
//           },
//           err=> (
//             console.log("ERRORE PUT" ),
//             this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
//           )
//     );
//   }

//   this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});

// }

// delete(){
//   //console.log ("this.idClasseSezioneAnno", this.idClasseSezioneAnno);
//   const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
//     width: '320px',
//     data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
//   });
//   dialogYesNo.afterClosed().subscribe(result => {
//     if(result){
//       this.svcClasseSezioneAnno.delete(Number(this.idClasseSezioneAnno))
//       .subscribe(
//         res=>{
//           this._snackBar.openFromComponent(SnackbarComponent,
//             {data: 'Record cancellato', panelClass: ['red-snackbar']}
//           );
//           this._dialogRef.close();
//         },
//         err=> (
//           this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
//         )
//       );
//     }
//   });
// }



// updateAnnoSucc(selectedAnno: number) {

//   console.log("SELECTED ANNO: " , selectedAnno);

//   //su modifica della combo dell'anno deve cambiare l'eleco delle classi successive disponibili...e che si fa del valore eventualmente già selezionato? lo si pone a null?
//   //comunque? anche se è un valore che sarebbe valido lo perdiamo in caso di modifica dell'anno selezionato?
//   //this.obsClassiSezioniAnniSucc$= this.svcClasseSezioneAnno.loadClassiByAnnoScolastico(selectedAnno + 1); 
//   let annoIDsucc=0;


//   this.obs=  this.svcAnni.getAnnoSucc(selectedAnno) 
//     .pipe (
//       tap ( val   =>  annoIDsucc= val.id),
//       concatMap(() => this.obsClassiSezioniAnniSucc$= this.svcClasseSezioneAnno.listByAnnoGroupByClasse(annoIDsucc))
//     ).subscribe(
//       res=>{
//       },
//       err=>{
//         this.obs.unsubscribe();
//       }

//     );
// }

// //#endregion


