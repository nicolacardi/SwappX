import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';

import { Observable, zip } from 'rxjs';
import { groupBy, map, mergeMap, toArray } from 'rxjs/operators';

import { RettaEditComponent } from '../retta-edit/retta-edit.component';
import { RetteService } from '../rette.service';

import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { PAG_RettaPivot } from 'src/app/_models/PAG_RettaPIVOT';
import { PAG_RettaGroupObj } from 'src/app/_models/PAG_RetteGroupObj';

@Component({
  selector: 'app-rette-list',
  templateUrl: './rette-list.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RetteListComponent implements OnInit {
  
  matDataSource = new MatTableDataSource<PAG_RettaPivot>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  checkedD = true;
  checkedP = true;

  d_displayedColumns: string[] =  [
                                "blank",
                                "tipoRec_D",
                                "blank",
                                "blank",
                                
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
                                "d_AGO" ];

  c_displayedColumns: string[] = [
                                "actionsColumn", 
                                "tipoRec_C",

                                "nome",
                                "cognome",

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
                                "c_AGO" ];
  
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
                                "p_AGO" ];

  menuTopLeftPosition =  {x: '0', y: '0'} 
  matMenuTrigger: any;

  myObjAssigned : PAG_RettaGroupObj = {
    alunnoID: 0,
    retta: []
  };

  public months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2).toLocaleString('it-IT', {month: 'short'}).toUpperCase());

  constructor(private svcRette:         RetteService,
              public _dialog:           MatDialog) {
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh () {

    let obsRette$: Observable<PAG_Retta[]>;
    obsRette$= this.svcRette.load();

// NOTA PER PIU' AVANTI: 
// per avere la riga della retta e sotto la riga del pagamento forse è da usare const result$ = concat(series1$, series2$);

    let arrObj: PAG_RettaPivot[] = [];

    obsRette$
     .pipe(
       mergeMap(res=>res),
        groupBy(o => o.alunnoID),
        mergeMap(
          group => zip([group.key], group.pipe(toArray()))),
          map(arr => {
            //console.log ("arr rette list", arr);  
            //console.log ("quotatrovata2",this.trovaquotaMeseA(arr, 9)) ;
            //console.log ("quotaPagamenti",this.trovaSommaPagMese(arr, 9)) ;

            arrObj.push(
              {
              'alunnoID': arr[0],
              alunno : arr[1][0].alunno!,
              nome: arr[1][0].alunno!.nome,
              cognome: arr[1][0].alunno!.cognome,
              annoID : arr[1][0].annoID,
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
            );  //fine arrObj.push
            return arrObj;
          })    //fine map
      )         //fine mergeMap

     .subscribe(val => {
        //console.log("Risultato dei vari map & mergeMap:", val);
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
       }
     );
   }


  trovaQuotaConcMese (arr: Array<any>, m: number) : number {
    this.myObjAssigned.alunnoID =  arr[0];
    this.myObjAssigned.retta =  arr[1]; 
      if (this.myObjAssigned.retta.find(x=> x.meseRetta == m)?.quotaConcordata) {
        //INTERESSANTE L'USO DEL '!' IN QUESTO CASO! dice: "sono sicuro che non sia undefined"
        return this.myObjAssigned.retta.find(x=> x.meseRetta == m)!.quotaConcordata  
      } else {
        return 0;
      }
   }

  trovaQuotaDefMese (arr: Array<any>, m: number) : number {
    this.myObjAssigned.alunnoID =  arr[0];
    this.myObjAssigned.retta =  arr[1]; 
      if (this.myObjAssigned.retta.find(x=> x.meseRetta == m)?.quotaDefault) {
        return this.myObjAssigned.retta.find(x=> x.meseRetta == m)!.quotaDefault
      } else {
        return 0;
      }
   }

   trovaSommaPagMese (arr: Array<any>, m: number) : number {
    //console.log (arr);
    let sumPags: number;
    this.myObjAssigned.alunnoID =  arr[0];
    this.myObjAssigned.retta =  arr[1]; 
      if (this.myObjAssigned.retta.find(x=> x.meseRetta == m)?.pagamenti) {
        sumPags = 0;
        //IN QUESTO CASO ci sono ben DUE "!" uno per il find e uno per i pagamenti
        this.myObjAssigned.retta.find(x=> x.meseRetta == m)!.pagamenti!
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

  editRecord(alunno: number, anno: number){
    const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '800px',
        height: '680px',
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

  public toggleD(event: MatSlideToggleChange) {
    this.checkedD = event.checked;
  }

  public toggleP(event: MatSlideToggleChange) {
    this.checkedP = event.checked;
  }
}
