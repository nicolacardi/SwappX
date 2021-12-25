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


}

  
