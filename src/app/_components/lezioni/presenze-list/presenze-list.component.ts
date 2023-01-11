import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';
import { SelectionModel }                       from '@angular/cdk/collections';

//components


//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PresenzeService }                      from '../presenze.service';

//models
import { CAL_Presenza }                         from 'src/app/_models/CAL_Presenza';


@Component({
  selector:     'app-presenze-list',
  templateUrl:  './presenze-list.component.html',
  styleUrls:    ['../lezioni.css']
})

export class PresenzeListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<CAL_Presenza>();
  
  displayedColumns: string[] = [
      "ckPresente",
      "nome", 
      "cognome", 
  ];



  selection = new SelectionModel<CAL_Presenza>(true, []);   //rappresenta la selezione delle checkbox
  selectedRowIndex=-1;

  matSortActive!:               string;
  matSortDirection!:            string;


  idPresenzeChecked:              number[] = [];
  toggleChecks:                 boolean = false;
  showPageTitle:                boolean = true;
  showTableRibbon:              boolean = true;

//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  // @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() lezioneID!:                              number;


//#endregion

  constructor(
    private svcPresenze:                        PresenzeService,
    private _loadingService:                    LoadingService,
  ) { }
  

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    console.log ("ngOnChanges");
      this.toggleChecks = false;
      this.showTableRibbon = false;
  }
  
  ngOnInit () {
    this.loadData();
  }


  loadData () {
    let obsPresenze$: Observable<CAL_Presenza[]>;


    //if (this.context == "classi-dashboard" && this.classeSezioneAnnoID != undefined) {
    if (this.lezioneID != undefined) {


      obsPresenze$= this.svcPresenze.listByLezione(this.lezioneID);
      const loadPresenze$ =this._loadingService.showLoaderUntilCompleted(obsPresenze$);

      loadPresenze$.subscribe(
        res =>  {
          console.log ("res", res);
          this.matDataSource.data = res;
          this.matDataSource.paginator = this.paginator;
          this.sortCustom(); 
          this.matDataSource.sort = this.sort; 
        }
      );
    } 



  }



  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'nome':                        return item.alunno.nome;
        case 'cognome':                     return item.alunno.cognome;
        case 'email':                       return item.alunno.email;
        case 'telefono':                    return item.alunno.telefono;
        case 'dtNascita':                   return item.alunno.dtNascita;
        case 'stato':                       return item.stato.descrizione;
        default: return item[property]
      }
    };
  }

//#endregion





//#region ----- Gestione Campo Checkbox -------
  selectedRow(element: CAL_Presenza) {
    this.selection.toggle(element);
  }

  masterToggle() {
    this.toggleChecks = !this.toggleChecks;

    if (this.toggleChecks) 
      this.selection.select(...this.matDataSource.data);
    else 
      this.resetSelections();
  }

  resetSelections() {
    this.selection.clear();
    this.matDataSource.data.forEach(row => this.selection.deselect(row));
  }



  getChecked() {
    //funzione usata da classi-dahsboard
    return this.selection.selected;
  }



  //questo metodo ritorna un booleano che dice se sono selezionati tutti i record o no
  //per ora non lo utilizzo
  isAllSelected() {
    const numSelected = this.selection.selected.length;   //conta il numero di elementi selezionati
    const numRows = this.matDataSource.data.length;       //conta il numero di elementi del matDataSource
    return numSelected === numRows;                       //ritorna un booleano che dice se sono selezionati tutti i record o no
  }
//#endregion



}



