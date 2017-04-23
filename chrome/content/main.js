

//<script type="application/x-javascript" src="sqlite.js" />
//<script type="application/x-javascript" src="main.js" />

// UTILS

function $$(id) { return document.getElementById(id)}; // shortcut

var prefManager = null; // cashed pref manager

function prefGet(name,defvalue) { // get prefvalue of returns def
try {
if (!prefManager) prefManager = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefBranch);
return prefManager.getCharPref( name );
} catch(ex) {}
return defvalue;
}

function prefSet(name,val) { // set pref value, returns boolean
try {
	if (!prefManager) prefManager = Components.classes["@mozilla.org/preferences-service;1"]
	                                .getService(Components.interfaces.nsIPrefBranch);
	prefManager.setCharPref( name,val );
	return true;
	} catch(ex) {alert(ex);}
return false;
}

// -- UTILS



var Nb; // Notabene object
var Nt; // Notebene tree object

var nbdb;
var Obj; // selected object

var DB="main.db"; // list of databases, devided by ':', can be passed via command line -db <name>
var HTTP=""; // no HTTP connectors

function openFindWindow() { // loads in a new window
	//alert("Try open");
var par=[Nb]; // parameters
	/*
par.tbl='nb'; // My Table in it
par.N=N; // First Element = Load This Document
par.ok=0;
par.nb = nb;
par.nb.db = nb.db; // default db - get it from nb
	*/
var w = window.openDialog("chrome://myapp/content/findForm.xul",
      "findWindow",
      "chrome, resizable, centerscreen, dialog",
      par);
}


 function d2(s) { if (s<10) return "0"+s; return ""+s;} // enusure 01 in month and day
 
function openToday() { // Navigate <first_src>/cal/YYYY/MM/DD 
 	var D = new Date();
	//alert(D);	alert(Nb.nbName(0));
	var p = '/'+Nb.nbName(0)+'/cal/'+D.getFullYear()+'/'+d2(D.getMonth()+1)+'/'+d2(D.getDate());
 //alert("Path to be:"+p);
	// now - test auto create
	
	if ( !Nt.setPath(p) ) 
	  if (confirm("Create path: "+p+"?"))
	    Nt.setPath(p,1); // auto create	
}

function doCmdLine() { // handle command line parameters
     var cmdLine = window.arguments[0];
     cmdLine = cmdLine.QueryInterface(Components.interfaces.nsICommandLine);
     var db =  cmdLine.handleFlagWithParam("db", false);
          if (db) DB=db; if (db=="null") DB="";
     db =  cmdLine.handleFlagWithParam("http", false);
	//alert(db);
     if (db) HTTP=db; if (db == "null") HTTP="";
     //alert("db:"+db);
}




function doClose() {
var w;
	w = $$("main"); // main window
	prefSet("win",""+w.width+","+w.height);
	//alert(p);

	//alert( document.title );
	//alert( window.title );
	//alert( window.width );
	//alert("closing");
	//p = window.width;
	//alert(p);
	//prefSet("w", p);
	window.close();
}

function doRefresh() {
 Nt.refreshChilds(Obj);	
}

function setStatusText(txt) {
document.getElementById('statusText').label=txt;
}

function onTreeSelect(obj) { // obj.id obj.name -> attributes
Obj = obj; // remember me
	//setStatusText(  );
	//alert(Obj);
	//alert(obj.data.id);
var txt = document.getElementById('nbText');
if (obj.data.txt) txt.value = obj.txt; // statically located text
	else  txt.value = obj.data.nb.getNote(obj.data.id).txt;

	//alert('begin pobj for Obj.name='+Obj.data.name);
//var pobj = Nt.getParentObject( Obj ) ;	
	//alert("pobj="+pobj);
//	if (pobj) alert(pobj.data.name);
var path = Nt.getPath(Obj);
	
	document.title = path;
 setStatusText ( 'created:'+obj.data.created+' id:'+obj.data.id+'  path:\''+path+'\'' );
	//path=escape(path);
	//alert( path) ;
	//alert(toString(path).escape());
 prefSet('path', escape(path) ) ;// save last opened
	
//txt.value = obj.txt;
	 //alert(obj);
  //alert('selected id='+obj.data.id+' and name='+obj.data.name);	
}

function doSaveCurrentText() {
var txt = document.getElementById('nbText');
	//alert("Saving!");

if ( Obj.data.nb.saveNoteText( Obj.data.id, txt.value) ) {  // save to database !
	//alert("Saved OK");
   }

}

function renameCurrentNote() {
var name;
	//alert("Renaming here!");
	if (!Obj) return;
	//alert("Obj="+Obj);
	if (Obj.data.ro) { alert("Object is read-only"); return ;}
	//alert("Obj.name="+Obj.data.name);
name = Obj.data.name;
name = prompt("Change name ID="+Obj.data.id,name);
if (!name) return ;
  var p = Nt.getPath(Obj); 
	
var ok = Obj.data.nb.renameNote( Obj.data.id, name);
	
	Nt.refreshChilds (  Nt.getParentObject ( Obj )  ) ; // refresh nodes
//alert("OK changed!");
	
	Nt.setPath ( p); //.split('/').slice(1) ); // set path again
	
}

