import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';

//services
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { AlunniService } from '../../alunni/alunni.service';
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
import { LoadingService } from '../../utilities/loading/loading.service';

//classes
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_ClasseSezioneAnno } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';

@Component({
  selector: 'app-retta-calcolo',
  templateUrl: './retta-calcolo.component.html',
  styleUrls: ['../pagamenti.css']
})

export class RettaCalcoloComponent implements OnInit {

  obsAnni$!:                          Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  obsClassiSezioniAnni$!:             Observable<CLS_ClasseSezioneAnno[]>;
  obsFilteredAlunni$!:                Observable<ALU_Alunno[]>;

  form! :                             FormGroup;
  public mesiArr =            [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=  ["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];
  public mesiSel =            "110100000000";

  constructor(
    public _dialogRef:                    MatDialogRef<RettaCalcoloComponent>,
    private svcAnni:                      AnniScolasticiService,
    private svcClasseSezioneAnno:         ClassiSezioniAnniService,
    private svcAlunni:                    AlunniService,
    private _loadingService:              LoadingService,
    private fb:                           FormBuilder, 
  ) {
    _dialogRef.disableClose = true;

    let obj = localStorage.getItem('AnnoCorrente');

    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue,
      selectClasse:         "0",
      nomeCognomeAlunno:    [null]
    });
  }

  ngOnInit(): void {

    this.form.controls['selectAnnoScolastico'].valueChanges.subscribe(val => {
      // this.loadData();
      // this.annoIdEmitter.emit(val);
      this.obsClassiSezioniAnni$ = this.svcClasseSezioneAnno.loadClassiByAnnoScolastico(this.form.controls["selectAnnoScolastico"].value);
    })

    this.obsFilteredAlunni$ = this.form.controls['nomeCognomeAlunno'].valueChanges
    .pipe(
      debounceTime(300),
      switchMap(() => this.svcAlunni.filterAlunni(this.form.value.nomeCognomeAlunno))
    )

    this.obsAnni$ = this.svcAnni.load();
    this.obsClassiSezioniAnni$ = this.svcClasseSezioneAnno.loadClassiByAnnoScolastico(this.form.controls["selectAnnoScolastico"].value);

    //this.loadData();
  }

  loadData ( ) {

  }

  blur() {
  
  }
  
  enterAlunnoInput(){

  }

  selected(event: MatAutocompleteSelectedEvent): void {
    //this.data.idAlunno = parseInt(event.option.id);
    //this.form.controls['alunnoID'].setValue(parseInt(event.option.id));
    this.loadData();
  }
  
}
