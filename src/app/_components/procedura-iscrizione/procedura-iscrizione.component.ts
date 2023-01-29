import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-procedura-iscrizione',
  templateUrl: './procedura-iscrizione.component.html',
  styleUrls: ['./procedura-iscrizione.component.css']
})
export class ProceduraIscrizioneComponent implements OnInit {
  fg1! :                                        FormGroup;
  fg2! :                                        FormGroup;
  fg3! :                                        FormGroup;
  fg4! :                                        FormGroup;
  fg5! :                                        FormGroup;

  constructor(private fb: FormBuilder) { 

    this.fg1 = this.fb.group({
      firstCtrl:                                       [''],
    })

    this.fg2 = this.fb.group({
      secondCtrl:                                       [''],
    })

    this.fg3 = this.fb.group({
      thirdCtrl:                                       [''],
    })
    
    this.fg4 = this.fb.group({
      thirdCtrl:                                       [''],
    })
    
    this.fg5 = this.fb.group({
      thirdCtrl:                                       [''],
    })


  }

  ngOnInit(): void {
  }

}
