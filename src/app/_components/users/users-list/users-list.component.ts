import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { MatTableDataSource} from '@angular/material/table';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';

//components
//import { AlunnoEditComponent } from '../alunno-edit/alunno-edit.component';
import { UsersFilterComponent } from '../users-filter/users-filter.component';

//services
import { UserService } from '../../../_user/user.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { NavigationService } from '../../utilities/navigation/navigation.service';

//classes
import { User } from 'src/app/_models/Users';


@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['../users.css']
})

export class UsersListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<User>();
  storedFilterPredicate!:       any;

  displayedColumns: string[] =  [];
  displayedColumnsUsersList: string[] = [
      "userID", 
      "fullname", 
      "email", 
      "username", 
      "badge"
  ];

  selection = new SelectionModel<User>(true, []);   //rappresenta la selezione delle checkbox

  matSortActive!:               string;
  matSortDirection!:            string;

  public page!:                 string;

  menuTopLeftPosition =  {x: '0', y: '0'} 
  idUsersChecked:              number[] = [];
  toggleChecks:                 boolean = false;
  showPageTitle:                boolean = true;
  showTableRibbon:              boolean = true;
  public swSoloAttivi :         boolean = true;

  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    fullname: ''
    
  };
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() usersFilterComponent!:                            UsersFilterComponent;
  @Input('dove') dove! :                                      string;

  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
//#endregion

  constructor(private svcUsers:        UserService,
              private router:           Router,
              public _dialog:           MatDialog, 
              private _loadingService:  LoadingService,
              private _navigationService:   NavigationService
              ) {
  }
  
//#region ----- LifeCycle Hooks e simili-------
  ngOnChanges() {
   
      if (this.dove != ''){
        this.loadData();
        this.toggleChecks = false;
        this.resetSelections();
      }

  }
  
  ngOnInit () {
    switch(this.dove) {
      case 'users-page': 
        this.displayedColumns =  this.displayedColumnsUsersList;
        this._navigationService.getGenitore().subscribe(
          val=>{
          if (val!= '') {
            this.toggleDrawer.emit();
            this.usersFilterComponent.fullnameFilter.setValue(val);
            this.loadData(); 
          }
        });
        break;
     
      default: 
        this.displayedColumns =  this.displayedColumnsUsersList;
    }
  }

  loadData () {
    let obsUsers$: Observable<User[]>;

    if (this.dove =="users-page") {
      obsUsers$= this.svcUsers.list();
      /*
      if(this.swSoloAttivi){
        obsUsers$= this.svcUsers.list()
          .pipe(map(res=> res.filter((x) => x.ckAttivo == true)));
      }
      else {
        obsUsers$= this.svcUsers.list();
      }
      */
      const loadUsers$ =this._loadingService.showLoaderUntilCompleted(obsUsers$);

      loadUsers$.subscribe(val => 
        {
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
          this.matDataSource.sort = this.sort; 
          this.storedFilterPredicate = this.matDataSource.filterPredicate;
          this.matDataSource.filterPredicate = this.filterRightPanel();
        }
      );
    }
  }
//#endregion

//#region ----- Filtri & Sort -------

  filterRightPanel(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      return String(data.fullname).toLowerCase().indexOf(searchTerms.fullname) !== -1
        

    }
    return filterFunction;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.length == 1) {
      this.matDataSource.filterPredicate = this.storedFilterPredicate;
      if (this.dove == "alunni-page") this.usersFilterComponent.resetAllInputs();
    }
    this.matDataSource.filter = filterValue.trim().toLowerCase();
  }

//#endregion

//#region ----- Add Edit Drop -------
  addRecord(){
    /*
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: 0
    };
    const dialogRef = this._dialog.open(UserEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
    */
  }

  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '620px',
      data: id
    };
    /* TODO
    const dialogRef = this._dialog.open(UserEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
    */
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Right Click -------

  onRightClick(event: MouseEvent, element: User) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  
//#endregion



//#region ----- Gestione Campo Checkbox -------
  selectedRow(element: User) {
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

  toggleAttivi(){
    this.swSoloAttivi = !this.swSoloAttivi;
    this.loadData();
  }

  getChecked() {
    //funzione usata da classi-dahsboard
    return this.selection.selected;
  }

    //non so se serva questo metodo: genera un valore per l'aria-label...
  //forse serve per poi pescare i valori selezionati?
  checkboxLabel(row?: User): string {

    /* TODO
    if (!row) 
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    else
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
      */

      return "";
  }

  //questo metodo ritorna un booleano che dice se sono selezionati tutti i record o no
  //per ora non lo utilizzo
  isAllSelected() {
    const numSelected = this.selection.selected.length;   //conta il numero di elementi selezionati
    const numRows = this.matDataSource.data.length;       //conta il numero di elementi del matDataSource
    return numSelected === numRows;                       //ritorna un booleano che dice se sono selezionati tutti i record o no
  }
//#endregion

//#region ----- Altri metodi -------
  onResize(event: any) {
    this.displayedColumns = (event.target.innerWidth <= 800) ? 
      ["select", 
      "actionsColumn", 
      "nome", 
      "cognome", 
      "dtNascita", 
      "email"] 
      : 
      ["select", 
      "actionsColumn", 
      "nome", 
      "cognome", 
      "dtNascita", 
      "indirizzo", 
      "comune", 
      "cap", 
      "prov", 
      "email", 
      "telefono", 
      "ckAttivo"];
  }
//#endregion


}



  //NON DOVREBBE SERVIRE, ELIMINARE
  // concatenaFindGenitori(data: any, searchTerms: any): boolean{
  //   let found : boolean;
  //   //per ogni genitore trovato vado a concatenare la || di true. Quelli non trovati fanno la || di false quindi non aggiungono niente
  //   data._Genitori?.forEach((val: { genitore: { nome: any; }; })=>    (   
  //       found = found || String(val.genitore.nome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore)  !== -1   ))
    
  //   //alla fine found conterrà true se almeno un genitore viene trovato e false altrimenti
  //   return found!;
  // }

