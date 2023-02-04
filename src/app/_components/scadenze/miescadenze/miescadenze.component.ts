import { Component, OnInit }                    from '@angular/core';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { MatDialog }                            from '@angular/material/dialog';
import { tap }                                  from 'rxjs/operators';
import { MatSnackBar }                          from '@angular/material/snack-bar';


//components
import { Utility }                              from '../../utilities/utility.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';


//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { ScadenzePersoneService }               from '../scadenze-persone.service';

//models
import { User }                                 from 'src/app/_user/Users';
import { CAL_ScadenzaPersone }                  from 'src/app/_models/CAL_Scadenza';

@Component({
  selector: 'app-mie-scadenze',
  templateUrl: './miescadenze.component.html',
  styleUrls: ['../scadenze.css']
})

export class MieScadenzeComponent implements OnInit {

//#region ----- Variabili -------

//public userID: string;
public currUser!:                               User;
public obsMieScadenze$!:                        Observable<CAL_ScadenzaPersone[]>
public iscrizioneID:                            number = 43;

matDataSource = new MatTableDataSource<CAL_ScadenzaPersone>();
displayedColumns: string[] = [
  "message",
  "actionsColumn",
  "delete"
];

//#endregion

  constructor( 
    private svcScadenzePersone:                 ScadenzePersoneService,
    private _loadingService:                    LoadingService,
    private _snackBar:                          MatSnackBar, 
    public _dialog:                             MatDialog,
    
    ) {

    this.currUser = Utility.getCurrentUser();   
     
  }

  ngOnInit(){
    this.loadData();
  }

  loadData(){
    let scadenze$: Observable<CAL_ScadenzaPersone[]>;
    scadenze$ = this.svcScadenzePersone.listByPersonaID(this.currUser.personaID);

    this.obsMieScadenze$ =this._loadingService.showLoaderUntilCompleted(scadenze$);
    
  }

  setLetto(element: CAL_ScadenzaPersone) {

    //element.ckLetto = !element.ckLetto;
    element.ckLetto = true;

    this.svcScadenzePersone.put(element).subscribe(
      res=> this.loadData(),
      err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella chuisura della scadenza ', panelClass: ['red-snackbar']})
    );
  }

  setAccettato(element: CAL_ScadenzaPersone) {
    console.log(element);
    element.ckAccettato = true;
    element.ckRespinto = false;
    this.svcScadenzePersone.put(element).subscribe(
      res=> {},
      err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella chuisura della scadenza ', panelClass: ['red-snackbar']})
    );
  }

  setRespinto(element: CAL_ScadenzaPersone) {
    if (element.personaID == this.currUser.personaID) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Non è possibile Respingere un proprio invito"}
      });
      this.loadData();
    } else {
      console.log(element);
      element.ckAccettato = false;
      element.ckRespinto = true;
      this.svcScadenzePersone.put(element).subscribe(
        res=> {},
        err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella chuisura della scadenza ', panelClass: ['red-snackbar']})
      );
    }
  }

  deleteMsg(id: number) {
    //da decidere cosa fare
    // this.svcScadenze.delete(id).subscribe(
    //   res=> this.loadData(),
    //   err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella cancellazione  del messaggio ', panelClass: ['red-snackbar']})
    // );
  }
}
