import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of, pipe, zip } from 'rxjs';
import { groupBy, map, mergeMap, tap, toArray } from 'rxjs/operators';

import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { PAG_RettaPivot } from 'src/app/_models/PAG_RettaPivot';

import { LoadingService } from '../../utilities/loading/loading.service';
import { RetteService } from '../rette.service';

@Component({
  selector: 'app-rette-list',
  templateUrl: './rette-list.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RetteListComponent implements OnInit {
  
  matDataSource = new MatTableDataSource<PAG_RettaPivot>();
  
  d_displayedColumns: string[] =  [
    "actionsColumn",
    "tipoRec_D",
    "alunno.nome",
    "alunno.cognome",
    //"alunnoID",

    "d_SET",
    "d_OTT",
    "d_NOV",
    "d_DIC",
    "d_GEN",
    "d_FEB",
    "d_MAR",
    "d_APR",
    "d_MAG",
    "d_GIU",
    "d_LUG",
    "d_AGO"
    ];

  c_displayedColumns: string[] = [
                                  "blank", 
                                  "tipoRec_C",
                                  "blank",
                                  "blank",

                                  "c_SET",
                                  "c_OTT",
                                  "c_NOV",
                                  "c_DIC",
                                  "c_GEN",
                                  "c_FEB",
                                  "c_MAR",
                                  "c_APR",
                                  "c_MAG",
                                  "c_GIU",
                                  "c_LUG",
                                  "c_AGO"
                                  //"note"
                                  ];
  

  menuTopLeftPosition =  {x: '0', y: '0'} 
  matMenuTrigger: any;

  months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));
  
  constructor(private svcRette:         RetteService,
              private _loadingService:  LoadingService) {
             
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh () {

    let obsRette$: Observable<PAG_Retta[]>;
    obsRette$= this.svcRette.load();

// NOTA PER PIU' AVANTI: per avere la riga della retta e sotto la riga del pagamento forse è da usare const result$ = concat(series1$, series2$);

    let arrObj: PAG_RettaPivot[] = [];
    obsRette$
    .pipe(
      mergeMap(res=>res),
      groupBy(o => o.alunnoID),
      mergeMap(group => zip([group.key], group.pipe(toArray()))),
      map(arr => {        
        arrObj.push(
          {
          'alunnoID': arr[0],
          alunno : arr[1][0].alunno,
          'c_SET': arr[1][0]?.quotaConcordata, 
          'c_OTT': arr[1][1]?.quotaConcordata, 
          'c_NOV': arr[1][2]?.quotaConcordata,
          'c_DIC': arr[1][3]?.quotaConcordata,
          'c_GEN': arr[1][4]?.quotaConcordata,
          'c_FEB': arr[1][5]?.quotaConcordata,
          'c_MAR': arr[1][6]?.quotaConcordata,
          'c_APR': arr[1][7]?.quotaConcordata,
          'c_MAG': arr[1][8]?.quotaConcordata,
          'c_GIU': arr[1][9]?.quotaConcordata,
          'c_LUG': arr[1][10]?.quotaConcordata,
          'c_AGO': arr[1][11]?.quotaConcordata,

          'd_SET': arr[1][0]?.quotaDefault, 
          'd_OTT': arr[1][1]?.quotaDefault, 
          'd_NOV': arr[1][2]?.quotaDefault,
          'd_DIC': arr[1][3]?.quotaDefault,
          'd_GEN': arr[1][4]?.quotaDefault,
          'd_FEB': arr[1][5]?.quotaDefault,
          'd_MAR': arr[1][6]?.quotaDefault,
          'd_APR': arr[1][7]?.quotaDefault,
          'd_MAG': arr[1][8]?.quotaDefault,
          'd_GIU': arr[1][9]?.quotaDefault,
          'd_LUG': arr[1][10]?.quotaDefault,
          'd_AGO': arr[1][11]?.quotaDefault,
         });
        return arrObj;
      })
    )

    .subscribe(val => {
        console.log("Risultato dei vari Map:", val);
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
