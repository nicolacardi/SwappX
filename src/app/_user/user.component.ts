import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.css']
})

export class UserComponent implements OnInit {

  routerPage!: string;
  
  constructor()  {
  }

  ngOnInit() {
    const str = window.location.href;
    const lastUrlSegment= str.split('?')[0].split('/').pop();
    this.routerPage =lastUrlSegment!;
  }

}
