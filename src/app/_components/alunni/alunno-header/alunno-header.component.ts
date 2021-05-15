import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { AlunniService } from 'src/app/_services/alunni.service';

@Component({
  selector: 'app-alunno-header',
  templateUrl: './alunno-header.component.html',
  styleUrls: ['./alunno-header.component.css']
})
export class AlunnoHeaderComponent implements OnInit {

formHeaderAlunno! :  FormGroup;
alunno!: Observable<ALU_Alunno>;

@Input()
idAlunno!: number;

  constructor( private fb:     FormBuilder,
               private alunniSvc:   AlunniService) {


        this.formHeaderAlunno = this.fb.group({
          id:                         [null],
          nome:                       [''],
          cognome:                    ['']

        })
  }

  ngOnInit() {
    const obsAlunno$: Observable<ALU_Alunno> = this.alunniSvc.loadAlunno(this.idAlunno);
    this.alunno = obsAlunno$
    .pipe(
        //tap(
        //  alunno => this.formHeaderAlunno.patchValue(alunno)
        //),
        tap(
          val => console.log(val)
        )
    );
  }

}
