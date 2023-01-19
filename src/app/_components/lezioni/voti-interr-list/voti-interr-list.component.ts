import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';

//components


//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { VotiInterrService }                    from '../voti-interr.service';

//models
import { TST_VotoInterr }                   from 'src/app/_models/TST_VotiInterr';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { VotoInterrEditComponent } from '../voto-interr-edit/voto-interr-edit.component';


@Component({
  selector:     'app-voti-interr-list',
  templateUrl:  './voti-interr-list.component.html',
  styleUrls:    ['../lezioni.css']
})

export class VotiInterrListComponent implements OnInit {

//#region ----- Variabili -------

  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;


  matDataSource = new MatTableDataSource<TST_VotoInterr>();
  
  displayedColumns!: string[];

  displayedColumnsLezione: string[] = [
    "actionsColumn",
    "nome", 
    "cognome", 
    "voto",
    "giudizio",
    "argomento"
  ];

  displayedColumnsDocentiDashboard: string[] = [
    "actionsColumn",
    "nome", 
    "cognome", 
    "dtCalendario",
    "h_Ini",
    "voto",
    "giudizio",
    "argomento"
  ];
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatSort) sort!:                    MatSort;
  @Input() lezioneID!:                          number;
  @Input() docenteID!:                          number;
  @Input() classeSezioneAnnoID!:                number;

//#endregion

  constructor( 
    private svcVotiInterr:                      VotiInterrService,
    private _loadingService:                    LoadingService,
    public _dialog:                             MatDialog, 
    ) { 
  }
  
//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
      this.loadData();
  }
  ngOnInit () {
    //this.loadData();
  }

  loadData () {
    let obsVoti$: Observable<TST_VotoInterr[]>;

    //Il seguente check VORREBBE sostituire una variabile 'dove'!!!
    //Se sono nella vista lezione estraggo con listByLezione
    if (this.lezioneID != undefined) {
      this.showPageTitle = false;
      this.displayedColumns =  this.displayedColumnsLezione;

      obsVoti$= this.svcVotiInterr.listByLezione(this.lezioneID);
      const loadVoti$ =this._loadingService.showLoaderUntilCompleted(obsVoti$);

      loadVoti$.subscribe(
        res =>  {
          //console.log ("listByLezione res", res);
          this.matDataSource.data = res;
          this.sortCustom(); 
          this.matDataSource.sort = this.sort; 
        }
      );
    }
    //Se sono nella vista docenti-dashboard estraggo con listByClasseSezioneAnno 
    else {
      this.displayedColumns =  this.displayedColumnsDocentiDashboard;
        if (this.classeSezioneAnnoID && this.docenteID) {
          obsVoti$= this.svcVotiInterr.listByClasseSezioneAnnoAndDocente(this.classeSezioneAnnoID, this.docenteID);
          const loadVoti$ =this._loadingService.showLoaderUntilCompleted(obsVoti$);

          loadVoti$.subscribe(
            res =>  {
             // console.log ("listByClasseSezioneAnnoAndDocente res", res);

              this.matDataSource.data = res;
              this.sortCustom(); 
              this.matDataSource.sort = this.sort; 
            }
        );
      }

    }
  }
//#endregion

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'nome':                            return item.alunno.persona.nome;
        case 'cognome':                         return item.alunno.persona.cognome;
        default:                                return item[property]
      }
    };
  }

  changeVoto(element: TST_VotoInterr, voto: string ) {
    
    let votoN = parseInt(voto);
    if (votoN >10 ) votoN = 10
    if (votoN <0 )  votoN = 0
    element.voto = votoN;

    this.svcVotiInterr.put(element).subscribe();

  }

  changeGiudizio(element: TST_VotoInterr, giudizio: string) {
    
    element.giudizio = giudizio;

    this.svcVotiInterr.put(element).subscribe();

  }

  changeArgomento(element: TST_VotoInterr, argomento: string) {
    
    element.argomento = argomento;

    this.svcVotiInterr.put(element).subscribe();

  }

  addRecord() {

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '400px',
      data: {
        votoInterr:                             null,
        classeSezioneAnnoID:                    this.classeSezioneAnnoID,
        docenteID:                              this.docenteID
      }
    };
    const dialogRef = this._dialog.open(VotoInterrEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }

  openDetail(element:TST_VotoInterr){


    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '400px',
      data: {
        votoInterr:                             element,
        classeSezioneAnnoID:                    this.classeSezioneAnnoID,
        docenteID:                              this.docenteID
      }
    };
    const dialogRef = this._dialog.open(VotoInterrEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }


}



