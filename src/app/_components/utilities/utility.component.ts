import { AbstractControl, ValidationErrors } from "@angular/forms";
import { User } from "src/app/_user/Users";

export abstract class Utility {
     

  //AS: verificare se esiste una funzione standard per formattare le chiamate a URL

  public static URL_FormatHour( ora: string ): string{
    
    return ora.replace(":", "%3A").replace(":", "%3A");

    //TODO: usare regex
  }

  ///Formatta una data dal formato al formato [2022-03-17T11:30:00.000Z] al formato [yyyy-mm-dd]
  public static UT_FormatDate( data: any ): string {
    let dtISOLocaleStart = data.toLocaleString('sv').replace(' ', 'T');
    return dtISOLocaleStart.substring(0,10);
  }
  ///Formatta una data dal formato al formato [2022-03-17T11:30:00.000Z] al formato ORA [HH:MM:SS]
  public static UT_FormatHour( data: any ): string {
    let dtISOLocaleStart = data.toLocaleString('sv').replace(' ', 'T');
    return dtISOLocaleStart.substring(11,19);
  }

  
  public static IscrizioneAlunno( classeSezioneAnnoID: number, alunnoID: string){

    /* Check
    - verifica che l'alunno non sia già iscritto ad una classe per l'anno
    - salto anno
    */
    //insert class-sezioni-anni-alunno


  }

  public static CalcoloRette(annoID: number, alunnoID: string){

    //Fratelli


    
  }


  //Utility per comprimere le dimensioni dell'immagine del profilo (o dell'alunno)
  public static compressImage(src: any, newX: number, newY: number) {

    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = document.createElement('canvas');
        const ratio = img.height / img.width;
        elem.width = newX;
        elem.height = newY;
        let posX = 0;
        let posY = 0;
        if (ratio>1) {
          newY = newX*ratio;          //rende il taglio proporzionato
          posY = (newY - newX) /2;    //posiziona il taglio
        } else { 
          newX = newY/ratio;          //rende il taglio proporzionato
          posX = (newX-newY)/2;       //posiziona il taglio
        }
        
        const ctx = elem.getContext('2d');
        ctx!.drawImage(img, -posX, -posY, newX, newY);
        
        const data = ctx!.canvas.toDataURL();
        res(data);
      }
      img.onerror = error =>{ 
        rej(error);
      }
    })
  }

  public static getCurrentUser() : User {
    let obj: any;
    let tmp = localStorage.getItem('currentUser');
    obj = JSON.parse(tmp!) as User;
    return obj;
  }


  public static matchingPasswords(PasswordField : string, ConfirmPasswordField: string) {
    return (controls: AbstractControl) => {
      if (controls) {
        const Password = controls.get(PasswordField)!.value;
        const ConfirmPassword = controls.get(ConfirmPasswordField)!.value;
        //console.log ("check what is passed to the validator", password, confirmPassword);
        if (Password !== ConfirmPassword) { 
          //this is an error set for a specific control which you can use in a mat-error
          controls.get(ConfirmPasswordField)?.setErrors({not_the_same: true});  
          //this is the returned error for the form normally used to disable a submit button
          return {mismatchedPassword: true}  
        }
      }
      return null;
    }
  }

  public static checkIfChangedPasswords(PasswordField : string, NewPasswordField: string) {
    return (controls: AbstractControl) => {
      if (controls) {
        const Password = controls.get(PasswordField)!.value;
        const NewPassword = controls.get(NewPasswordField)!.value;
        //console.log ("check what is passed to the validator", password, confirmPassword);
        if (Password == NewPassword) { 
          //this is an error set for a specific control which you can use in a mat-error
          controls.get(NewPasswordField)?.setErrors({not_changed: true});  
          //this is the returned error for the form normally used to disable a submit button
          return {notChangedPassword: true}  
        }
      }
      return null;
    }
  }



}

  
