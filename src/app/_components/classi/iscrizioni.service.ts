import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IscrizioniService {

  constructor(private http: HttpClient) { }

  

/*
        // GET: api/CLS_Iscrizioni/ListByClasseSezioneAnno?idClasseSezioneAnno=2
        [Route("[action]")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CLS_Iscrizione>>> ListByClasseSezioneAnno(int pClasseSezioneAnno)
        {
            return await _context.CLS_Iscrizioni
                    .Include(s => s.Stato)
                    .Include(a => a.Alunno)

                    .Where(i => i.ClasseSezioneAnnoID == pClasseSezioneAnno)
                    .ToListAsync();
        }

*/

  listByClasseSezioneAnno(idClasseSezioneAnno: number): Observable <any> {
    //return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByClasseSezioneAnno?idClasseSezioneAnno='+idClasseSezioneAnno);  
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/ListByClasseSezioneAnno/'+idClasseSezioneAnno); 
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByClasseSezioneAnno?idClasseSezioneAnno=5
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/ListByClasseSezioneAnno/5
  }

  getByAlunnoAndClasseSezioneAnno(idClasseSezioneAnno: number, idAlunno: number): Observable <any> {
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/GetAllByAlunnoAndClasseSezioneAnno?idAlunno='+idAlunno+'&idClasseSezioneAnno='+idClasseSezioneAnno);  
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/GetAllByAlunnoAndClasseSezioneAnno?idAlunno=3&idClasseSezioneAnno=1
  }

  getByAlunnoAndAnno(idAnno: number, idAlunno: number): Observable <any> {
    return this.http.get( environment.apiBaseUrl  + 'CLS_Iscrizioni/GetAllByAlunnoAndAnno?idAlunno='+idAlunno+'&idAnno='+idAnno);  
      //http://213.215.231.4/swappX/api/CLS_Iscrizioni/GetAllByAlunnoAndAnno?idAlunno=3&idAnno=1
  }

  post(formData: any): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'CLS_Iscrizioni' , formData);  
  }

  delete(ClasseSezioneAnnoID: number, idAlunno: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_Iscrizioni/DeleteByAlunnoAndClasseSezioneAnno?idAlunno='+idAlunno+'&idClasseSezioneAnno='+ClasseSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CLS_Iscrizioni/DeleteByAlunnoAndClasseSezioneAnno?idAlunno=3&idClasseSezioneAnno=243
  }

      




      
}
