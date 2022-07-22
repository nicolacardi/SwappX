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
		"font": "TitilliumWeb-Regular",
		"X": 100,
		"Y": 100,
		"align": "center"
	},
	{
		"tipo": "Data",
		"value": "objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico",
		"font": "TitilliumWeb-Regular",
		"X": 210,
		"Y": 150,
		"align": "center" 
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
	},
	{
		"tipo": "Rect",
		"thickness": 1,
		"color":"#C04F94",
		"X": 110,
		"Y": 50,
		"W": 50,
		"H": 50,
		"borderRadius":5
	},
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
]