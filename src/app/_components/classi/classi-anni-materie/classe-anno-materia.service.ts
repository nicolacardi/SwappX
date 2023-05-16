import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CLS_ClasseAnnoMateria } from 'src/app/_models/CLS_ClasseAnnoMateria';

@Injectable({
  providedIn: 'root'
})

export class ClasseAnnoMateriaService {

  constructor(private http: HttpClient) { }

  get(classeAnnoMateriaID: any): Observable<CLS_ClasseAnnoMateria>{
    return  this.http.get<CLS_ClasseAnnoMateria>(environment.apiBaseUrl+'CLS_ClassiAnniMaterie/'+classeAnnoMateriaID);
    //http://213.215.231.4/swappX/api/CLS_ClassiAnniMaterie/1
  } 

  duplicaClassiAnniMaterie (annoIDFrom: number, annoIDTo: number) {
    let formData = {};

    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiAnniMaterie/DuplicaClassiAnniMaterie/' + annoIDFrom + '/' + annoIDTo, formData);
  //http://213.215.231.4/SwappX/api/CLS_ClassiAnniMaterie/DuplicaClassiAnniMaterie/2/3
  }

  list(): Observable<CLS_ClasseAnnoMateria[]>{
    return this.http.get<CLS_ClasseAnnoMateria[]>(environment.apiBaseUrl+'CLS_ClassiAnniMaterie');
    //http://213.215.231.4/swappX/api/CLS_ClassiAnniMaterie
  }


  
  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CLS_ClassiAnniMaterie/' + formData.id , formData);  
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiAnniMaterie' , formData);  
  }

  delete(classeAnnoMateriaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_ClassiAnniMaterie/' + classeAnnoMateriaID);    
  }



}
