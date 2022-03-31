import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CLS_ClasseDocenteMateria } from 'src/app/_models/CLS_ClasseDocenteMateria';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassiDocentiMaterieService {

  constructor(private http: HttpClient) { }


  // list(): Observable<CLS_ClasseDocenteMateria[]>{
  //   return this.http.get<CLS_ClasseDocenteMateria[]>(environment.apiBaseUrl+'CLS_ClassiDocentiMaterie');
  //   //http://213.215.231.4/swappX/api/CLS_ClassiDocentiMaterie
  // }

  listByClasseSezioneAnno(classeSezioneAnnoID: number): Observable<CLS_ClasseDocenteMateria[]>{
    return this.http.get<CLS_ClasseDocenteMateria[]>(environment.apiBaseUrl+'CLS_ClassiDocentiMaterie/ListByClasseSezioneAnno/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CLS_ClassiDocentiMaterie/ListByClasseSezioneAnno/16
  }

  get(id: any): Observable<CLS_ClasseDocenteMateria>{
    return this.http.get<CLS_ClasseDocenteMateria>(environment.apiBaseUrl+'CLS_ClassiDocentiMaterie/'+id);
    //http://213.215.231.4/swappX/api/CLS_ClassiDocentiMaterie/4
  }
  
  getByClasseSezioneAnnoAndMateria(idClasseSezioneAnno: number, idMateria: number): Observable <CLS_ClasseDocenteMateria> {
    return this.http.get <CLS_ClasseDocenteMateria>( environment.apiBaseUrl  + 'CLS_ClassiDocentiMaterie/GetByClasseSezioneAnnoAndMateria?idClasseSezioneAnno='+idClasseSezioneAnno+'&idMateria='+idMateria);  
      //http://213.215.231.4/swappX/api/CLS_ClassiDocentiMaterie/GetByClasseSezioneAnnoAndMateria?idClasseSezioneAnno=16&idMateria=4
  }

  getByClasseSezioneAnnoAndMateriaAndDocente(idClasseSezioneAnno: number, idMateria: number, idDocente: number): Observable <CLS_ClasseDocenteMateria> {
    return this.http.get <CLS_ClasseDocenteMateria>( environment.apiBaseUrl  + 'CLS_ClassiDocentiMaterie/GetByClasseSezioneAnnoAndMateriaAndDocente?idClasseSezioneAnno='+idClasseSezioneAnno+'&idMateria='+idMateria+'&idDocente='+idDocente);  
      //http://213.215.231.4/swappX/api/CLS_ClassiDocentiMaterie/GetByClasseSezioneAnnoAndMateriaAndDocente?idClasseSezioneAnno=16&idMateria=4&idDocente=3
  }



  put(formData: any): Observable <any>{
    console.log ("formData put", formData);
    return this.http.put( environment.apiBaseUrl  + 'CLS_ClassiDocentiMaterie/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    console.log ("formData service", formData);
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiDocentiMaterie' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_ClassiDocentiMaterie/' + id);    
  }



}
