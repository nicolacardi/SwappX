import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { LoadingService } from '../../utilities/loading/loading.service';
import { RetteService } from '../rette.service';

@Component({
  selector: 'app-rette-list',
  templateUrl: './rette-list.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RetteListComponent implements OnInit {
  
  matDataSource = new MatTableDataSource<PAG_Retta>();
  displayedColumns: string[] =  [];
  displayedColumnsList: string[] = [
                                  "actionsColumn", 
                                  "quotaConcordata",
                                  "mese",
                                  "anno",
                                  "alunno.cognome",
                                  "alunno.nome",
                                  //"note"
                                  ];

  menuTopLeftPosition =  {x: '0', y: '0'} 
  matMenuTrigger: any;

  months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));
  
  constructor(private svcRette:         RetteService,
              private _loadingService:  LoadingService,) { }

  ngOnInit(): void {
    this.displayedColumns =  this.displayedColumnsList;
    this.refresh();

  }

  refresh () {
    let obsRette$: Observable<PAG_Retta[]>;
      
    obsRette$= this.svcRette.load();

    const loadPagamenti$ =this._loadingService.showLoaderUntilCompleted(obsRette$);

    loadPagamenti$.subscribe(val => 
      {
        this.matDataSource.data = val;
        //this.matDataSource.paginator = this.paginator;
        //this.matDataSource.sort = this.sort;
      }
    );
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
  
  onRightClick(event: MouseEvent, element: PAG_Retta) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  addRecord(){
    //TODO
  }

  editRecord(idPagamento: number){
    //TODO
  }

}
