import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { environment }                          from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private http: HttpClient) { }

  public inviaMail (emailAddress: string, testoMail: string, titoloMail: string)  {

    //const encodedEmailAddress = encodeURIComponent(emailAddress);
    //const url = `${environment.apiBaseUrl}mail/sendEmail/${encodedEmailAddress}`;
    //console.log ("url", url);
    //this.http.get(url)

    this.http.get(environment.apiBaseUrl+'mail/sendEmail/'+emailAddress+'/'+testoMail+'/'+titoloMail)
    
    .subscribe(res => {
      console.log (res)
    });

    //http://213.215.231.4/swappX/api/mail/sendEmail/nicola.cardi@gmail.com
 
  }

}
