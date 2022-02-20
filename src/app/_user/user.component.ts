import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.css']
})

export class UserComponent implements OnInit {

  routerPage="";
  
  constructor(    private route: ActivatedRoute ) 
  {
    
  }

  ngOnInit() {

    console.log( this.route.snapshot.paramMap);


    this.route.pathFromRoot[1].url.subscribe(
      val => console.log("VVV",val)
    );

/*
 this.route.queryParams.subscribe(params => {
    this.name = params['name'];
  }); */
     this.route.url.subscribe(
      val=> console.log("URL", val)
    );

    
 

  }

}
