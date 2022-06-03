export const RptLineTemplate1: any = [

	{
		"tipo": "SheetSize",
		"width": 420,
		"heigth": 297,
		"defaultColor":"#C04F94",
		"defaultFontType": "TitilliumWeb-Regular",
		"defaultFontSize": 16
	},
	{
		"tipo": "Text",
		"value": "Documento di Valutazione",
		"fontSize": 24,
		"X": 315,
		"Y": 122,
		"align": "center"
	},
	{
		"tipo": "Text",
		"value": "Anno scolastico: %%objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico%%",
		"X": 315,
		"Y": 140,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "Classe %%objPagella.iscrizione?.classeSezioneAnno.classeSezione.classe.descrizione%% %%objPagella.iscrizione?.classeSezioneAnno.classeSezione.sezione%%",
		"X": 315,
		"Y": 150,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "Alunno %%objPagella.iscrizione?.alunno.cognome%% %%objPagella.iscrizione?.alunno.nome%%",
		"color":"#000000",
		"font": "Courier",
		"defaultFontSize": 18,
		"X": 315,
		"Y": 200,
		"align": "center" 
	},
	{
		"tipo": "Rect",
		"thickness": 0.5,
		"color":"#0584E2",
		"X": 260,
		"Y": 190,
		"W": 110,
		"H": 20,
		"borderRadius":2
	},
	{
		"tipo": "Image",
		"value": "logodefViola.png",
		"X": 270,
		"Y": 50,
		"W": 90
	},
	{
		"tipo": "Line",
		"thickness": 0.2,
		"color":"#C04F94",
		"X1": 210,
		"Y1": 10,
		"X2": 210,
		"Y2": 287
	}

]