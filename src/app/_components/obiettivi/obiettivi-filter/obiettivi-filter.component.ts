import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ObiettiviListComponent } from '../obiettivi-list/obiettivi-list.component';

//services
import { AnniScolasticiService } from 'src/app/_services/anni-scolastici.service';
import { ClassiService } from '../../classi/classi.service';
import { MaterieService } from '../../materie/materie.service';
import { ObiettiviService } from '../../obiettivi/obiettivi.service';

//classes
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_Classe } from 'src/app/_models/CLS_Classe';
import { MAT_Materia } from 'src/app/_models/MAT_Materia';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-obiettivi-filter',
  templateUrl: './obiettivi-filter.component.html',
  styleUrls: ['../obiettivi.css']
})
export class ObiettiviFilterComponent implements OnInit {

//#region ----- Variabili -------
  obsClassi$!:                Observable<CLS_Classe[]>;
  obsAnni$!:                  Observable<ASC_AnnoScolastico[]>;
  obsMaterie$!:               Observable<MAT_Materia[]>;

  classeFilter = new UntypedFormControl('');
  annoFilter = new UntypedFormControl('');
  materiaFilter = new UntypedFormControl('');
  tipoVotoFilter = new UntypedFormControl('');
//#endregion

//#region ----- ViewChild Input Output -------  
@Input() obiettiviListComponent!: ObiettiviListComponent;
//#endregion

  constructor(
    private svcClassi:                      ClassiService,
    private svcAnni:                        AnniScolasticiService,
    private svcMaterie:                     MaterieService,
  ) { }

  ngOnInit(){

    this.obsClassi$ = this.svcClassi.list();
    this.obsAnni$= this.svcAnni.list();
    this.obsMaterie$ = this.svcMaterie.list();

    this.classeFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();  
        this.obiettiviListComponent.filterValues.classeID = val;
        this.obiettiviListComponent.matDataSource.filter = JSON.stringify(this.obiettiviListComponent.filterValues);
      }
    )

    this.materiaFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();  
        this.obiettiviListComponent.filterValues.materiaID = val;
        this.obiettiviListComponent.matDataSource.filter = JSON.stringify(this.obiettiviListComponent.filterValues);
      }
    )

    this.annoFilter.valueChanges.subscribe(
      val => {
        //this.resetFilterSx();  
        this.obiettiviListComponent.filterValues.annoID = val;
        this.obiettiviListComponent.matDataSource.filter = JSON.stringify(this.obiettiviListComponent.filterValues);
      }
    )
  }

  resetAllInputs() {
    this.classeFilter.setValue('', {emitEvent:false});
    this.annoFilter.setValue('', {emitEvent:false});
    this.materiaFilter.setValue('', {emitEvent:false});
    this.tipoVotoFilter.setValue('', {emitEvent:false});
  }

  resetAllInputsAndClearFilters() {
    this.classeFilter.setValue('');
    this.annoFilter.setValue('')
    this.materiaFilter.setValue('');
    this.tipoVotoFilter.setValue('');
  }

}
