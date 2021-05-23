import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { FiltriService } from './_components/utilities/filtri/filtri.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  public mode = new FormControl('over');
  title = 'SwappX';



  @ViewChild('end') public rightSidenav!: MatSidenav;
  
  constructor( private _filtriService: FiltriService) {}

  ngOnInit () {
    //  this._filtriService.getFiltriAttivi()
    // .subscribe(
    //   val=>{
    //   if (val){
    //     this.rightSidenav.open();
    //   }
    // });
  }

  savePDF() {
    
  }


}
