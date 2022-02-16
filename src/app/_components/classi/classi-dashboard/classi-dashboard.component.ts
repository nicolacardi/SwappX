import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import jsPDF from 'jspdf';
import { ActivatedRoute, Router } from '@angular/router';

//components
//import { AlunniListComponent } from '../../alunni/alunni-list/alunni-list.component';
import { IscrizioniClasseListComponent } from '../iscrizioni-classe-list/iscrizioni-classe-list.component';

import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent } from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { IscrizioniAddComponent } from '../iscrizioni-add/iscrizioni-add.component';

//services
import { JspdfService } from '../../utilities/jspdf/jspdf.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { NavigationService } from '../../utilities/navigation/navigation.service';
import { IscrizioniService } from '../iscrizioni.service';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { ClassiSezioniAnniListComponent } from '../classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { IscrizioniClasseCalcoloComponent } from '../iscrizioni-classe-calcolo/iscrizioni-classe-calcolo.component';
import { AlunnoEditComponent } from '../../alunni/alunno-edit/alunno-edit.component';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';


@Component({
  selector: 'app-classi-dashboard',
  animations: [
    trigger('openClose', [
      // ...
      state('open', style({
        transform: 'rotate(0)',
        backgroundImage: 'url("../../../../assets/plus.svg")',
      })),
      state('closed', style({
        transform: 'rotate(-360deg)',
        color: "black",
        backgroundImage: 'url("../../../../assets/alunnoPlus.svg")',
      })),
      transition('open => closed', [
        animate('0.2s ease-in-out')
      ]),
      transition('closed => open', [
        animate('0.2s ease-in-out')
      ]),
    ]),
  ],
  templateUrl: './classi-dashboard.component.html',
  styleUrls: ['./../classi.css']
})



export class ClassiDashboardComponent implements OnInit {


//#region ----- Variabili -------
  public idClasse!:             number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public idAnno!:               number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public idClasseInput!:        string;   //valore ricevuto (routed) dal ruoting
  public idAnnoInput!:          string;   //valore ricevuto (routed) dal ruoting
  isOpen = true;
//#endregion

//#region ----- ViewChild Input Output -------
  //@ViewChild(AlunniListComponent) alunniListComponent!: AlunniListComponent; 
  @ViewChild(ClassiSezioniAnniListComponent) viewClassiSezioniAnni!: ClassiSezioniAnniListComponent; 
  @ViewChild(IscrizioniClasseListComponent) viewListIscrizioni!: IscrizioniClasseListComponent; 
  @Input () classeSezioneAnnoId!: number;
//#endregion

  constructor(
    private svcIscrizioni:                IscrizioniService,
    private _navigationService:           NavigationService,
    public _dialog:                       MatDialog,
    private _jspdf:                       JspdfService,
    private actRoute:                     ActivatedRoute,
    private router:                       Router          
    ) {}

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    //idAnno e idClasse sono due queryParams che arrivano a classi-dashboard ad es. quando si naviga da ClassiSezioniAnniSummary con right click
    //ora vanno passati al Child ClassiSezioniAnniList perchè quello deve settarsi su questo anno e su questa classe
    //l'idAnno ClassiSezioniAnniList lo rpende dalla select che a sua volta lo prende dal local storage (anno di default)
    //bisogna fare in modo che idAnno in arrivo da home component "vinca" rispetto all'idAnno impostato per default

    this.actRoute.queryParams.subscribe(
      params => {
          this.idAnnoInput = params['idAnno'];     
          this.idClasseInput = params['idclasseSezioneAnno'];  
    });


    this._navigationService.passPage("classiDashboard");
  }
//#endregion

