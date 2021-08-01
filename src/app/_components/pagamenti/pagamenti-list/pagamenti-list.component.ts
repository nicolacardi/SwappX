import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { PAG_Pagamento } from 'src/app/_models/PAG_Pagamento';
import { LoadingService } from '../../utilities/loading/loading.service';
import { PagamentiEditComponent } from '../pagamenti-edit/pagamenti-edit.component';
import { PagamentiService } from '../pagamenti.service';

@Component({
  selector: 'app-pagamenti-list',
  templateUrl: './pagamenti-list.component.html',
  styleUrls: ['../pagamenti.css']
})

export class PagamentiListComponent implements OnInit {

  matDataSource = new MatTableDataSource<PAG_Pagamento>();
  displayedColumns: string[] =  [];
  displayedColumnsList: string[] = [
                                  "actionsColumn", 
                                  "dtPagamento", 
                                  "importo", 
                                  //"tipoPagamentoID", 
                                  "tipoPagamento.descrizione",
                                  //"causaleID", 
                                  "causale.descrizione",
                                  "rettaID", 
                                  //"alunnoID", 
                                  "alunno.cognome",
                                  "alunno.nome",
                                  "genitoreID", 
                                  "note"];

  menuTopLeftPosition =  {x: '0', y: '0'} 
  matMenuTrigger: any;

  constructor(private svcPagamenti:     PagamentiService,
              public _dialog:           MatDialog, 
              private _loadingService:  LoadingService,
    ) {
  
  }

  ngOnInit(): void {

    this.displayedColumns =  this.displayedColumnsList;
    this.refresh();
  }

  refresh () {
    let obsPagamenti$: Observable<PAG_Pagamento[]>;
      
    obsPagamenti$= this.svcPagamenti.load();

    const loadPagamenti$ =this._loadingService.showLoaderUntilCompleted(obsPagamenti$);

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
  
  onRightClick(event: MouseEvent, element: PAG_Pagamento) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  //#region ### Funzioni ###
  

  openDetail(idPagamento: number){

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '620px',
      data: idPagamento
    };

    const dialogRef = this._dialog.open(PagamentiEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.refresh();
    });
  }

  //#endregion


}