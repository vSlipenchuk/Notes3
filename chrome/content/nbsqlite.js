/*
   notabene sqlite by default works with a table NB like this
   
CREATE TABLE nb (
  N   INTEGER PRIMARY KEY AUTOINCREMENT,
  UP INTEGER DEFAULT 0,
  NAME VARCHAR(80),
  TXT VARCHAR(2000),
  CREATED  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX i_nb_up on nb(UP,NAME);

INSERT INTO nb(N,UP,NAME,TXT) VALUES(1,0,'root','root text');


*/


function nbSqlite(_path,_up,_name) { // database file name, root connection name of this db
var nb = {
    name:_name,
    path:_path,
    up:_up,
    init:function() {
	    if (!this.name) this.name = this.path;
	    this.db = new sqliteDatabase(this.path);
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
	    var db = this.db;
	    //alert('getNote ID='+id);
	    if ( db.select('select N,NAME,CREATED,TXT from nb where n=?1',id) &&  db.fetch() ) {			
			var r = db.row;
			var n = { nb:this, id:r[0], name:r[1], created:r[2],txt:r[3]};
		//	alert("ret="+n);
			return n;
		}
            return null;
    },
    searchText:function(txt,limit) {
	    if (!limit) limit = 100;
	    var db = this.db;
           var ch = [];
	   // alert('noserach='+txt);
           if ( db.select("select N,NAME,CREATED from nb where txt like '%'||?1||'%'   order by created desc LIMIT ?2",txt,limit) )  
		while ( db.fetch() ) {			
			var r = db.row;
			//alert('fetch!'+r);
			var n = { nb:this, id:r[0], name:r[1], created:r[2]};
			//alert('push node: '+n);
			ch.push ( n ) ; // add to result
		}
	  //alert('nb.res='+ch);
	  return ch;
	    
    },
    getChilds:function (up)  {
	   var db = this.db;
           var ch = [];
           if ( db.select('select N,NAME,CREATED from nb where UP=?1',up) )  
		while ( db.fetch() ) {			
			var r = db.row;
			//alert('fetch!'+r);
			var n = { nb:this, id:r[0], name:r[1], created:r[2]};
			//alert('push node: '+n);
			ch.push ( n ) ; // add to result
		}
	  return ch;
           }
   };
return nb;
}