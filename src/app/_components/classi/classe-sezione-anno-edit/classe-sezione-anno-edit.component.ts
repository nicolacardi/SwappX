import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-classe-sezione-anno-edit',
  templateUrl: './classe-sezione-anno-edit.component.html',
  styleUrls: ['./../classi.css']
})
export class ClasseSezioneAnnoEditComponent implements OnInit {

  form! :                     FormGroup;
  emptyForm :                 boolean = false;
  breakpoint!:                number;
  
  constructor( @Inject(MAT_DIALOG_DATA) public idClasseSezioneAnno: number,
                private fb:                  FormBuilder, ) { 

    this.form = this.fb.group({
      id:                         [null],
      classeID:                   ['', Validators.required],
      sezione:                    ['', Validators.required],
      annoID:                     ['', Validators.required],
      classeSezioneAnnoSucc:      ['', Validators.required],


    });

  }

  ngOnInit(): void {
  }

  loadData(){}

  save(){}

  delete(){}
}
