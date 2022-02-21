import { AbstractControl, ValidationErrors } from "@angular/forms";
import { User } from "src/app/_user/Users";

export abstract class Utility {
     

  public static IscrizioneAlunno( idClasseSezioneAnno: number, idAlunno: string){

    /* Check
    - verifica che l'alunno non sia già iscritto ad una classe per l'anno
    - salto anno
    */
    //insert class-sezioni-anni-alunno


  }

  public static CalcoloRette(idAnnoScolastico: number, idAlunno: string){

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
    var obj: any;
    var tmp = localStorage.getItem('currentUser');
    obj = JSON.parse(tmp!) as User;
    return obj;
  }


  public static matchingPasswords(Password: string, ConfirmPassword: string) {
    return (controls: AbstractControl) => {
      if (controls) {
        const Password = controls.get('Password')!.value;
        const ConfirmPassword = controls.get('ConfirmPassword')!.value;
        //console.log ("check what is passed to the validator", password, confirmPassword);
        if (Password !== ConfirmPassword) { 
          //this is an error set for a specific control which you can use in a mat-error
          controls.get('ConfirmPassword')?.setErrors({not_the_same: true});  
          //this is the returned error for the form normally used to disable a submit button
          return {mismatchedPassword: true}  
        }
      }
      return null;
    }
  }



}

  
