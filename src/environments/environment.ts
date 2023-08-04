// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.


export const environment = {
  //production: false,  apiBaseUrl: "http://213.215.231.4/SwappX/api/"
  production: false,  
  apiBaseUrl: "http://213.215.231.4/SwappX/api/"
};

export const tagDocument = {
  TemplateName: "PagellaElementari",
  TagFields:
  [
    { TagName: "AnnoScolastico", TagValue: "2022-23"},

    { TagName: "ComuneNascita", TagValue: "Mestrino"},
    { TagName: "ProvNascita", TagValue: "PD"},
    { TagName: "DtNascita", TagValue: "30/04/1971"},
    { TagName: "Alunno" , TagValue: "Nicola cardi"},
    { TagName: "Classe" , TagValue: "QUINTA"},
    { TagName: "Sezione" , TagValue: "A"},
    { TagName: "ObStoria" , TagValue: "CENNI DI ORGANIZZAZIONE SPAZIO TEMPORALE: ordinare e collocare nel tempo fatti personali ed eventi narrati.</w:t><w:br/><w:t>PRODUZIONE SCRITTA E ORALE: rappresentare gli eventi narrati tramite disegni."},

  ],
  TagTables:
  [
    {
      TagTableTitle: "TblVoti",
      TagTableRows:
      [
        {
          TagFields: 
          [
            { TagName: "Materia", TagValue: "Italiano"},
            { TagName: "Giudizio", TagValue: " Mona "},
          ]
        },
        {
          TagFields: 
          [
            { TagName: "Materia", TagValue: "Matematica"},
            { TagName: "Giudizio", TagValue: " Chi "},
          ]
        },
        {
          TagFields: 
          [
            { TagName: "Materia", TagValue: "Storia"},
            { TagName: "Giudizio", TagValue: " legge "},
          ]
        },
        {
          TagFields: 
          [
            { TagName: "Materia", TagValue: "Scienze"},
            { TagName: "Giudizio", TagValue: "...e chi ha orecchie "},
          ]
        },
        {
          TagFields: 
          [
            { TagName: "Materia", TagValue: "Ginnastica"},
            { TagName: "Giudizio", TagValue: " per intendere "},
          ]
        },
        {
          TagFields: 
          [
            { TagName: "Materia", TagValue: "Orticoltura"},
            { TagName: "Giudizio", TagValue: " IN TENDA "},
          ]
        }
      ]
    },



    {
      TagTableTitle: "TblAlunni",
      TagTableRows:
      [
        {
          TagFields: 
          [
            { TagName: "Nome", TagValue: "Silvan"},
            { TagName: "Cognome", TagValue: " Cangurotto "},
          ]
        },
        {
          TagFields: 
          [
            { TagName: "Nome", TagValue: "Nicola"},
            { TagName: "Cognome", TagValue: " Cardi "},
          ]
        },
        {
          TagFields: 
          [
            { TagName: "Nome", TagValue: "Andrea"},
            { TagName: "Cognome", TagValue: " Svegliado "},
          ]
        },
        {
          TagFields: 
          [
            { TagName: "Nome", TagValue: "Matteo"},
            { TagName: "Cognome", TagValue: " Boribombo "},
          ]
        }
      ]
    }
  ]
}

;



export const A4V = {
  width: 210,  
  height: 297,
  marginleft: 10,
  marginright: 200,
  margintop: 10,
  marginbottom: 287, 
  lineeVert: 22,
  lineeHor: 30
};

export const A3V = {
  width: 297,  
  height: 420,
  marginleft: 10,
  marginright: 287,
  margintop: 10,
  marginbottom: 410,
  lineeVert: 30,
  lineeHor: 42
};

export const A4H = {
  width: 297,  
  height: 210,
  marginleft: 10,
  marginright: 287,
  margintop: 10,
  marginbottom: 200,
  lineeVert: 30,
  lineeHor: 22
};

export const A3H = {
  width: 420,  
  height: 297,
  marginleft: 10,
  marginright: 410,
  margintop: 10,
  marginbottom: 287,
  lineeVert: 42,
  lineeHor: 30
};







export const logoBase64 = "data:image/png;base64,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";



/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.


export const immaginebase = "data:image/png;base64,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";

