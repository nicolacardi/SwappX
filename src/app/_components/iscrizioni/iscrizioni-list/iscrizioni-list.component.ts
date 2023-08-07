//#region ----- IMPORTS ------------------------

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { Observable, firstValueFrom, tap }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';
import { CdkDragDrop, moveItemInArray}          from '@angular/cdk/drag-drop';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { SelectionModel }                       from '@angular/cdk/collections';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//components
import { IscrizioniFilterComponent }            from '../iscrizioni-filter/iscrizioni-filter.component';
import { AlunnoEditComponent }                  from '../../alunni/alunno-edit/alunno-edit.component';
import { RettaEditComponent }                   from '../../pagamenti/retta-edit/retta-edit.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { Utility }                              from '../../utilities/utility.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { IscrizioniService }                    from '../iscrizioni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { ScadenzeService }                      from '../../scadenze/scadenze.service';
import { ScadenzePersoneService }               from '../../scadenze/scadenze-persone.service';
import { GenitoriService }                      from '../../genitori/genitori.service';
import { MailService }                          from '../../utilities/mail/mail.service';
import { UserService }                          from 'src/app/_user/user.service';

//models
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { AnniScolasticiService }                from 'src/app/_services/anni-scolastici.service';
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';
import { CAL_Scadenza, CAL_ScadenzaPersone }    from 'src/app/_models/CAL_Scadenza';
import { User }                                 from 'src/app/_user/Users';
import { _UT_MailMessage }                      from 'src/app/_models/_UT_MailMessage';


//#endregion
@Component({
  selector:     'app-iscrizioni-list',
  templateUrl:  './iscrizioni-list.component.html',
  styleUrls:    ['../iscrizioni.css']
})

export class IscrizioniListComponent implements OnInit {

//#region ----- Variabili ----------------------
  public currUser!:                             User;

  matDataSource = new                           MatTableDataSource<CLS_Iscrizione>();
  annoID!:                                       number;
  displayedColumns:                             string[] = [
      "actionsColumn", 
      "nome", 
      "cognome", 
      "classesezione",
      // "sezione",
      "stato",
      "actionsColumn2",
      "cf",
      // "email",
      "emailgenitori", 
      //"telefono",
      "dtNascita", 
      // "indirizzo", 
      //"comune", 
      //"prov"
  ];

  rptTitle = 'Lista Iscrizioni';
  rptFileName = 'ListaIscrizioni';
  rptFieldsToKeep  = [
      "alunno.persona.nome", 
      "alunno.persona.cognome", 
      "classeSezioneAnno.classeSezione.classe.descrizioneBreve",
      "classeSezioneAnno.classeSezione.sezione",
      "stato.descrizione",
      "alunno.persona.email", 
      "alunno.persona.telefono",
      "alunno.persona.dtNascita", 
      "alunno.persona.indirizzo", 
      "alunno.persona.comune", 
      "alunno.persona.prov"
  ];

  rptColumnsNames  = [
      "nome", 
      "cognome", 
      "classe",
      "sezione",
      "stato",
      "email", 
      "telefono",
      "nato il", 
      "indirizzo", 
      "comune", 
      "prov"
  ];

  selection = new                               SelectionModel<CLS_Iscrizione>(true, []);   //rappresenta la selezione delle checkbox
  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>;           //Serve per la combo anno scolastico
  form:                                         UntypedFormGroup;                                  //form fatto della sola combo anno scolastico
  
  menuTopLeftPosition =  {x: '0', y: '0'} 

  toggleChecks:                                 boolean = false;
  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;
  emailAddresses!:                              string;


  filterValue = '';       //Filtro semplice

  filterValues = {
    nome: '',
    cognome: '',
    classe: '',
    sezione: '',
    stato: '',
    cf: '',
    email: '',
    telefono: '',
    dtNascita: '',
    indirizzo: '',
    comune: '',
    prov: '',
    filtrosx: ''
  };

//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input('alunnoID') alunnoID! :                              number;
  @Input() iscrizioniFilterComponent!:                        IscrizioniFilterComponent;
  @Input('dove') dove! :                                      string;

