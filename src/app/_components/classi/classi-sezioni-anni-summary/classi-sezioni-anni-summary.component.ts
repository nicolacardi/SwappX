import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

//services
import { LoadingService } from '../../utilities/loading/loading.service';

//classes
import { CLS_ClasseSezioneAnno_Sum } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ClassiSezioniAnniService } from '../classi-sezioni-anni.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';

@Component({
  selector: 'app-classi-sezioni-anni-summary',
  templateUrl: './classi-sezioni-anni-summary.component.html',
  styleUrls: ['../classi.css']
})
export class ClassiSezioniAnniSummaryComponent implements OnInit {

//#region ----- Variabili -------

  matDataSource = new MatTableDataSource<CLS_ClasseSezioneAnno_Sum>();

  public idAnnoScolastico!:           number;
  obsAnni$!:                          Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico

  form! :                             FormGroup;

  displayedColumns: string[] =  [];
  displayedColumnsClassiSezioniAnniSummary: string[] = [
      "classe",
      "sezione",
      "anno",
      "numAlunni",
      "numMaschi",
      "numFemmine"
  ];

  
//#endregion

  constructor(private svcClassi:        ClassiSezioniAnniService,
              private svcAnni:          AnniScolasticiService,
              private fb:               FormBuilder, 
              private _loadingService:  LoadingService) { 

    this.form = this.fb.group({
      selectAnnoScolastico:   [2]     //ATTENZIONE: leggere anno corrente da parametri ambiente
    })
  }

//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {
    this.obsAnni$= this.svcAnni.load();
    this.loadData();

    this.form.controls['selectAnnoScolastico'].valueChanges
    .subscribe(val => {
      this.loadData();
      //this.annoIdEmitter.emit(val);
    })

  }

  loadData() {

    this.displayedColumns = this.displayedColumnsClassiSezioniAnniSummary;
    
    let obsSummary$: Observable<CLS_ClasseSezioneAnno_Sum[]>;
    obsSummary$= this.svcClassi.loadSummary(this.form.controls['selectAnnoScolastico'].value);
    const loadSummary$ =this._loadingService.showLoaderUntilCompleted(obsSummary$);

    loadSummary$.subscribe(val => 
      {
        this.matDataSource.data = val;
      }
    );
    
  }
//#endregion

}