//#region ----- altri metodi-------
  mouseOver() {
    this.isOpen = false;
  }

  mouseOut() {
    this.isOpen = true;
  }



  creaPdf() {

    //elenco i campi da tenere
    let fieldsToKeep = ['alunno.nome', 'alunno.cognome'];
    let columnsNames = [['nome', 'cognome']];
    //tolgo dall'array tutti i campi che non servono
    //faccio una copia del matDataSource
    let tmpObjArr : any = this.viewListIscrizioni.matDataSource.data;
    //creo una mappa delle sue proprietà
    let allProperties = this.propertiesToArray(this.viewListIscrizioni.matDataSource.data[0]);

    //creo l'array che butterò fuori
    let arrResult : any= [];

    //con l'aiuto della funzione flatten schiaccio gli oggetti e li metto in arrResult
    tmpObjArr.forEach ((element: any) =>
      //console.log(this.flattenObj(element) ),
      arrResult.push(this.flattenObj(element))
    )  
    console.log (arrResult);
    
    //per ogni proprietà nella mappa vado a vedere se sono incluse nell'array di quelle da tenere
    allProperties.forEach((proprieta: string) =>{
        //se la proprietà non è inclusa....
        if (!fieldsToKeep.includes(proprieta)) {
          //vado a toglierla da ArrResult
          arrResult.forEach ( (record: any) => {
            delete record[proprieta];}
          )
        }
      }
    )

    this._jspdf.creaPdf(arrResult, columnsNames);
  }

  flattenObj (arrToFlatten: any){
  //questa funzione serve per schiacciare un Object
  //e restituire campi del tipo alunno.nome, alunno.cognome invece di alunno {nome:..., cognome:...}
    let result : any = {};
    for (const i in arrToFlatten) {
        //se trova un oggetto allora chiama se stessa ricorsivamente
        if ((typeof arrToFlatten[i]) === 'object' && !Array.isArray(arrToFlatten[i])) {
            const temp = this.flattenObj(arrToFlatten[i]);
            for (const j in temp) {
                //costruisce la stringa ricorsivamente
                result[i + '.' + j] = temp[j];
            }
        }
        // altrimenti non gli fa nulla
        else {
            result[i] = arrToFlatten[i];
        }
    }
    return result;
  };



  flatDeep(arr: any, d = 1) {
    //questa funzione schiaccia un array (non un object, attenzione)
    return d > 0 ? arr.reduce((acc: any, val: any) => acc.concat(Array.isArray(val) ? this.flatDeep(val, d - 1) : val), [])
                 : arr.slice();
  };


  deletePropertyPath (obj: any, path: any) {
    //questa funzione cancella una nested property passandogli il percorso da eliminare in forma: alunno.nome
    if (!obj || !path) {
      return;
    }
    if (typeof path === 'string') {
      path = path.split('.');
    }
    for (var i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]];
      if (typeof obj === 'undefined') {
        return;
      }
    }
    delete obj[path.pop()];
  };



  propertiesToArray(obj: any) {
    //var keyNames = Object.keys(Object); //estrae solo i nomi delle prorietà di primo livello
    //questa routine estrae invece tutte le proprietà e sottoproprietà di un oggetto nella forma alunno.nome
    const isObject = (val: any) =>
      val && typeof val === 'object' && !Array.isArray(val);
  
    const addDelimiter = (a: any, b: any) =>
      a ? `${a}.${b}` : b;
  
    const paths: any = (obj = {}, head = '') => {
      return Object.entries(obj)
        .reduce((product, [key, value]) => 
          {
            let fullPath = addDelimiter(head, key)
            return isObject(value) ?
              product.concat(paths(value, fullPath))
            : product.concat(fullPath)
          }, []);
    }
    return paths(obj);
  }
    



  promuovi() {

    if (this.viewListIscrizioni.getChecked().length == 0) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Selezionare almeno un alunno da promuovere"}
      });
      return;
    }
    
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '300px',
      height: '335px',
      data: {
        idAnno:               this.idAnno,
        classeSezioneAnno:    this.viewClassiSezioniAnni.classeSezioneAnno,
        idClasseSezioneAnno:  this.idClasse,
        arrAlunniChecked:     this.viewListIscrizioni.getChecked(),

      }
    };

    const dialogRef = this._dialog.open(IscrizioniClasseCalcoloComponent, dialogConfig);

  }
//#endregion

//#region ----- add/remove to/from Classe-------

  addAlunnoToClasse() {
    console.log ("this.idAnno", this.idAnno);
    if(this.idClasse<0) return;

    const dialogConfig : MatDialogConfig = {
      panelClass: 'app-full-bleed-dialog',
      width: '400px',
      minHeight: '300px',
      data: {titolo: "Iscrivi alunno alla classe", 
              idAnno:   this.idAnno,
              idClasse: this.idClasse}
    };

    const dialogRef = this._dialog.open(IscrizioniAddComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        result => {
          if(result == undefined){          
          this.viewListIscrizioni.loadData()
          }
    });
  }

  removeAlunnoFromClasse() {
    const objIdToRemove = this.viewListIscrizioni.getChecked();

    const selections = objIdToRemove.length;
    if (selections <= 0) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Selezionare almeno un alunno da cancellare"}
      });
    }
    else{

      const dialogRef = this._dialog.open(DialogYesNoComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Si stanno cancellando le iscrizioni di "+selections+" alunni alla classe. Continuare?"}
      });
      dialogRef.afterClosed().subscribe(
        async result => {
          if(!result) {
            return; 
          } else {
            // objIdToRemove.forEach(val=>{
              
            //   this.svcIscrizioni.delete(val.id)
            //     .subscribe(()=>{
            //     })
            // }); 
            //per ragioni di sincronia (aggiornamento classiSezioniAnniList dopo il loop) usiamo la Promise()
            for (const element of objIdToRemove) {
              await this.svcIscrizioni.delete(element.id)
              .toPromise();
            }

            // let tmpclicked = this.viewClassiSezioniAnni.idClasseSezioneAnno;
            // console.log (tmpclicked);
            this.viewClassiSezioniAnni.loadData()
            // this.viewClassiSezioniAnni.rowclicked(tmpclicked.toString());
            
            this.router.navigate(['/classi-dashboard'], { queryParams: { idAnno: this.idAnno, idClasseSezioneAnno: this.idClasse } });

            this.viewListIscrizioni.resetSelections();
            this.viewListIscrizioni.loadData();

          }
      })
    }
  }
//#endregion

//#region ----- ricezione emit -------
  annoIdEmitted(annoId: number) {
    //questo valore, emesso dal component ClassiSezioniAnni e qui ricevuto
    //serve per la successiva assegnazione ad una classe...in quanto il modale che va ad aggiungere
    //le classi ha bisogno di conoscere anche l'idAnno per fare le proprie verifiche
    
    this.idAnno = annoId;
  }

  classeIdEmitted(classeId: number) {
    this.idClasse = classeId;
  }
//#endregion
  
}