
var express = require('express');
var app = express();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('../main.db');
var r = '';

var serialize = require('node-serialize');
var sync = require('synchronize');


app.get('/', function (req, res) {
  res.send('Hello World!');
});

// read functions 
app.get('/getNote/:n', function (req, res) { /// searchText?txt=zuzuka
	var txt = req.param('txt');
	console.log(txt);
	db.all("select N as id,NAME as name,CREATED as created,TXT as txt from nb where n="+req.params.n
	    ,function(err,row){
	console.log(row);
	res.send(row);
	 })
});


app.get('/searchText', function (req, res) { /// searchText?txt=zuzuka
	var txt = req.param('txt');
	console.log(txt);
	db.all("select N as id,NAME as name,CREATED as created from nb "+
	         "  where txt like '%'||'" + txt+ "'||'%'   "+
	   " order by created desc",function(err,row){
	console.log(row);
	res.send(row);
	 })
});


app.get('/getChilds/:up', function (req, res) { // /getChilds/0
	db.all("select N as id,name as name,created as created from nb where UP="+req.params.up,function(err,row){
	 console.log(row);
	res.send(row);
	 })
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

