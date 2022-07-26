export const RptLineTemplate1: any = [
	//#########################     IMPOSTAZIONI     #########################
	{
		"tipo": "SheetSize",
		"width": 420,
		"heigth": 297,
		"defaultFontName": "TitilliumWeb-Regular",
		"defaultColor":"#C04F94",
		"defaultFontSize":20,
		"defaultMaxWidth": 190
	},
	{
		"tipo": "Image",
		"value": "logodefViola.png",
		"X": 275,
		"Y": 30,
		"W": 80
	},
	//#########################     COPERTINA     #########################
	{
		"tipo": "Text",
		"value": "Documento di Valutazione",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 315,
		"Y": 120,
		"align": "center"
	},
	{
		"tipo": "Text",
		"value": "Annoscolastico <%objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico%>",
		"X": 315,
		"Y": 130,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "Alunno",
		"X": 315,
		"Y": 140,
		"fontSize": 14,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "<%objPagella.iscrizione.alunno.nome%> <%objPagella.iscrizione.alunno.cognome%>",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 315,
		"Y": 150,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "C.F.<%objPagella.iscrizione.alunno.cf%>",
		"X": 315,
		"Y": 160,
		"fontSize": 16,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "nato a <%objPagella.iscrizione.alunno.comuneNascita%> (<%this.rptPagella.iscrizione.alunno.provNascita%>) il <%this.FormatDate(objPagella.iscrizione.alunno.dtNascita, 'dd/mm/yyyy')%>",
		"X": 315,
		"Y": 168,
		"fontSize": 16,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "La donzelletta vien dalla campagna in sul calar del sol omnia gallia in tres partes divisa est faccio la prova con un testo lungo per vedere cosa accade e se va a capo come deve",
		"X": 315,
		"Y": 188,
		"fontSize": 16,
		"align": "center" ,
		"maxWidth": 100
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
	//#########################    PAGINA 2 E 3    #########################
	{
		"tipo": "Page"
	},
	{
		"tipo": "Image1__",
		"value": "logodefViola.png",
		"X": 10,
		"Y": 10,
		"W": 30
	},
	{
		"tipo": "Image1___",
		"value": "logodefViola.png",
		"X": 380,
		"Y": 10,
		"W": 30
	},
	{
		"tipo": "Text",
		"value": "- PRIMO QUADRIMESTRE -",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 105,
		"Y": 25,
		"fontSize": 16,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "- SECONDO QUADRIMESTRE -",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 315,
		"Y": 25,
		"fontSize": 16,
		"align": "center" 
	},

	{
		"tipo": "Text",
		"value": "- SECONDO QUADRIMESTRE -",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 315,
		"Y": 25,
		"fontSize": 16,
		"align": "center" 
	}



	 
]










	/*
	{
		"tipo": "Text",
		"value": "Campo data: <%FormatDate(objPagella.dtIns, 'dd/mm/yyyy')%>",
		"X": 315,
		"Y": 175,
		"fontSize": 14,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "FormatNumber: <%FormatNumber(objPagella.periodo, 3)%>",
		"X": 315,
		"Y": 180,
		"fontSize": 12,
		"align": "center" 
	},
	*/

	/*
	{
		"tipo": "Rect",
		"thickness": 0,
		"color":"#C04F94",
		"X": 210,
		"Y": 90,
		"W": 90,
		"H": 50,
		"borderRadius":0
	},*/
	// {
	// 	"tipo": "Cell",
	// 	"value": "Documento di Valutazione",
	// 	"font": "TitilliumWeb-Regular",
	// 	"X": 220,
	// 	"Y": 100,
	// 	"W": 190,
	// 	"H": 10,
	// 	"color":"#C04F94",
	// 	"lineColor":"#C04F94",
	// 	"lines": 2,
	// 	"align": "center"
	// },