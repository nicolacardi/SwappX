import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';


import { Observable, of, pipe, zip } from 'rxjs';
import { concatMap, groupBy, map, mergeMap, reduce, skip, take, tap, toArray } from 'rxjs/operators';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { PAG_Pagamento } from 'src/app/_models/PAG_Pagamento';

import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { PAG_RettaPivot } from 'src/app/_models/PAG_RettaPIVOT';

import { LoadingService } from '../../utilities/loading/loading.service';
import { RettaEditComponent } from '../retta-edit/retta-edit.component';
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
                                  ];
  

  menuTopLeftPosition =  {x: '0', y: '0'} 
  matMenuTrigger: any;

  months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));

  
  constructor(private svcRette:         RetteService,
              public _dialog:           MatDialog) {
  }

  ngOnInit(): void {
    this.refresh();
  }



  refresh () {

    let obsRette$: Observable<PAG_Retta[]>;
    obsRette$= this.svcRette.load();

// NOTA PER PIU' AVANTI: per avere la riga della retta e sotto la riga del pagamento forse è da usare const result$ = concat(series1$, series2$);

    let arrObj: PAG_RettaPivot[] = [];
    let pagObj: PAG_Pagamento[] = [];
    



    //let quoteConcordateA: number []  = [0,0,0,0,0,0,0,0,0,0,0,0];
    interface myObj {
      alunnoID2: number;
      alunno: ALU_Alunno;
      quoteConcordate: number [];
      quoteDefault: number [];
    };

    let myObj2: myObj[] = [];

     obsRette$
     .pipe(
       mergeMap(res=>res),

      //TENTATIVO ULTERIORE
      // mergeMap(group =>
      //   group.pipe(map((acc) => {
      //     return acc.valueOf();
      //   }))
      // ),

      //groupBy(o => o.alunnoID, p=>p.quotaConcordata.toString()),
      //  mergeMap(group =>
      // //REDUCE FUNZIONA SE la groupBy è ANCHE per un secondo campo e SE questo secondo campo è stringa (toString())
      //   group.pipe(reduce((acc, cur) => [...acc, cur], [`${group.key}`])) 
      // ),


//#region ----- ALTERNATIVA PER ORA SENZA ALUNNO -------
        groupBy(o => o.alunnoID),
        mergeMap(
         group => group.pipe(
         map(obj => { 
           console.log ("obj", obj);   
          //cerca se c'è già un oggetto nell'array con l'alunnoID2 == obj.alunnoID
           var found = myObj2.findIndex(x=>(x.alunnoID2 == obj.alunnoID));           
           if (found == -1) {
              //se non lo trova lo aggiunge, quindi poi c'è di sicuro
              myObj2.push ({ alunnoID2: obj.alunnoID , alunno: obj.alunno, quoteConcordate: [], quoteDefault: [] });
            }
            //ora in quello stesso che ha aggiunto, oppure che ha trovato...
            var found = myObj2.findIndex(x=>x.alunnoID2 == obj.alunnoID);
            //va a scrivere nella posizione corretta la quota concordata e quella di default
            myObj2[found].quoteConcordate[obj.mese] = obj.quotaConcordata;
            myObj2[found].quoteDefault[obj.mese] = obj.quotaDefault;
            
            
            arrObj.push(
              {
              'alunnoID': myObj2[found].alunnoID2,
              alunno : myObj2[found].alunno,
              
              'c_SET': myObj2[found].quoteConcordate[9], 
              'c_OTT': myObj2[found].quoteConcordate[10], 
              'c_NOV': myObj2[found].quoteConcordate[11],
              'c_DIC': myObj2[found].quoteConcordate[12],
              'c_GEN': myObj2[found].quoteConcordate[1],
              'c_FEB': myObj2[found].quoteConcordate[2],
              'c_MAR': myObj2[found].quoteConcordate[3],
              'c_APR': myObj2[found].quoteConcordate[4],
              'c_MAG': myObj2[found].quoteConcordate[5],
              'c_GIU': myObj2[found].quoteConcordate[6],
              'c_LUG': myObj2[found].quoteConcordate[7],
              'c_AGO': myObj2[found].quoteConcordate[8],
    
              'd_SET': myObj2[found].quoteDefault[9], 
              'd_OTT': myObj2[found].quoteDefault[10], 
              'd_NOV': myObj2[found].quoteDefault[11],
              'd_DIC': myObj2[found].quoteDefault[12],
              'd_GEN': myObj2[found].quoteDefault[1],
              'd_FEB': myObj2[found].quoteDefault[2],
              'd_MAR': myObj2[found].quoteDefault[3],
              'd_APR': myObj2[found].quoteDefault[4],
              'd_MAG': myObj2[found].quoteDefault[5],
              'd_GIU': myObj2[found].quoteDefault[6],
              'd_LUG': myObj2[found].quoteDefault[7],
              'd_AGO': myObj2[found].quoteDefault[8],
             });


            return arrObj;
         }),

           )
         ),

 // #endregion


      
  //#region ----- QUESTA FUNZIONA NON CANCELLARE -------
      // groupBy(o => o.alunnoID),
      // mergeMap(group => zip([group.key], group.pipe(toArray()))),
      // map(arr => {        
      //   arrObj.push(
      //     {
      //     'alunnoID': arr[0],
      //     alunno : arr[1][0].alunno,

      //     'c_SET': arr[1][0]?.quotaConcordata, 
      //     'c_OTT': arr[1][1]?.quotaConcordata, 
      //     'c_NOV': arr[1][2]?.quotaConcordata,
      //     'c_DIC': arr[1][3]?.quotaConcordata,
      //     'c_GEN': arr[1][4]?.quotaConcordata,
      //     'c_FEB': arr[1][5]?.quotaConcordata,
      //     'c_MAR': arr[1][6]?.quotaConcordata,
      //     'c_APR': arr[1][7]?.quotaConcordata,
      //     'c_MAG': arr[1][8]?.quotaConcordata,
      //     'c_GIU': arr[1][9]?.quotaConcordata,
      //     'c_LUG': arr[1][10]?.quotaConcordata,
      //     'c_AGO': arr[1][11]?.quotaConcordata,

      //     'd_SET': arr[1][0]?.quotaDefault, 
      //     'd_OTT': arr[1][1]?.quotaDefault, 
      //     'd_NOV': arr[1][2]?.quotaDefault,
      //     'd_DIC': arr[1][3]?.quotaDefault,
      //     'd_GEN': arr[1][4]?.quotaDefault,
      //     'd_FEB': arr[1][5]?.quotaDefault,
      //     'd_MAR': arr[1][6]?.quotaDefault,
      //     'd_APR': arr[1][7]?.quotaDefault,
      //     'd_MAG': arr[1][8]?.quotaDefault,
      //     'd_GIU': arr[1][9]?.quotaDefault,
      //     'd_LUG': arr[1][10]?.quotaDefault,
      //     'd_AGO': arr[1][11]?.quotaDefault,
      //    });
      //   return arrObj;
      // })
 // #endregion

      )

     .subscribe(val => {
        //console.log("Risultato dei vari Map:", val);
       
        //console.log (myObj2);
        this.matDataSource.data = val;
  //       //this.matDataSource.paginator = this.paginator;
  //       //this.matDataSource.sort = this.sort;
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

  editRecord(alunno: number, anno: number){







    const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '800px',
        height: '620px',
        data: {
          idAlunno: alunno,
          idAnno: anno
        }
    };

    const dialogRef = this._dialog.open(RettaEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.refresh();
    });
  }

}
