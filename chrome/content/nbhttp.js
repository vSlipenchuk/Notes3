/*
   notabene http requester by default works with a table NB like this
   
   server must implements requests 
   
/getChilds/:up
/getNote/:n
/searchText?txt=<mytext>




*/


function nbHttp(_path,_up,_name) { // database file name, root connection name of this db
var nb = {
    name:_name,
    path:_path,
    up:_up,
    init:function() {	    
	    if (!this.name) this.name = this.path;
	    //if (this.path.substr( corrent to http/s:// ?
	    //this.db = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
	    return true;
	    },
    renameNote:function (id, name) {
	    var db = this.db;
	    alert("rename id="+id+" to name ="+name);
	    if (db.execSQL ('update nb set name=?2 where n=?1',id,name)) {
	       alert("exec OK!");
	       } else alert("exec failed");
	    
            },
    addNote:function (up, name, txt) {
	    var db = this.db;
	    var n = db.nextN('nb');
	    if (!txt) txt = "";
	    alert("adding new up="+up+" to name ="+name+' as N='+n);
	    if (db.execSQL('insert into nb(N,UP,NAME,TXT) values(?1,?2,?3,?4)',n,up,name,txt)) {
	       alert("exec OK!");
	       } else alert("exec failed");
	    },
     saveNoteText:function(id,txt) {
	     alert("save note text="+id+" text="+txt);
	    return  this.db.execSQL('update nb set txt=?2 where n=?1',id,txt ) ;
     },
    getNote:function(id) { // get note detail
	    var t = this.wget('getNote/'+id);
	    if (!t) return t;
	    return t[0];
    },
    searchText:function(txt,limit) {
	    return this.wget('searchText?txt='+txt);
    },
    wget:function(url) {
    var ex;
	try {
	    var request = new XMLHttpRequest();
            request.open('GET', 'http://'+this.path+'/'+url, false);  // `false` makes the request synchronous
            request.send(null);
	    if (request.status != 200) return []; // error
	         var t=request.responseText;
		 var obj = JSON.parse( t ) ;
		var i; for(i=0;i<obj.length;i++) { obj[i].nb=this;} // set self
	        return obj;
	    } catch(ex) { alert('http_ex:'+ex);}
    return null; // on error	    
	
    },
    getChilds:function (up)  {
	return this.wget('getChilds/'+up);
   }
   };
return nb;
}