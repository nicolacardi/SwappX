import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { DOC_Pagella } from 'src/app/_models/DOC_Pagella';
import { LoadingService } from '../../utilities/loading/loading.service';
import { PagelleService } from '../pagelle.service';

@Component({
  selector: 'app-pagella-edit',
  templateUrl: './pagella-edit.component.html',
  styleUrls: ['../pagelle.css']
})
export class PagellaEditComponent implements OnInit  {
//#region ----- Variabili -------
  matDataSource = new           MatTableDataSource<DOC_Pagella>();

  showPageTitle:                boolean = true;

  displayedColumns: string[] = [
    "materia", 
    "votoFinale", 
    "giudizio1", 
];
//#endregion  
//#region ----- ViewChild Input Output -------
  @Input('idIscrizione') idIscrizione!:          number;
//#endregion


  constructor(
    private svcPagella:                 PagelleService,
    private _loadingService:            LoadingService,

  ) { }

  ngOnChanges() {
    if (this.idIscrizione != undefined) {
      this.loadData();
    }
   // console.log();
  }

  ngOnInit(): void {
  }

  loadData () {

    let obsPagella$: Observable<DOC_Pagella[]>;
  
    obsPagella$= this.svcPagella.listPagellaByIscrizione(this.idIscrizione);
    let loadPagella$ =this._loadingService.showLoaderUntilCompleted(obsPagella$);

    loadPagella$.subscribe(val =>  {
        this.matDataSource.data = val;
        //this.matDataSource.paginator = this.paginator;          
        //this.sortCustom();
        //this.matDataSource.sort = this.sort; 
        //this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );
    
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }


}