  @Output('openDrawer') toggleDrawer = new                    EventEmitter<number>();

//#endregion

//#region ----- Constructor --------------------

  constructor(
    private svcIscrizioni:                      IscrizioniService,
    private svcAnni:                            AnniScolasticiService,
    private svcScadenze:                        ScadenzeService,
    private svcGenitori:                        GenitoriService,
    private svcMail:                            MailService,
    private svcUser:                            UserService,

    private svcScadenzePersone:                 ScadenzePersoneService,
    private fb:                                 UntypedFormBuilder, 
    public _dialog:                             MatDialog, 
    private _loadingService:                    LoadingService, 
    private _snackBar:                          MatSnackBar,

  ) {

    let obj = localStorage.getItem('AnnoCorrente');
    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    });
    this.currUser = Utility.getCurrentUser();
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------
  
  ngOnInit () {
    this.obsAnni$= this.svcAnni.list();
    this.loadData();
  }

  updateList() {
    this.loadData();
  }

  loadData () {
    let obsIscrizioni$: Observable<CLS_Iscrizione[]>;

    this.annoID = this.form.controls['selectAnnoScolastico'].value;
    if (this.annoID != undefined && this.annoID > 0 ) {
      obsIscrizioni$= this.svcIscrizioni.listByAnno(this.annoID);
      let loadIscrizioni$ =this._loadingService.showLoaderUntilCompleted(obsIscrizioni$);
      
      loadIscrizioni$.subscribe(
        val =>  {
          //console.log (val);
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;          
          this.sortCustom();
          this.matDataSource.sort = this.sort; 
          this.matDataSource.filterPredicate = this.filterPredicate();
          this.getEmailAddresses();
        }
      );
    } 
  }

  getEmailAddresses() {
    //aggiorna this.emailAddresses che serve per poter copiare dalla toolbar gli indirizzi dei genitori
    const emailArray = this.matDataSource.filteredData
      .map(iscrizione => iscrizione.alunno._Genitori!.map(genitore => genitore.genitore!.persona.email).filter(email => !!email))
      .filter(emails => emails.length > 0); 
      
    this.emailAddresses = emailArray.join(', ');
  }


//#endregion

