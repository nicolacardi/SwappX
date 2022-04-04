import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

//components

//services
import { ObiettiviService } from '../../obiettivi/obiettivi.service';
import { LoadingService } from '../../utilities/loading/loading.service';

//classes
import { MAT_Obiettivo } from 'src/app/_models/MAT_Obiettivo';
import { DialogDataVotiObiettivi } from 'src/app/_models/DialogData';


@Component({
  selector: 'app-voti-obiettivi-edit',
  templateUrl: './voti-obiettivi-edit.component.html',
  styleUrls: ['../pagelle.css']
})
export class VotiObiettiviEditComponent implements OnInit {
//#region ----- Variabili -------

  matDataSource = new           MatTableDataSource<MAT_Obiettivo>();

  displayedColumns: string[] = [
    "descrizione", 
  ];

//#endregion  
//#region ----- ViewChild Input Output -------

//#endregion

  constructor(    
    public _dialogRef: MatDialogRef<VotiObiettiviEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataVotiObiettivi,
    private svcObiettivi:                   ObiettiviService,
    private _loadingService:                LoadingService,

    ) { }

  ngOnChanges() {
    if (this.data.classeID != undefined) {
      this.loadData();
    }
  }

  ngOnInit(): void {

  }

  loadData() {
    let obsObiettivi$: Observable<MAT_Obiettivo[]>;

    obsObiettivi$= this.svcObiettivi.listByMateriaAndClasseAndAnno(this.data.mteriaID, this.data.classeID, this.data.annoID);
    let loadObiettivi$ =this._loadingService.showLoaderUntilCompleted(obsObiettivi$);

    loadObiettivi$.subscribe(val =>  {
        this.matDataSource.data = val;
        console.log ("obiettivi", val);
        //this.matDataSource.paginator = this.paginator;          
        //this.sortCustom();
        //this.matDataSource.sort = this.sort; 
        //this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );
  }

}
