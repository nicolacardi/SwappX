import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { _UT_MailMessage } from 'src/app/_models/_UT_MailMessage';
import { environment }                          from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private http: HttpClient) { }

  //public inviaMail (emailAddress: string, testoMail: string, titoloMail: string)  {
  public inviaMail (mail: _UT_MailMessage)  {

    //va trasformata in una post (per inviare un html) e per farlo bisgona intervenire anche sul WS in quanto devo passare diverse cose che vanno poi estratte da un formData

    //const encodedEmailAddress = encodeURIComponent(emailAddress);
    //const url = `${environment.apiBaseUrl}mail/sendEmail/${encodedEmailAddress}`;
    //console.log ("url", url);
    //this.http.get(url)

    //this.http.get(environment.apiBaseUrl+'mail/sendEmail/'+emailAddress+'/'+testoMail+'/'+titoloMail)
    this.http.post(environment.apiBaseUrl+'mail/sendEmail', mail)

    .subscribe(res => {
      console.log (res)
    });

    //http://213.215.231.4/swappX/api/mail/sendEmail/nicola.cardi@gmail.com
 
  }







}
