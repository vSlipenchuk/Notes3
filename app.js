
/*
   Note3 nodejs server
   
   install: 
      npm install express --save
      npm install sqlite3 --save
      npm install node-serialize --save
      
      
   Basic Auth: https://habrahabr.ru/post/201924/
      npm install express-basic-auth --save
      https://www.npmjs.com/package/express-basic-auth
   
      
*/

var dbpath="../remote.db";

var express = require('express');
var app = express();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbpath);
var r = '';

var serialize = require('node-serialize');
//var basicAuth = require('express-basic-auth')

var basicAuth = require('basic-auth-connect');
app.use(basicAuth('username', 'password'));

//var sync = require('synchronize');

//app.use(express.basicAuth('adm', 'mypass'));

/*app.use(basicAuth({
    users: {
        'adm': 'mysecret',
        'adam': 'password1234',
        'eve': 'asdfghjkl'
    }
}))


app.use(function(req, res, next) {
    var user = auth(req);

    if (user === undefined || user['name'] !== 'username' || user['pass'] !== 'password') {
        res.writeHead(401, 'Access invalid for user', {'Content-Type' : 'text/plain'});
        res.end('Invalid credentials');
    } else {
        next();
    }
});*/


app.get('/', function (req, res) {
  res.send('Hello World!');
});

//write functions 
app.get('/renameNote', function (req, res) { /// renameNote?txt=zuzuka
	var p = { $n:req.param('n'), $txt:req.param('txt')};
	if (p.$n && p.$txt) {
		var st = db.prepare("update nb set NAME=$txt where n=$n");
		console.log("PREPARED OK");
		st.run(p, function (err) {
			if (err) res.send("00");
			 else res.send("01");
			})
		}
	else res.send("-1");
});

app.get('/addNote', function (req, res) { /// renameNote?up=0&name=newOne
	var p = { $up:req.param('up'), $txt:req.param('name')};
	
	db.all("select max(N)+1 as n  from nb"  ,function(err,row){
		p.$n = row[0].n;
		console.log("here NEW N n="+p.$n);
			if (p.$n && p.$txt) {
		var st = db.prepare("insert into nb(N,UP,NAME) values($n,$up,$txt)");
		console.log("PREPARED INSERT TXT="+p.$txt);
		st.run(p, function (err) {
			if (err) res.send("00");
			 else res.send("01");
			})
 		}
   	else res.send("-1");

		
	 });
	
});

app.get('/saveNoteText', function (req, res) { /// renameNote?txt=zuzuka
	var p = { $n:req.param('n'), $txt:req.param('txt')};
	if (p.$n && p.$txt) {
		var st = db.prepare("update nb set TXT=$txt where n=$n");
		console.log("PREPARED OK TXT="+p.$txt);
		st.run(p, function (err) {
			if (err) res.send("00");
			 else res.send("01");
			})
		}
	else res.send("-1");
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
  console.log('Example app listening on port 3000  for db='+dbpath);
});

