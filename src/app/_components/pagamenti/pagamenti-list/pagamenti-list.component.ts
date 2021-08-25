import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { PAG_Pagamento } from 'src/app/_models/PAG_Pagamento';
import { PagamentoEditComponent } from '../pagamento-edit/pagamento-edit.component';
import { PagamentiService } from '../pagamenti.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pagamenti-list',
  templateUrl: './pagamenti-list.component.html',
  styleUrls: ['../pagamenti.css']
})

export class PagamentiListComponent implements OnInit {

  @Input() dove!:           string;
  //@Input() alunnoID!:       number;

  obsAnni$!: Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  form:                     FormGroup;            //form fatto della sola combo anno scolastico

  show: boolean = true;
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
                                  //"rettaID", 
                                  "retta.quotaConcordata",
                                  "retta.mese",
                                  //"alunnoID", 
                                  "alunno.cognome",
                                  "alunno.nome",
                                  //"genitoreID",
                                  "note"];
  displayedColumnsListRettaEdit: string[] = [
                                   
                                  "dtPagamento", 
                                  "importo", 
                                  "tipoPagamento.descrizione",
                                  "causale.descrizione",
                                  "retta.mese",
                                     ];

  menuTopLeftPosition =  {x: '0', y: '0'} 
  matMenuTrigger: any;

  constructor(private svcPagamenti:     PagamentiService,
              private svcAnni:          AnniScolasticiService,
              public _dialog:           MatDialog, 
              private _loadingService:  LoadingService,
              private fb:               FormBuilder, 
    ) 
  {
    //form composto della sola combo Anno Scolastico: così si riesce tra le altre cose a settare un valore di default
    this.form = this.fb.group({
      annoScolastico:      [1],
    });
  }

  ngOnInit(): void {

    if (this.dove == 'retta-edit') {
      this.show = false;
      this.displayedColumns =  this.displayedColumnsListRettaEdit;
    } else {
      this.show = true;
      this.displayedColumns =  this.displayedColumnsList;
    }
    this.refresh();
  }

  updateList() {
    //TODO: bisogna ri-attivare refresh per caricare la lista dell'anno selezionato
    this.refresh();
  }





  refresh () {

    this.obsAnni$= this.svcAnni.load();

    let obsPagamenti$: Observable<PAG_Pagamento[]>;

    
    console.log("annoID dalla combobox", this.form.controls['annoScolastico'].value);
    //console.log("this.alunnoID", this.alunnoID);
    
    //TODO serve filtrare l'observable obsPagamenti in base al valore selezionato nella dropdwon anno scolastico
    obsPagamenti$= this.svcPagamenti.loadByAnno(this.form.controls['annoScolastico'].value);

    //const loadPagamenti$ =this._loadingService.showLoaderUntilCompleted(obsPagamenti$);

    obsPagamenti$.subscribe(val => 
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

  addRecord(){
    this.editRecord(0);
  }

  editRecord(idPagamento: number){

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '800px',
      height: '500px',
      data: idPagamento
    };

    const dialogRef = this._dialog.open(PagamentoEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.refresh();
    });
  }

  //#endregion


}
