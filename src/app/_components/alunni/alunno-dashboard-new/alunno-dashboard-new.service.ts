import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlunnoDashboardNewService {


  private AlunnoSubject = new BehaviorSubject<number>(0);
  AlunnoObs$: Observable<number> = this.AlunnoSubject.asObservable();
  
  passAlunno(data: number) {
    console.log("alunno-dashboard-new.service.ts - mi è stato passato un idAlunno");
      this.AlunnoSubject.next(data);
  }

  getAlunno () {
      return this.AlunnoObs$;
  }

}
