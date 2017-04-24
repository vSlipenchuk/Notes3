/*
   notabene http requester by default works with a table NB like this
   
   server must implements requests 
   
/getChilds/:up
/getNote/:n
/searchText?txt=<mytext>




*/


function nbHttp(_path,_up,_name,_username,_password) { // database file name, root connection name of this db
var nb = {
    name:_name,
    path:_path,
    up:_up,
    username:_username,
    password:_password,
    init:function() {	   
	    if (!this.name) this.name = this.path;
	    //if (this.path.substr( corrent to http/s:// ?
	    //this.db = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
	    return true;
	    },
    renameNote:function (id, name) {
	     //alert('renameNote?n='+id+'&txt='+name);
	     return this.wget('renameNote?n='+id+'&txt='+encodeURIComponent(name));
            },
    addNote:function (id, name) {
	     return this.wget('addNote?up='+id+'&name='+encodeURIComponent(name));
            },
    saveNoteText:function(id,txt) {
	    //alert('Save :saveNoteText?n='+id+"&txt="+encodeURIComponent(txt));
	     return this.wget('saveNoteText?n='+id+"&txt="+encodeURIComponent(txt));	    
     },
    getNote:function(id) { // get note detail
	    var t = this.wget('getNote/'+id);
	    if (!t) return t;
	    //t.[0].nb=this;
	    return t[0];
    },
    searchText:function(txt,limit) {
	    return this.wget('searchText?txt='+txt);
    },
    wget:function(url) {
    var ex;
	try {
	    var request = new XMLHttpRequest();
	    if (this.username) 
                request.open('GET', 'http://'+this.path+'/'+url, false,this.username,this.password);  // `false` makes the request synchronous
	    else 
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