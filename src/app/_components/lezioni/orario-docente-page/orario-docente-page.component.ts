import { Component, OnInit }                    from '@angular/core';
import { FormBuilder, FormGroup }               from '@angular/forms';
import { Observable }                           from 'rxjs';

//components


//services
import { DocentiService } from '../../docenti/docenti.service';

//models
import { PER_Docente } from 'src/app/_models/PER_Docente';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';
import { Utility } from '../../utilities/utility.component';
import { User } from 'src/app/_user/Users';

@Component({
  selector:     'app-orario-docente-page',
  templateUrl:  './orario-docente-page.component.html',
  styleUrls:    ['../lezioni.css']
})

export class OrarioDocentePageComponent implements OnInit {
  docenteID!:                                   number;
  currUser!:                                    User;

  obsDocenti$!:                                 Observable<PER_Docente[]>;
  form! :                                       FormGroup;

  constructor(private svcDocenti:                         DocentiService,
              private fb:                                 FormBuilder  ) {

    this.form = this.fb.group( {
      selectDocente: 0

    });
  }
  
//#region ----- LifeCycle Hooks e simili-------

  
  ngOnInit () {
    this.loadData();
  }

  loadData () {

    this.obsDocenti$ = this.svcDocenti.list()

    this.currUser = Utility.getCurrentUser();
    this.svcDocenti.getByPersonaID(this.currUser.personaID).subscribe( 
      res => {            
        this.docenteID = res.id;
        this.form.controls.selectDocente.setValue(res.id);
      },
      err => {
        console.log("getDocenteBypersonaID- KO:", err);
        this.form.controls.selectDocente.setValue(0);
        this.docenteID = 0;
      }
    );
  }

  //#endregion

  
}



