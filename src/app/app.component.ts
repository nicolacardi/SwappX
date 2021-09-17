import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  public mode = new FormControl('over');
  title = 'SwappX';



  @ViewChild('end') public rightSidenav!: MatSidenav;
  
  constructor() {}

  ngOnInit () {

  }

  savePDF() {
    
  }


}