//#region ----- Filtri & Sort ------------------

  resetSearch(){
    this.filterInput.nativeElement.value = "";
    this.filterValue = "";
    this.filterValues.filtrosx = "";
  }

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'nome':                        return item.alunno.persona.nome;
        case 'cognome':                     return item.alunno.persona.cognome;
        case 'classe':                      return item.classeSezioneAnno.classeSezione.classe.descrizioneBreve;
        case 'sezione':                     return item.classeSezioneAnno.classeSezione.sezione;
        case 'cf':                          return item.alunno.persona.cf;
        case 'email':                       return item.alunno.persona.email;
        case 'telefono':                    return item.alunno.persona.telefono;
        case 'dtNascita':                   return item.alunno.persona.dtNascita;
        case 'stato':                       return item.stato.descrizione;
        case 'indirizzo':                   return item.alunno.persona.indirizzo;
        case 'comune':                      return item.alunno.persona.comune;
        case 'prov':                        return item.alunno.persona.prov;

        default: return item[property]
      }
    };
  }

  applyFilter(event: Event) {

    this.filterValue = (event.target as HTMLInputElement).value;

    //Reset dei filtri di destra
    //this.iscrizioniFilterComponent.resetAllInputs();
   
    //Inserimento del Main Filter in uno specifico (filtrosx) dei campi di filterValues
    if( this.filterValue != undefined && this.filterValue != ""){
      this.filterValues.filtrosx = this.filterValue.toLowerCase();
    }
    //applicazione del filtro
    this.matDataSource.filter = JSON.stringify(this.filterValues)
    this.getEmailAddresses();
  }

  filterPredicate(): (data: any, filter: string) => boolean {

    let filterFunction = function(data: any, filter: any): boolean {
      
      let searchTerms = JSON.parse(filter);
      //la Classe viene gestita separatamente in quanto solo per lei (nel filtro di dx) si trova la corrispondenza ESATTA
      let trovataClasseOVuota : boolean = false; 

      if (searchTerms.classe == null || searchTerms.classe == "") 
        trovataClasseOVuota = true;
      if (String(data.classeSezioneAnno.classeSezione.classe.descrizioneBreve).toLowerCase() == searchTerms.classe) 
        trovataClasseOVuota = true;
      
      let dArr = data.alunno.persona.dtNascita.split("-");
      const dtNascitaddmmyyyy = dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];

      let boolSx = String(data.alunno.persona.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.persona.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.classeSezioneAnno.classeSezione.classe.descrizioneBreve).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.classeSezioneAnno.classeSezione.sezione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.persona.cf).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.persona.email).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.persona.telefono).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(dtNascitaddmmyyyy).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.persona.indirizzo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.persona.comune).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.persona.prov).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;

      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.alunno.persona.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                && String(data.alunno.persona.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                && String(data.classeSezioneAnno.classeSezione.sezione).toLowerCase().indexOf(searchTerms.sezione) !== -1
                && trovataClasseOVuota
                && String(data.alunno.persona.cf).toLowerCase().indexOf(searchTerms.cf) !== -1
                && String(data.alunno.persona.email).toLowerCase().indexOf(searchTerms.email) !== -1
                && String(data.alunno.persona.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
                && String(dtNascitaddmmyyyy).toLowerCase().indexOf(searchTerms.dtNascita) !== -1
                && String(data.alunno.persona.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
                && String(data.alunno.persona.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
                && String(data.alunno.persona.prov).toLowerCase().indexOf(searchTerms.prov) !== -1;

      return boolSx && boolDx;
    }
    return filterFunction;
  }
//#endregion

//#region ----- Add Edit Drop ------------------

  addRecord(){

    //TODO!!!
    /*
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
      data: 0
    };
    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
    */
  }

  openDetail(alunnoID:number){
    
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '900px',
      height: '700px',
      data: alunnoID
    };
    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Right Click --------------------

  onRightClick(event: MouseEvent, element: CLS_Iscrizione) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  openPagamenti(alunnoID: number){
    let annoID = 1; //TODO questa sarà un default da mettere nei parametri
    const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '850px',
        height: '620px',
        data: {
          alunnoID: alunnoID,
          annoID: annoID
        }
    };

    const dialogRef = this._dialog.open(RettaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }
//#endregion

//#region ----- Gestione Campo Checkbox --------
  selectedRow(element: CLS_Iscrizione) {
    this.selection.toggle(element);
  }

  /*
  masterToggle() {
    this.toggleChecks = !this.toggleChecks;

    if (this.toggleChecks) 
      this.selection.select(...this.matDataSource.data);
    else 
      this.resetSelections();
  }
  */
  
  resetSelections() {
    this.selection.clear();
    this.matDataSource.data.forEach(row => this.selection.deselect(row));
  }

  // toggleAttivi(){
  //   this.ckSoloAttivi = !this.ckSoloAttivi;
  //   this.loadData();
  // }

  // getChecked() {
  //   //funzione usata da classi-dahsboard
  //   return this.selection.selected;
  // }

    //non so se serva questo metodo: genera un valore per l'aria-label...
  //forse serve per poi pescare i valori selezionati?
  checkboxLabel(row?: CLS_Iscrizione): string {
    if (!row) 
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    else
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  //questo metodo ritorna un booleano che dice se sono selezionati tutti i record o no
  //per ora non lo utilizzo
  isAllSelected() {
    const numSelected = this.selection.selected.length;   //conta il numero di elementi selezionati
    const numRows = this.matDataSource.data.length;       //conta il numero di elementi del matDataSource
    return numSelected === numRows;                       //ritorna un booleano che dice se sono selezionati tutti i record o no
  }
//#endregion

//#region ----- Altri metodi -------------------



  makeScadenzaAndSendEmail (iscrizione: CLS_Iscrizione, setScadenza: boolean) {

    //console.log ("iscrizioni-list - makeScadenzaAndSendEmail - iscrizione:", iscrizione);

    let Genitori = iscrizione.alunno._Genitori!;
    if (Genitori.length == 0) {
      //Se non ci sono genitori si ferma tutto
      this._dialog.open(DialogOkComponent, {
        width: '450px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Non sono presenti genitori ai quali inviare la mail"}
      });
    } else {
      let emailGenitori = 0;
      for (let i = 0; i < Genitori.length; i++) {
        if (Genitori[i].genitore!.persona.email != null && Genitori[i].genitore!.persona.email != '') {
          emailGenitori++;
        }
      }

      //Se ci sono genitori ma questi non hanno mail si ferma tutto
      if (emailGenitori == 0) {
        this._dialog.open(DialogOkComponent, {
          width: '450px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Non sono presenti indirizzi email dei genitori<br>a cui inviare l'avviso."}
        });
      } 
      else {
        if (setScadenza) this.makeScadenza(iscrizione);  //viene impostata la scadenza SOLO al primo invio, ai successivi il parametro setScadenza è impostato a false
        this.inviaMailGenitori(iscrizione);
      }
    }
  }

  makeScadenza(iscrizione: CLS_Iscrizione) {
    //questa routine 
    //- crea la Scadenza nell'elenco scadenze (svcSacdenze.post)
    //- chiama insertScadenzaGenitori, che inserisce i nomi dei genitori in ScadenzaPersone onde mostrare loro la scadenza
    //- aggiorna lo stato dell'iscrizione al valore successivo (svcIscrizioni.updateStato)
    //console.log ("iscrizioni-list - makeScadenza - iscrizione:", iscrizione);

    //prendo la data corrente
    let dtTMP = new Date ();

    //ne estraggo ora e minuto
    let setHours = 0;
    let setMinutes = 0;
    setHours = (dtTMP.getHours() + 1)
    setMinutes = (dtTMP.getMinutes())

    //creo una seconda data e ci metto l'ora + 1 e il minuto
    let dtTMP2 = new Date (dtTMP.setHours(setHours));
    dtTMP2.setMinutes(setMinutes);

    let dtScadenza = dtTMP.toLocaleString('sv').replace(' ', 'T').substring(0,10)
    let h_Ini = dtTMP.toLocaleString('sv').replace(' ', 'T').substring(11,19)
    let h_End = dtTMP2.toLocaleString('sv').replace(' ', 'T').substring(11,19)

    //inserisco la scadenza
    const objScadenza = <CAL_Scadenza>{
      dtCalendario: dtScadenza,
      title: "RICHIESTA DI ISCRIZIONE PER " + iscrizione.alunno!.persona.nome + ' ' + iscrizione.alunno!.persona.cognome,
      start: dtScadenza,
      end: dtScadenza,
      color: "#FF0000", //fa schifetto TODO
      ckPromemoria: true,
      ckRisposta: false,
      h_Ini: h_Ini,
      h_End: h_End,
      PersonaID: this.currUser.personaID,
      TipoScadenzaID: 6,  //fa schifetto  TODO
    }

    let formData = {
      id: iscrizione.id,
      codiceStato: iscrizione.stato.codiceSucc  
    }

    this.svcScadenze.post(objScadenza)
    .subscribe({
      next: scad => {
        this.insertScadenzaGenitori(iscrizione, scad.id); 
        this.svcIscrizioni.updateStato(formData).subscribe(res=>this.loadData());
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Richiesta inviata', panelClass: ['green-snackbar']});
      },
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore invio richiesta', panelClass: ['red-snackbar']})
    })
  }

  insertScadenzaGenitori(iscrizione: CLS_Iscrizione, scadenzaID: number) {
    //iscrizione è un oggetto complesso che dentro _Genitori contiene già gli eventuali genitori (almeno 1 sennò qui non ci si arriva)
    //console.log ("iscrizioni-list - insertScadenzaGenitori - iscrizione", iscrizione, "scadenzaID", scadenzaID);
    iscrizione.alunno._Genitori!.forEach (genitori => {
      let objScadenzaPersona: CAL_ScadenzaPersone = {
        personaID: genitori.genitore!.persona.id,
        scadenzaID : scadenzaID,
        ckLetto: false,
        ckAccettato: false,
        ckRespinto: false,
        link: iscrizione.id.toString()
      }
      //console.log ("iscrizioni-list - insertScadenzaGenitori - objScadenzaPersona", objScadenzaPersona);
      this.svcScadenzePersone.post(objScadenzaPersona).subscribe();
    });
   }

  async inviaMailGenitori (iscrizione: CLS_Iscrizione) {

    let mailAddress: string;
    let mailAddresses: string = "";
    let mailAddressesNo: number = 0;
    let desinenza = "o";
    if (iscrizione.alunno.persona.genere = "F") { desinenza = "a"}

    let titoloMail = "STOODY: Procedura di Iscrizione";
    let userGenitore: any;
    let sigSigRa = "Sig.";

    for (let i =0; i < iscrizione.alunno._Genitori!.length; i++) {

      if (iscrizione.alunno._Genitori![i].genitore!.persona.genere == "F") { sigSigRa = "Sig.ra "}

      let imageUrl = './assets/logo/logoMailStoody.png';
      let base64Image = '';
      try {base64Image = await Utility.convertImageToBase64(imageUrl);} 
      catch (error) {console.error('Error converting image to base64:', error);}

      let testoMail =  "<html><body><h2>Procedura di iscrizione</h2>"+
        "Gentile " + sigSigRa + " " + iscrizione.alunno._Genitori![i].genitore!.persona.cognome + ", <br><br>" +
        "con questa mail vi invitiamo a iscrivere vostr" + desinenza + " figli" + desinenza + " " + iscrizione.alunno.persona.nome  +
        " alla classe " + iscrizione.classeSezioneAnno.classeSezione.classe!.descrizione + " per l'a.s. " + iscrizione.classeSezioneAnno.anno.annoscolastico + ".<br>" +
        "A questo scopo vi inoltriamo il link per accedere al portale:<br><br>"+ 
        // "<h2 style='color: lightseagreen'>STOODY</h2>"+
        "<img style='width: 100px' src='"+ base64Image +"'/>";
       
      //console.log (testoMail);

      mailAddress = iscrizione.alunno._Genitori![i].genitore!.persona.email;
      //console.log ("mailAddress trovato i", mailAddress);

      if (mailAddress != null && mailAddress != '') {

        //interrogo e aspetto il DB per sapere se il genitore ha già uno username
        await firstValueFrom(this.svcUser.getByPersonaID(iscrizione.alunno._Genitori![i].genitore!.personaID)
          .pipe(
            tap(res => { userGenitore = res;}
          )
        ));

        if (userGenitore) {
          testoMail = testoMail + "<br><br>"+
          "Potete utilizzare lo username : "+ userGenitore.userName;
        } else {
          //se non ha username vado a crearlo
          let rndPassword = Utility.generateRandomString();
          let formData = {
            UserName:   mailAddress,
            Email:      mailAddress,
            PersonaID:  iscrizione.alunno._Genitori![i].genitore!.personaID,
            Password:   rndPassword
          };

          await firstValueFrom(this.svcUser.post(formData));

          testoMail = testoMail + "<br><br>E' stato creato lo username : "+ mailAddress + " con password : " + rndPassword;
        }

        mailAddressesNo++;
        mailAddresses = mailAddresses + " "+ mailAddress;
        mailAddress = "nicola.cardi@gmail.com"; //per evitare di spammare il mondo in questa fase
        //console.log ("mailAddress, testoMail, titoloMail", mailAddress, testoMail, titoloMail);

        let objMail: _UT_MailMessage= {
          emailAddress: mailAddress,
          testoMail: testoMail,
          titoloMail: titoloMail
        }
        //this.svcMail.inviaMail(mailAddress, testoMail, titoloMail);
        this.svcMail.inviaMail(objMail).subscribe({
          next: res=> {
            this._dialog.open(DialogOkComponent, {
              width: '320px',
              data: {titolo: "ATTENZIONE!", sottoTitolo: "Inviata email a " + mailAddresses}
            });
          },
          error: err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: "Errore durante l'invio", panelClass: ['red-snackbar']}))
        });
      } else {
        console.log ("indirizzo mail mancante per il genitore", iscrizione.alunno._Genitori![i].genitore!.persona.nome+ " "+ iscrizione.alunno._Genitori![i].genitore!.persona.cognome);
      }
      //console.log (mailAddressesNo, "mailAddressesNo");
      //console.log (mailAddresses, "mailAddresses");
    }
  }

//#endregion

}

  
