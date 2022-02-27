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


  list(): Observable<CLS_ClasseDocenteMateria[]>{
    return this.http.get<CLS_ClasseDocenteMateria[]>(environment.apiBaseUrl+'CLS_ClassiDocentiMaterie');
    //http://213.215.231.4/swappX/api/CLS_ClassiDocentiMaterie
  }

  listByClasseSezioneAnno(id: number): Observable<CLS_ClasseDocenteMateria[]>{
    return this.http.get<CLS_ClasseDocenteMateria[]>(environment.apiBaseUrl+'CLS_ClassiDocentiMaterie/ListByClasseSezioneAnno/'+id);
    //http://213.215.231.4/swappX/api/CLS_ClassiDocentiMaterie/ListByClasseSezioneAnno/16
  }

  //MANCA WS
  getByClasseAndMateriaAndDocente(idClasseSezioneAnno: number, idMateria: number, idDocente: number): Observable <CLS_ClasseDocenteMateria> {
    return this.http.get <CLS_ClasseDocenteMateria>( environment.apiBaseUrl  + 'CLS_ClassiDocentiMaterie/getByClasseAndMateriaAndDocente?idClasseSezioneAnno='+idClasseSezioneAnno+'&idMateria='+idMateria+'&idDocente='+idDocente);  
      //http://213.215.231.4/swappX/api/CLS_ClassiDocentiMaterie/GetByAlunnoAndClasseSezioneAnno?idClasseSezioneAnno=3&idMateria=1&idDocente=1
  }

  //MANCA WS
  getByClasseAndMateria(idClasseSezioneAnno: number, idMateria: number): Observable <CLS_ClasseDocenteMateria> {
    return this.http.get <CLS_ClasseDocenteMateria>( environment.apiBaseUrl  + 'CLS_ClassiDocentiMaterie/getByClasseAndMateriaAndDocente?idClasseSezioneAnno='+idClasseSezioneAnno+'&idMateria='+idMateria);  
      //http://213.215.231.4/swappX/api/CLS_ClassiDocentiMaterie/GetByAlunnoAndClasseSezioneAnno?idClasseSezioneAnno=3&idMateria=1
  }


  loadPersona(id: any): Observable<CLS_ClasseDocenteMateria>{
    return this.http.get<CLS_ClasseDocenteMateria>(environment.apiBaseUrl+'CLS_ClassiDocentiMaterie/'+id);
    //http://213.215.231.4/swappX/api/CLS_ClassiDocentiMaterie/4
  }

  put(formData: any): Observable <any>{
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
