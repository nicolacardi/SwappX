import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent implements OnInit {

  constructor(public _dialog:         MatDialog,) { }

  ngOnInit(): void {
  }

  stampa() {
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "CURIOSO!", sottoTitolo: "Abbi pazienza!"}
    });
  }

  scarica() {
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "TE GO DITO CHE TE SI' CURIOSO!", sottoTitolo: "proprio impaziente eh!"}
    });
  }

  email() {
    this._dialog.open(DialogOkComponent, {
      width: '320px',
      data: {titolo: "MOEGHEA!", sottoTitolo: "insomma!"}
    });
  }

}
