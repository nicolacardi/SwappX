import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, pipe } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';

//components
import { ClasseSezioneAnnoEditComponent } from '../classe-sezione-anno-edit/classe-sezione-anno-edit.component';

//services
import { LoadingService } from '../../utilities/loading/loading.service';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';

//classes
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { ClassiSezioniAnniFilterComponent } from '../classi-sezioni-anni-filter/classi-sezioni-anni-filter.component';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';
import { concatMap, finalize, map, tap } from 'rxjs/operators';
import { NavigationService } from '../../utilities/navigation/navigation.service';


@Component({
  selector: 'app-classi-sezioni-anni-list',
  templateUrl: './classi-sezioni-anni-list.component.html',
  styleUrls: ['./../classi.css']
})
export class ClassiSezioniAnniListComponent implements OnInit {

//#region ----- Variabili -------
  matDataSource = new MatTableDataSource<CLS_ClasseSezioneAnno>();
  storedFilterPredicate!:       any;

  public idAnnoScolastico!:           number;
  showSelect:                         boolean = true;
  showPageTitle:                      boolean = true;
  showTableRibbon:                    boolean = true;
  obsAnni$!:                          Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico

  selectedRowIndex = -1;
  form! :                             FormGroup;

  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    classe: '',
    sezione: '',
  };

  displayedColumns: string[] =  [];

  displayedColumnsClassiDashboard: string[] =  [
    "descrizione",
    "sezione"
    ];

  displayedColumnsClassiPage: string[] =  [
    "actionsColumn",
    "annoscolastico",
    //"seq",
    "descrizione",
    "sezione",
    "descrizioneAnnoSuccessivo",
    "sezioneAnnoSuccessivo"
    
    ];

  displayedColumnsAlunnoEditList: string[] =  [
    "descrizione",
    "sezione",
    "addToAttended"
    ];

  displayedColumnsAlunnoEditAttended: string[] =  [
    "descrizioneCSAA",
    "sezioneCSAA",
    "annoscolasticoCSAA",
    "removeFromAttended"
    ];
    
//#endregion

//#region ----- ViewChild Input Output -------

  @Input('dove') dove! :                                      string;
  @Input('idAnnoInput') idAnnoInput! :                        number;
  @Input('idClasseInput') idClasseInput! :                    number;
  @Input('alunnoId') alunnoId! :                              number;
  
  @Input() classiSezioniAnniFilterComponent!:                 ClassiSezioniAnniFilterComponent;
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  //@ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
  
  @ViewChild('selectAnnoScolastico') selectAnnoScolastico!: MatSelect; 

  @Output('annoId') annoIdEmitter = new EventEmitter<number>(); //annoId viene EMESSO quando si seleziona un anno dalla select
  @Output('classeId') classeIdEmitter = new EventEmitter<number>(); //classeId viene EMESSO quando si clicca su una classe
  @Output('addToAttended') addToAttended = new EventEmitter<CLS_ClasseSezioneAnno>();
  @Output('removeFromAttended') removeFromAttended = new EventEmitter<CLS_ClasseSezioneAnno>();

//#endregion

