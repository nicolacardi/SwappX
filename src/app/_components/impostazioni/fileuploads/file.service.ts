import { Injectable }                           from '@angular/core';
import { HttpClient }                           from '@angular/common/http';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';
import { _UT_File }                             from 'src/app/_models/_UT_File';

@Injectable({
  providedIn: 'root'
})

export class FilesService {

  constructor(private http: HttpClient) { }

  
  get(fileID: any): Observable<_UT_File>{
    return this.http.get<_UT_File>(environment.apiBaseUrl+'_UT_Files/'+fileID);
    //http://213.215.231.4/swappX/api/_UT_Files/1
  }

  getLight(fileID: any): Observable<_UT_File>{
    return this.http.get<_UT_File>(environment.apiBaseUrl+'_UT_Files/GetLight/'+fileID);
    //http://213.215.231.4/swappX/api/_UT_Files/GetLight/1
  }

  list(): Observable<_UT_File[]>{
    return this.http.get<_UT_File[]>(environment.apiBaseUrl+'_UT_Files');
    //http://213.215.231.4/swappX/api/_UT_Files
  }
 
  put(fil: _UT_File): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + '_UT_Files/' + fil.id , fil);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + '_UT_Files' , formData);  
  }

  delete(fileID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + '_UT_Files/' + fileID);    
  }

}
