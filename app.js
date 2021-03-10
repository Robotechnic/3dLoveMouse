const express = require("express")
var app = express()

app.set('view engine', 'ejs');
app.use(express.static(__dirname+"/public"))
app.use('/build/', express.static(__dirname+'/node_modules/three/build'));
app.use('/exemples/', express.static(__dirname+'/node_modules/three/examples/jsm'));

app.get("",(req,res)=>{
	res.render("index.ejs")
})



app.listen(8080)