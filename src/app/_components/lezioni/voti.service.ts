import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

import { TST_Voto }                         from 'src/app/_models/TST_Voti';


@Injectable({
  providedIn: 'root'
})
export class VotiService {

  constructor(private http: HttpClient) { }
  
  list(): Observable<TST_Voto[]>{
    return this.http.get<TST_Voto[]>(environment.apiBaseUrl+'TST_Voti');
    //http://213.215.231.4/swappX/api/TST_Voti
  }

  listByLezione(lezioneID: number): Observable<TST_Voto[]>{
    return this.http.get<TST_Voto[]>(environment.apiBaseUrl+'TST_Voti/ListByLezione/'+lezioneID);
    //http://213.215.231.4/swappX/api/TST_Voti/ListByLezione/975
  }

  listByAlunno(alunnoID: number): Observable<TST_Voto[]>{
    return this.http.get<TST_Voto[]>(environment.apiBaseUrl+'TST_Voti/ListByAlunno/'+alunnoID);
    //http://213.215.231.4/swappX/api/TST_Voti/ListByAlunno/3
  }


  get(votoID: any): Observable<TST_Voto>{
    return this.http.get<TST_Voto>(environment.apiBaseUrl+'TST_Voti/'+votoID);
    //http://213.215.231.4/swappX/api/TST_Voti/3
  }
  
  post(voto: TST_Voto): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'TST_Voti' , voto);  
  }
  
  put(voto: TST_Voto): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'TST_Voti/' + voto.id , voto);    
  }

  deleteByLezione(lezioneID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TST_Voti/DeleteByLezione/' + lezioneID); 
  //http://213.215.231.4/swappX/api/TST_Voti/DeleteByLezione/975

  }

  delete(votoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TST_Voti/' + votoID); 
  }
}
