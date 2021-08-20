import { summaryFileName } from '@angular/compiler/src/aot/util';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';


import { Observable, of, pipe, zip } from 'rxjs';
import { concatMap, groupBy, map, mergeMap, reduce, skip, take, tap, toArray } from 'rxjs/operators';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { PAG_Pagamento } from 'src/app/_models/PAG_Pagamento';

import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { PAG_RettaPivot } from 'src/app/_models/PAG_RettaPIVOT';
import { PAG_RettaGroupObj } from 'src/app/_models/PAG_RetteGroupObj';

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
  
p_displayedColumns: string[] = [
                                "blank", 
                                "tipoRec_P",
                                "blank",
                                "blank",

                                "p_SET",
                                "p_OTT",
                                "p_NOV",
                                "p_DIC",
                                "p_GEN",
                                "p_FEB",
                                "p_MAR",
                                "p_APR",
                                "p_MAG",
                                "p_GIU",
                                "p_LUG",
                                "p_AGO"
                                  ];

  menuTopLeftPosition =  {x: '0', y: '0'} 
  matMenuTrigger: any;

  months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));

  myObjAssigned : PAG_RettaGroupObj = {
    alunnoID: 0,
    retta: []
  };


  
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




        // groupBy(o => o.alunnoID),  
        // mergeMap(group => zip([group.key], group.pipe(toArray()))),//non serve a nulla il groupby se non si fa il toArray del group qui
        //   //ma d'altro canto il toArray perde i vuoti
        
        //   //group => group.pipe(
        //     map(obj => { 
        //       console.log ("obj in arrivo", obj);   

        //     //cerca se c'è già un oggetto nell'array con l'alunnoID2 == obj.alunnoID
        //        var found = myObj2.findIndex(x=>(x.alunnoID2 == obj[0]));           
        //        if (found == -1) {
        //     //      //se non lo trova lo aggiunge, quindi poi c'è di sicuro
        //           myObj2.push ({ alunnoID2: obj[0] , alunno: obj[1].alunno, quoteConcordate: [], quoteDefault: [] });
        //         }
            // //   //ora in quello stesso che ha aggiunto, oppure che ha trovato...
            //    var found = myObj2.findIndex(x=>x.alunnoID2 == obj.alunnoID);
            //    //va a scrivere nella posizione corretta la quota concordata e quella di default
            //    myObj2[found].quoteConcordate[obj.mese] = obj.quotaConcordata;
            //    myObj2[found].quoteDefault[obj.mese] = obj.quotaDefault;




            // //cerca se c'è già un oggetto nell'array con l'alunnoID2 == obj.alunnoID
            //   var found = myObj2.findIndex(x=>(x.alunnoID2 == obj.alunnoID));           
            //   if (found == -1) {
            //      //se non lo trova lo aggiunge, quindi poi c'è di sicuro
            //      myObj2.push ({ alunnoID2: obj.alunnoID , alunno: obj.alunno, quoteConcordate: [], quoteDefault: [] });
            //    }
            // //   //ora in quello stesso che ha aggiunto, oppure che ha trovato...
            //    var found = myObj2.findIndex(x=>x.alunnoID2 == obj.alunnoID);
            //    //va a scrivere nella posizione corretta la quota concordata e quella di default
            //    myObj2[found].quoteConcordate[obj.mese] = obj.quotaConcordata;
            //    myObj2[found].quoteDefault[obj.mese] = obj.quotaDefault;
              
              
            //   arrObj.push(
            //     {
            //     'alunnoID': myObj2[found].alunnoID2,
            //     alunno : myObj2[found].alunno,
                
            //     'c_SET': myObj2[found].quoteConcordate[9], 
            //     'c_OTT': myObj2[found].quoteConcordate[10], 
            //     'c_NOV': myObj2[found].quoteConcordate[11],
            //     'c_DIC': myObj2[found].quoteConcordate[12],
            //     'c_GEN': myObj2[found].quoteConcordate[1],
            //     'c_FEB': myObj2[found].quoteConcordate[2],
            //     'c_MAR': myObj2[found].quoteConcordate[3],
            //     'c_APR': myObj2[found].quoteConcordate[4],
            //     'c_MAG': myObj2[found].quoteConcordate[5],
            //     'c_GIU': myObj2[found].quoteConcordate[6],
            //     'c_LUG': myObj2[found].quoteConcordate[7],
            //     'c_AGO': myObj2[found].quoteConcordate[8],
      
            //     'd_SET': myObj2[found].quoteDefault[9], 
            //     'd_OTT': myObj2[found].quoteDefault[10], 
            //     'd_NOV': myObj2[found].quoteDefault[11],
            //     'd_DIC': myObj2[found].quoteDefault[12],
            //     'd_GEN': myObj2[found].quoteDefault[1],
            //     'd_FEB': myObj2[found].quoteDefault[2],
            //     'd_MAR': myObj2[found].quoteDefault[3],
            //     'd_APR': myObj2[found].quoteDefault[4],
            //     'd_MAG': myObj2[found].quoteDefault[5],
            //     'd_GIU': myObj2[found].quoteDefault[6],
            //     'd_LUG': myObj2[found].quoteDefault[7],
            //     'd_AGO': myObj2[found].quoteDefault[8],
            //    });
               //console.log("myObj2", myObj2);
               //return myObj2;
               //return arrObj;
            //}),//fine map
          //   groupBy(o => o.alunnoID2),
          //   mergeMap(
          //  group => zip([group.key], group.pipe(toArray()))),

            


        //),//fine MergeMap

 // #endregion



  //#region ----- QUESTA FUNZIONA NON CANCELLARE -------
        groupBy(o => o.alunnoID),
        mergeMap(
          group => zip([group.key], group.pipe(toArray()))),
          map(arr => {
            //console.log ("arr rette list", arr);  
            //console.log ("quotatrovata2",this.trovaquotaMeseA(arr, 9)) ;
            console.log ("quotaPagamenti",this.trovaSommaPagMese(arr, 9)) ;

           arrObj.push(
            {
            'alunnoID': arr[0],
            alunno : arr[1][0].alunno,
            'c_SET': this.trovaQuotaConcMese(arr, 9) ,       //ERA: 'c_SET': arr[1][0].quotaConcordata,  MA COSI' SI CREAVANO I VUOTI
            'c_OTT': this.trovaQuotaConcMese(arr, 10) ,  
            'c_NOV': this.trovaQuotaConcMese(arr, 11) ,  
            'c_DIC': this.trovaQuotaConcMese(arr, 12) ,  
            'c_GEN': this.trovaQuotaConcMese(arr, 1) ,  
            'c_FEB': this.trovaQuotaConcMese(arr, 2) ,  
            'c_MAR': this.trovaQuotaConcMese(arr, 3) ,  
            'c_APR': this.trovaQuotaConcMese(arr, 4) ,  
            'c_MAG': this.trovaQuotaConcMese(arr, 5) ,  
            'c_GIU': this.trovaQuotaConcMese(arr, 6) ,  
            'c_LUG': this.trovaQuotaConcMese(arr, 7) ,  
            'c_AGO': this.trovaQuotaConcMese(arr, 8) ,  

            'd_SET': this.trovaQuotaDefMese(arr, 9), 
            'd_OTT': this.trovaQuotaDefMese(arr, 10),
            'd_NOV': this.trovaQuotaDefMese(arr, 11),
            'd_DIC': this.trovaQuotaDefMese(arr, 12),
            'd_GEN': this.trovaQuotaDefMese(arr, 1),
            'd_FEB': this.trovaQuotaDefMese(arr, 2),
            'd_MAR': this.trovaQuotaDefMese(arr, 3),
            'd_APR': this.trovaQuotaDefMese(arr, 4),
            'd_MAG': this.trovaQuotaDefMese(arr, 5),
            'd_GIU': this.trovaQuotaDefMese(arr, 6),
            'd_LUG': this.trovaQuotaDefMese(arr, 7),
            'd_AGO': this.trovaQuotaDefMese(arr, 8),

            'p_SET': this.trovaSommaPagMese(arr, 9), 
            'p_OTT': this.trovaSommaPagMese(arr, 10),
            'p_NOV': this.trovaSommaPagMese(arr, 11),
            'p_DIC': this.trovaSommaPagMese(arr, 12),
            'p_GEN': this.trovaSommaPagMese(arr, 1),
            'p_FEB': this.trovaSommaPagMese(arr, 2),
            'p_MAR': this.trovaSommaPagMese(arr, 3),
            'p_APR': this.trovaSommaPagMese(arr, 4),
            'p_MAG': this.trovaSommaPagMese(arr, 5),
            'p_GIU': this.trovaSommaPagMese(arr, 6),
            'p_LUG': this.trovaSommaPagMese(arr, 7),
            'p_AGO': this.trovaSommaPagMese(arr, 8)
            }
          );
          return arrObj;
        })  //fine map
 // #endregion

      )

     .subscribe(val => {
        console.log("Risultato dei vari Map:", val);
       
        //console.log (myObj2);
        this.matDataSource.data = val;
  //       //this.matDataSource.paginator = this.paginator;
  //       //this.matDataSource.sort = this.sort;
       }
     );
   }

  // trovaquotaMese (arr: PAG_RettaGroupObj, m: number) {
  //  return arr.retta.find(x=> x.mese == m)?.quotaConcordata ? arr.retta.find(x=> x.mese == m)?.quotaConcordata : 0
  // }

  trovaQuotaConcMese (arr: Array<any>, m: number) : number {
    this.myObjAssigned.alunnoID =  arr[0];
    this.myObjAssigned.retta =  arr[1]; 
      if (this.myObjAssigned.retta.find(x=> x.mese == m)?.quotaConcordata) {
        return this.myObjAssigned.retta.find(x=> x.mese == m)!.quotaConcordata  //INTERESSANTE L'USO DEL '!' IN QUESTO CASO!
      } else {
        return 0;
      }
   }

  trovaQuotaDefMese (arr: Array<any>, m: number) : number {
    this.myObjAssigned.alunnoID =  arr[0];
    this.myObjAssigned.retta =  arr[1]; 
      if (this.myObjAssigned.retta.find(x=> x.mese == m)?.quotaDefault) {
        return this.myObjAssigned.retta.find(x=> x.mese == m)!.quotaDefault  //INTERESSANTE L'USO DEL '!' IN QUESTO CASO!
      } else {
        return 0;
      }
   }

   trovaSommaPagMese (arr: Array<any>, m: number) : number {
    console.log (arr);
    let sumPags: number;
    this.myObjAssigned.alunnoID =  arr[0];
    this.myObjAssigned.retta =  arr[1]; 
      if (this.myObjAssigned.retta.find(x=> x.mese == m)?.pagamenti) {
        sumPags = 0;
        this.myObjAssigned.retta.find(x=> x.mese == m)!.pagamenti!
        .forEach (x=> sumPags = sumPags + x.importo) ;
        return sumPags;
      } else {
        return 0;
      }
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
