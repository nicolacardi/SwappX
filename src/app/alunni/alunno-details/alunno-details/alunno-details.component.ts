import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from 'src/app/_services/alunni.service';

@Component({
  selector: 'app-alunno-details',
  templateUrl: './alunno-details.component.html',
  styleUrls: ['./alunno-details.component.css']
})
export class AlunnoDetailsComponent implements OnInit, AfterViewInit {


  form = this.fb.group({
    nome:['', Validators.required],
    cognome:['', {
      validators: [Validators.required],
      }
    ],
    dtNascita:['', {
      validators: [Validators.required],
      }
    ]
  });

  constructor(private fb: FormBuilder, 
              private route:ActivatedRoute,
              private alunniSvc: AlunniService) {

                let alunnoId = this.route.snapshot.params['id'];
                this.alunniSvc.loadAlunno(alunnoId).subscribe(
                  val=>{
                  console.log (val.dtNascita);
                        this.form = this.fb.group({
                          nome:[val.nome],
                          cognome: [val.cognome],
                          dtNascita: [val.dtNascita]
                        })
                
                  });

  }

  ngOnInit(): void {
    

    //console.log (objAlunno);
  }
  ngAfterViewInit(){

  }

}