constructor(
    private svcClassiSezioniAnni:         ClassiSezioniAnniService,
    private svcAnni:                      AnniScolasticiService,
    private _loadingService:              LoadingService,
    private fb:                           FormBuilder, 
    public _dialog:                       MatDialog, 
    private _navigationService:           NavigationService
  ) { 

    // this.form = this.fb.group({
    //   selectAnnoScolastico:  null  //NON FUNZIONA
    // })

    let obj = localStorage.getItem('AnnoCorrente');
    let annoIdToSet = +(JSON.parse(obj!) as _UT_Parametro).parValue;
    
    // this.svcAnni.loadAnnoScolastico(annoIdToSet)
    //   .subscribe ( val=> {
    //       console.log(val.id);
    //       this.form.controls.selectAnnoScolastico.setValue( val); //NON FUNZIONA
    //     }
    //   );

    this.form = this.fb.group({
      selectAnnoScolastico:  annoIdToSet  //PROBLEMA!!!!!: QUI NON ABBIAMO UN OGGETTO ANNO MA UN ID!!!
    })


  }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {


    this.form.controls['selectAnnoScolastico'].valueChanges.subscribe(val => {
      console.log("select value onchange", this.form.controls.selectAnnoScolastico.value);
      this.loadData();
      this.annoIdEmitter.emit(val); //così non può funzionare ora che [value] = "element" e non [value] = "element.id"
      //this.annoIdEmitter.emit(val.id); ****************************
    })


    this.obsAnni$ = this.svcAnni.load()
      .pipe(
        //nell'HTML imposto [value] = "element" e non [value] = "element.id"
        //devo passare alla matSelect non l'id ma l'oggetto
        //questo lo posso fare nel tap e non nel finalize perchè nel finalize non si può, non c'è la possibilità di mettere (val) ma solo ()
        tap( val => {
          //console.log ("this.idAnnoInput", this.idAnnoInput);
          //this.form.controls.selectAnnoScolastico.setValue(val[this.idAnnoInput-1]); //TERRIBILE!!! bisogna invece trovare l'elemento che ha id = this.idAnnoInput
          //e che INCIDENTALMENTE corrisponde a this.idAnnoInput - 1
          //Serve un filter o simile.

          //this.form.controls.selectAnnoScolastico.setValue( val.find (val=> val.id == this.idAnnoInput) ); ********************
          
          // console.log ("idAnnoInput", this.idAnnoInput);
          // console.log ("val", val);
          // console.log ("val[this.idAnnoInput-1]", val[this.idAnnoInput-1]);
          // console.log ("val.find", val.find (x=> x.id == this.idAnnoInput)); //MINCHIA MA SONO UGUALI!
          

          //this.form.controls.selectAnnoScolastico.setValue(val.filter (x=> {return x.id === this.idAnnoInput})); 


          
        }),
        //Vecchia finalize che non poteva ricevere il (val) =>  
        // finalize( () => {          
        //   if (this.idAnnoInput != undefined) {
        //     console.log ("sto per impostare l'anno con id:" , this.idAnnoInput);
        //     this.form.controls.selectAnnoScolastico.setValue(this.idAnnoInput);
        //     console.log("value impostato", this.form.controls.selectAnnoScolastico.value);
        //   } 
        // })
      );


    this.annoIdEmitter.emit(this.form.controls["selectAnnoScolastico"].value);  //COME FA A FUNZIONARE ORA CHE LA SELECT COME VALUE HA UN OGGETTO?
    //this.annoIdEmitter.emit(this.form.controls["selectAnnoScolastico"].value.id); ***********************


    this.loadData();  //NC spostato qui da sopra 3.12.2021
    
    switch(this.dove) {
      case 'alunno-edit-list':
        this.displayedColumns = this.displayedColumnsAlunnoEditList;
        this.showPageTitle = false;
        this.showTableRibbon = false;
        break;
      case 'alunno-edit-attended': 
        this.displayedColumns = this.displayedColumnsAlunnoEditAttended;
        this.showSelect = false;
        this.showPageTitle = false;
        this.showTableRibbon = false;
        break;
      case 'classi-dashboard':
        this.displayedColumns = this.displayedColumnsClassiDashboard;
        this.showPageTitle = false;
        this.showTableRibbon = false;
        break;
      case 'classi-page':
          this.displayedColumns = this.displayedColumnsClassiPage;
          this.matDataSource.sort = this.sort;
          break;
      default: this.displayedColumns = this.displayedColumnsClassiDashboard;
    }


  }


  compareAnni (a1:ASC_AnnoScolastico, a2: ASC_AnnoScolastico): boolean {
    //paragona il valore selezionato con ogni singolo valore delle singole options? Non ho mica capito bene...
    console.log ("compareAnni", a1, a2);
    if (a1 && a2) {
        return a1.id === a2.id;
    }
    return false;
  }


  loadData ( ) {
   
    let idAnno: number;
    //idAnno = this.form.controls["selectAnnoScolastico"].value.id;
    idAnno = this.form.controls["selectAnnoScolastico"].value;  //Ho cambiato il valore selezionato nell'html, non è più l'id ma l'intero oggetto anno

    let obsClassi$: Observable<CLS_ClasseSezioneAnno[]>;
    if (this.dove == "alunno-edit-attended") 
      obsClassi$= this.svcClassiSezioniAnni.loadClassiByAlunno(this.alunnoId); //qui bisogna pescare byAlunno MA attenzione: il risultato è strutturalmente diverso
    else 
      obsClassi$= this.svcClassiSezioniAnni.loadClassiByAnnoScolastico(idAnno)
      // pipe(
      // map(res=> {
      //   var ret = <CLS_ClasseSezioneAnno[]>res.json();
      //   ret.sort((a,b) => a.classeSezione.classe < b.classeSezione.classe ? -1 : 1);
      //   return ret;
      // })
      // )
      ;


    const loadClassi$ =this._loadingService.showLoaderUntilCompleted(obsClassi$);

    loadClassi$

    .subscribe(val => 
      {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;

        if (this.dove == "classi-page") {
          this.sortCustom(); 
          this.matDataSource.sort = this.sort; 
        }

        this.storedFilterPredicate = this.matDataSource.filterPredicate;
        this.matDataSource.filterPredicate = this.filterRightPanel();
        if(this.matDataSource.data.length >0)
          this.rowclicked(this.matDataSource.data[0]); //seleziona per default la prima riga NON FUNZIONA SEMPRE... SERVE??
        else
        this.rowclicked(undefined);
      }
    );
  }

  rowclicked(val?: CLS_ClasseSezioneAnno ){
    
    //il click su una classe deve essere trasmesso su al parent
    if(val!= undefined && val != null)
      this.selectedRowIndex = val.id;
    else 
      this.selectedRowIndex = -1;
    
    this.classeIdEmitter.emit(this.selectedRowIndex);
  }

