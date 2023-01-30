import { Component, OnInit }                    from '@angular/core';
import { FormBuilder, FormGroup }               from '@angular/forms';
import { concatMap, map }                            from 'rxjs/operators';
import { Observable }                           from 'rxjs';

//components
import { Utility }                              from '../utilities/utility.component';

//services
import { AlunniService }                        from '../alunni/alunni.service';
import { GenitoriService }                      from '../genitori/genitori.service';

//models
import { User }                                 from 'src/app/_user/Users';
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { ActivatedRoute } from '@angular/router';
import { IscrizioniService } from '../iscrizioni/iscrizioni.service';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { ALU_Genitore } from 'src/app/_models/ALU_Genitore';
import { ALU_GenitoreAlunno } from 'src/app/_models/ALU_GenitoreAlunno';

@Component({
  selector: 'app-procedura-iscrizione',
  templateUrl: './procedura-iscrizione.component.html',
  styleUrls: ['./procedura-iscrizione.component.css']
})
export class ProceduraIscrizioneComponent implements OnInit {

  private currUser!:                            User;
  private genitoreBool:                         boolean = false;
  //public obsFigli$!:                            Observable<ALU_Alunno[]>;
  public obsIscrizione$!:                       Observable<CLS_Iscrizione>;
  public genitoriArr:                           ALU_Genitore[] = []

  private form! :                               FormGroup;
  public iscrizioneID!:                         number;

  fg1! :                                        FormGroup;
  fg2! :                                        FormGroup;
  fg3! :                                        FormGroup;
  fg4! :                                        FormGroup;
  fg5! :                                        FormGroup;

  constructor(
    private fb:                                 FormBuilder,
    private svcIscrizioni:                      IscrizioniService,
    // private svcGenitori:                        GenitoriService,
    private actRoute:                           ActivatedRoute,


  ) { 

    this.fg1 = this.fb.group({
      firstCtrl:                                [''],
    })

    this.fg2 = this.fb.group({
      secondCtrl:                               [''],
    })

    this.fg3 = this.fb.group({
      thirdCtrl:                                [''],
    })
    
    this.fg4 = this.fb.group({
      thirdCtrl:                                [''],
    })
    
    this.fg5 = this.fb.group({
      thirdCtrl:                                [''],
    })

    this.form = this.fb.group({
      figlio:                         [null],
    });



  }

  ngOnInit(): void {
    //estraggo lo user
    // this.currUser = Utility.getCurrentUser();

    //verifico se è un genitore  //TODO va inserito campo ckGenitore
    // if (this.currUser.TipoPersona.ckGenitore) {
    //   this.genitoreBool = true;
    // }
    // this.genitoreBool = true; //per ora lo imposto fisso

    //se è un genitore vado a caricarne i figli
    //ma mi serve il genitoreID e non personaID

    // this.obsFigli$ = this.svcGenitori.getByPersona(this.currUser.personaID)
    // .pipe(
    //   //in base al genitoreID estraggo tutti i figli
    //   concatMap(genitore => this.svcAlunni.listByGenitore(genitore.id))
    // );

    this.actRoute.queryParams.subscribe(
      params => {
        this.iscrizioneID = params['iscrizioneID'];     
    });

    this.loadData()

  }

  loadData() {
    //ottengo dall'iscrizione tutti i dati: dell'alunno e dei genitori

    
    this.svcIscrizioni.get(this.iscrizioneID)
    .subscribe(res => {
      
      //console.log(res.alunno._Genitori!.length);
      res.alunno._Genitori!.forEach(
        (genitorealunno: ALU_GenitoreAlunno) =>{
        console.log ("g", genitorealunno);
        this.genitoriArr.push(genitorealunno.genitore!);
        console.log ("pushed");
        }
        
      )
      console.log ("genitoriArr", this.genitoriArr);
    }

    )
    ;
  }

}
