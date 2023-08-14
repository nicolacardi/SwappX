//#region ----- IMPORTS ------------------------
import { Component, Input, OnInit }             from '@angular/core';
import { ConsensiService }                      from '../../impostazioni/consensi/consensi.service';
import { MatDialog }          from '@angular/material/dialog';
import { LoadingService } from '../../utilities/loading/loading.service';
import { Observable } from 'rxjs';

//models
import { _UT_Consenso } from 'src/app/_models/_UT_Consenso';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

//#endregion
@Component({
  selector: 'app-consensi-iscrizione',
  templateUrl: './consensi-iscrizione.component.html',
  styleUrls: ['../procedura-iscrizione.css']
})
export class ConsensiIscrizioneComponent implements OnInit  {

//#region ----- Variabili ----------------------
  obsConsensi$!:                                Observable<_UT_Consenso[]>;
  formConsensi! :                               UntypedFormGroup;
  questions: any[] = []; // Assuming questions is an array of question objects

//#endregion

//#region ----- ViewChild Input Output -------
  @Input() iscrizioneID!:                       number;
//#endregion

//#region ----- Constructor --------------------
  
constructor(private svcConsensi:                ConsensiService,
            private fb:                         UntypedFormBuilder, 

            private _loadingService:            LoadingService,
            public _dialog:                     MatDialog
            ) {

                  
    this.formConsensi = this.fb.group({})
            }
//#endregion

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.obsConsensi$ = this.svcConsensi.list();  


    this.obsConsensi$.subscribe((questions: any[]) => {
      this.questions = questions;
      // Iterate through the questions and add form controls
      this.questions.forEach((element) => {
        // Initialize a form control for each question with a default value (e.g., '1')
         if (element.numOpzioni !=1) this.formConsensi.addControl(element.id, this.fb.control('', Validators.required));
         if (element.numOpzioni ==1) this.formConsensi.addControl(element.id, this.fb.control('', Validators.requiredTrue));
      });
    });
    
  }


  
//#endregion


}