//#endregion

//#region ----- Emit per alunno-edit -------

  addToAttendedEmit(item: CLS_ClasseSezioneAnno) {
    this.addToAttended.emit(item);
  }

  removeFromAttendedEmit(item: any) {
    this.removeFromAttended.emit(item);
  }

//#endregion

//#region ----- Filtri & Sort -------

filterRightPanel(): (data: any, filter: string) => boolean {
  let filterFunction = function(data: any, filter: any): boolean {
    let searchTerms = JSON.parse(filter);
    console.log(data);
    return String(data.classeSezione.classe.descrizione2).toLowerCase().indexOf(searchTerms.classe) !== -1
          && String(data.classeSezione.sezione).toLowerCase().indexOf(searchTerms.sezione) !== -1
  }
  return filterFunction;
}


applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  if (filterValue.length == 1) {
    //ripristino il filterPredicate iniziale, precedentemente salvato in storedFilterPredicate
    this.filterPredicateCustom();
    if (this.dove == "classi-page") this.classiSezioniAnniFilterComponent.resetAllInputs();
  }
  this.matDataSource.filter = filterValue.trim().toLowerCase();
}

filterPredicateCustom(){
  //questa funzione consente il filtro ANCHE sugli oggetti della classe
  //https://stackoverflow.com/questions/49833315/angular-material-2-datasource-filter-with-nested-object/49833467
  this.matDataSource.filterPredicate = (data, filter: string)  => {
    const accumulator = (currentTerm: any, key: any) => { //Key è il campo in cui cerco
      switch(key) { 
        case "classeSezione": { 
          return currentTerm + data.classeSezione.sezione + data.classeSezione.classe.descrizione2 ; 
           break; 
        } 
        case "classeSezioneAnnoSucc": { 

          return currentTerm + 
          ((data.classeSezioneAnnoSucc == null) ? "" : data.classeSezioneAnnoSucc.classeSezione.sezione) + 
          ((data.classeSezioneAnnoSucc == null) ? "" : data.classeSezioneAnnoSucc.classeSezione.classe.descrizione2);
           break; 
        } 

        default: { 
        //   return currentTerm + data.importo + data.dtPagamento; 
        return currentTerm;  //di qua non passerà mai
           break; 
        } 
     } 
    };
    const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
    const transformedFilter = filter.trim().toLowerCase();
    return dataStr.indexOf(transformedFilter) !== -1;
  };
}

sortCustom() {
  this.matDataSource.sortingDataAccessor = (item:any, property) => {
    switch(property) {
      case 'annoscolastico':              return item.anno.annoscolastico;
      case 'sezione':                     return item.classeSezione.sezione;
      case 'descrizione':                 return item.classeSezione.classe.descrizione2;
      case 'descrizioneBreve':            return item.classeSezione.classe.descrizioneBreve;
      //case 'seq':                         return item.classeSezione.classe.seq;
      default: return item[property]
    }
  };
}
//#endregion

//#region ----- Add Edit Drop -------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '380px',
      height: '450px',
      data: 0
    };
    const dialogRef = this._dialog.open(ClasseSezioneAnnoEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
  }


  openDetail(id:any) {

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '380px',
      height: '450px',
      data: id
    };

    const dialogRef = this._dialog.open(ClasseSezioneAnnoEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(() => { this.loadData(); //TODO: metto intanto un valore di default CABLATO DENTRO COMUNQUE NON FUNZIONA BENE!
    });
  }
//#endregion


}
