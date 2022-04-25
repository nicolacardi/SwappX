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
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
import { DOC_PagellaVotoObiettivo } from 'src/app/_models/DOC_PagellaVotoObiettivo';
import { PagellaVotoObiettiviService } from '../pagella-voto-obiettivi.service';


@Component({
  selector: 'app-voti-obiettivi-edit',
  templateUrl: './voti-obiettivi-edit.component.html',
  styleUrls: ['../pagelle.css']
})
export class VotiObiettiviEditComponent implements OnInit {
//#region ----- Variabili -------

  matDataSource = new           MatTableDataSource<DOC_PagellaVotoObiettivo>();

  displayedColumns: string[] = [
    "descrizione", 
  ];

//#endregion  
//#region ----- ViewChild Input Output -------

//#endregion

  constructor(    
    public _dialogRef: MatDialogRef         <VotiObiettiviEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data:   DialogDataVotiObiettivi,
    private svcPagellaVotoObiettivi:        PagellaVotoObiettiviService,
    private svcClasseSezioneAnno:           ClassiSezioniAnniService,
    private _loadingService:                LoadingService,

    ) { }


  ngOnInit(): void {
    this.loadData();
  }

  loadData() {


    let obsPagellaVotoObiettivi$: Observable<DOC_PagellaVotoObiettivo[]>;

    //obsObiettivi$= this.svcObiettivi.listByMateriaAndClasseAndAnno(this.data.materiaID, this.data.classeSezioneAnnoID);
    obsPagellaVotoObiettivi$= this.svcPagellaVotoObiettivi.ListByPagellaMateriaClasseSezioneAnno(this.data.pagellaVotoID, this.data.materiaID, this.data.classeSezioneAnnoID);

    let loadObiettivi$ =this._loadingService.showLoaderUntilCompleted(obsPagellaVotoObiettivi$);

    loadObiettivi$.subscribe(val =>  {
        this.matDataSource.data = val;
        //this.matDataSource.paginator = this.paginator;          
        //this.sortCustom();
        //this.matDataSource.sort = this.sort; 
        //this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );
  }

}