function addChildNote() {
var name;
	//alert("Renaming here!");
	if (!Obj) return;
	//alert("Obj="+Obj);
	if (!Obj.data.nb) { alert("No database here"); return ;}
	//alert("Obj.name="+Obj.data.name);
	
var p = Nt.getPath(Obj); 
	
name = Obj.data.name;
name = prompt("Adding child for name ID="+Obj.data.id+" name="+name,'');
if (!name) return ;
  
var ok = Obj.data.nb.addNote( Obj.data.id, name); 

	Nt.refreshChilds (  Nt.getParentObject ( Obj )  ) ; // refresh nodes
	//alert("OK changed!"); // need refresh parent?

p = p+'/'+name;
	Nt.setPath ( p); //.split('/').slice(1) ); // access it to focus
	
	
}

function fileSelfName(path) {
var p = path.split('/'); 
path = p[ p.length-1 ]; // last chunk
 p = path.split('\\');
path = p[ p.length-1]; // win chunk
return path;
}

function fileExists(aPath){
  try {
    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
    var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(aPath);
    return file.exists();
  } catch(ex) {
    return false;
  }
return false;
}

function getCWD() { // Current Working Directory
var path = Components.classes["@mozilla.org/file/directory_service;1"]
             .getService(Components.interfaces.nsIProperties)
             .get("CurProcD", Components.interfaces.nsIFile).path;
return path; // 	alert("CurProcD:"+path);
}

function doTest2() {
	DB=''; // no database storages
	var dbname="localhost:3000";
	var name = "localhost";
	var 	nbdb = new nbHttp(dbname,0,"localhost"); 	
		if (!nbdb.init()) {
			alert("init db failed: "+dbname);
		
		} 
	else   Nb.attachStore( name , nbdb, 0  ); // change signature
	
}

function doTest() { // test call search window
	//openFindWindow(); 	doSearchText('Hello',100);
	//openToday(); // do it - OK
	//doCmdLine();
	
}

function doInit() {
	
	Nb = new Notabene();
	
	doCmdLine(); // process updating 
	
	//var profilePath = require('sdk/system').pathFor('ProfD'); 	alert(profilePath);
	//var p = chromeToPath("newname");
	//mkfile();
	//alert("OK:"+fileExists('/prj/Notes3/test2.db'));
	
	//doTest2();
	
	var db = DB.split(';') ;
	var cwd = getCWD(); // extract current dir
	//alert("CWD="+cwd);
	var i=0; if (DB) for(i=0;i<db.length;i++) {
	 	var dbname=db[i];
		var name = fileSelfName(dbname);
		//alert("SelfName="+name);
		//alert(dbname[0]);
		if ((dbname[0]!='/') && (dbname[1]!=':')) { // path not absolute - correct it
		   //alert("Try autocorrect path:"+dbname);
		   if (fileExists(cwd+'/'+dbname)) dbname = cwd+'/'+dbname; // check current
		     else if (fileExists(cwd+'/../'+dbname)) dbname = cwd+'/../'+dbname; // check upper
		       else {
			 alert("Cant locate:"+dbname); // create new ?
			 continue;
		         }
		   }
	        //alert("Loading DB"+dbname+" alias="+name);
	        nbdb = new nbSqlite(dbname,0,name); 	
		if (!nbdb.init()) {
			alert("init db failed: "+dbname);
			continue;
		} else   Nb.attachStore( name , nbdb, 0  ); // change signature
		
	        }
		
		
        db=HTTP.split(';');
	//var dbname="localhost:3000";
	//var name = "localhost";
		
	if  (HTTP!='') { 
		alert("HTTP="+HTTP);
	var dbname=HTTP;
	var name=dbname;
	var 	nbdb = new nbHttp(dbname,0,name); 	
		if (!nbdb.init()) {
			alert("init db failed: "+dbname);
		
		} 
	else   Nb.attachStore( name , nbdb, 0  ); // change signature
	}
	
	//nbdb = new nbSqlite('/prj/Notes3/test.db',0,"test.db"); 	nbdb.init();
	        //Nb.attachStore( 'main.db', nbdb, 0  ); // change signature
	
	//nbdb = new nbSqlite('/prj/Notes3/test2.db',0,"test2.db"); 	nbdb.init();
	//Nb.attachStore( 'test2.db', nbdb, 0  ); // change signature
	
	//var n = Nb.getChilds( 0, 0); alert(n); // check it?

	// создаем дерево
    Nt = new NotebeneTree( Nb, document.getElementById('nbTree'), onTreeSelect ); // new tree
    Nt.init( );
	
	// восстанавливаем открытую вкладку...
        var path = prefGet('path'); 	
	var p = unescape(path); //.split('/').slice(1);
	if (path) Nt.setPath( p ); 
	
	// восcтанавливаем размеры
	var  sz = prefGet("win");  sz=sz.split(',');
	$$('main').width=sz[0]; $$('main').height=sz[1];
	// center window
	var w=(screen.availWidth/2)-(document.getElementById('main').width/2);
        var h=(screen.availHeight/2)-(document.getElementById('main').height/2);
        window.moveTo(w,h);

        if (doTest) doTest();

  }

//testclick();
  
  
setTimeout( testclick, 0);
