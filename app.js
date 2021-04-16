const express = require("express")
var app = express()
const cookie = require("cookie-parser")

app.use(cookie(process.env.SECRET || "testSecret"))

const port = process.env.PORT || 8080


app.set('view engine', 'ejs');
app.use(express.static(__dirname+"/public"))
app.use('/build/', express.static(__dirname+'/node_modules/three/build'));
app.use('/exemples/', express.static(__dirname+'/node_modules/three/examples/jsm'));

app.get("",(req,res)=>{
	var lang = "en"
	if(req.cookies.lang){
		lang = req.cookies.lang
	}
	res.render("index.ejs",{lang:lang})
})

app.get("/fr",(req,res)=>{
	res.cookie("lang","fr")
	res.render("index.ejs",{lang:"fr"})
})

app.get("/en",(req,res)=>{
	res.cookie("lang","en")
	res.render("index.ejs",{lang:"en"})
})


app.listen(port,()=>{
	console.log("Le serveur fonctionne sur ",port)
})