export const RptLineTemplate1: any = [

	{
		"tipo": "SheetSize",
		"width": 420,
		"heigth": 297,
		"defaultFontName": "TitilliumWeb-Regular",
		"defaultColor":"#C04F94",
		"defaultFontSize":20
	},
	{
		"tipo": "TextData",
		"value": "Documento di Valutazione",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 315,
		"Y": 120,
		"align": "center"
	},
	{
		"tipo": "TextData",
		"value": "Annoscolastico %%objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico%%", //i campi Dati vanno separati prima e dopo con %%
		"X": 315,
		"Y": 130,
		"align": "center" 
	},
	{
		"tipo": "TextData",
		"value": "Alunno",
		"X": 315,
		"Y": 140,
		"fontSize": 14,
		"align": "center" 
	},
	{
		"tipo": "TextData",
		"value": "%%objPagella.iscrizione.alunno.nome%% %%objPagella.iscrizione.alunno.cognome%%",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 315,
		"Y": 150,
		"align": "center" 
	},
	{
		"tipo": "TextData",
		"value": "C.F.%%objPagella.iscrizione.alunno.cf%%",
		"X": 315,
		"Y": 160,
		"fontSize": 16,
		"align": "center" 
	},
	{
		"tipo": "TextData",
//		Utility non funziona "value": "nato a %%objPagella.iscrizione.alunno.comuneNascita%% (%%objPagella.iscrizione.alunno.provNascita%%) il %%Utility.UT_FormatDate2(objPagella.iscrizione.alunno.dtNascita)%%",
		"value": "nato a %%objPagella.iscrizione.alunno.comuneNascita%% (%%objPagella.iscrizione.alunno.provNascita%%) il %%objPagella.iscrizione.alunno.dtNascita%%",

		"X": 315,
		"Y": 168,
		"fontSize": 16,
		"align": "center" 
	},
	{
		"tipo": "Image",
		"value": "logodefViola.png",
		"X": 275,
		"Y": 30,
		"W": 80
	},
	{
		"tipo": "Line",
		"thickness": 0.2,
		"color":"#C04F94",
		"X1": 210,
		"Y1": 10,
		"X2": 210,
		"Y2": 287
	},
	/*
	,
	{
		"tipo": "Rect",
		"thickness": 0,
		"color":"#C04F94",
		"X": 210,
		"Y": 90,
		"W": 90,
		"H": 50,
		"borderRadius":0
	}
	*/
	/*
	,
	{
		"tipo": "Cell",
		"value": "Documento di Valutazione",
		"font": "TitilliumWeb-Regular",
		"X": 220,
		"Y": 100,
		"W": 190,
		"H": 10,
		"color":"#C04F94",
		"lineColor":"#C04F94",
		"lines": 2,
		"align": "center"
	},
	*/
]