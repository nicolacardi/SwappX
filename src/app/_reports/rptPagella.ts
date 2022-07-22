export const RptLineTemplate1: any = [

	{
		"tipo": "SheetSize",
		"width": 420,
		"heigth": 297,
		"defaultColor":"#C04F94"
	},
	{
		"tipo": "Text",
		"value": "Documento di Valutazione",
		"font": "TitilliumWeb-SemiBold",
		"X": 315,
		"Y": 120,
		"align": "center"
	},

	{
		"tipo": "Data",
		"value": "objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico",
		"font": "TitilliumWeb-Regular",
		"X": 315,
		"Y": 150,
		"align": "center" 
	},
	{
		"tipo": "TextData",
		"value": "annoscolastico %%objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico%%",
		"font": "TitilliumWeb-Regular",
		"X": 315,
		"Y": 150,
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