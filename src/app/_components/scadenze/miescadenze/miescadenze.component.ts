import { Component, OnInit }                    from '@angular/core';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { _UT_Message }                          from 'src/app/_models/_UT_Message';
import { User }                                 from 'src/app/_user/Users';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { Utility }                              from '../../utilities/utility.component';
import { ScadenzeService } from '../scadenze.service';
import { CAL_Scadenza, CAL_ScadenzaPersone } from 'src/app/_models/CAL_Scadenza';
import { ScadenzePersoneService } from '../scadenze-persone.service';
import { tap } from 'rxjs/operators';

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

matDataSource = new MatTableDataSource<CAL_ScadenzaPersone>();
displayedColumns: string[] = [
  "message",
  "actionsColumn",
  "delete"
];

//#endregion

  constructor( private svcScadenzePersone:      ScadenzePersoneService,
               private _loadingService:         LoadingService,
               private _snackBar:               MatSnackBar ) {

    this.currUser = Utility.getCurrentUser();   
     
  }

  ngOnInit(){
    this.loadData();
  }

  loadData(){
    let scadenze$: Observable<CAL_ScadenzaPersone[]>;
    scadenze$ = this.svcScadenzePersone.listByPersonaID(this.currUser.personaID)
    .pipe(
      tap(val=> console.log (val))
    )
    ;

    this.obsMieScadenze$ =this._loadingService.showLoaderUntilCompleted(scadenze$);
    
  }

  closeMsg(element: CAL_ScadenzaPersone) {
    console.log (element);
    //element.ckLetto = !element.ckLetto;
    element.ckLetto = true;

    this.svcScadenzePersone.put(element).subscribe(
      res=> this.loadData(),
      err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella chuisura della scadenza ', panelClass: ['red-snackbar']})
    );
  }

  deleteMsg(id: number) {
    //da decidere cosa fare
    // this.svcScadenze.delete(id).subscribe(
    //   res=> this.loadData(),
    //   err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella cancellazione  del messaggio ', panelClass: ['red-snackbar']})
    // );
  }
}
