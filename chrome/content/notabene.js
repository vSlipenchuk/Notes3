/*
  notabene.js
    class for manage nbNode items stored in database
    
    Сколько разных нотабеней можно отдновременно отображать?
    Более 1? видимо ? - значит в момент

*/

function NotabeneSrc(db,tbl,root) { // db source for NB - table 
	this.db = db; // sqlite database here 
	this.tbl = tbl?tbl:'nb';
	this.root = root?root:0;
	return this;
}

function NotabeneNode(_src, _id,_name, _created, _txt) { // result of selects
	this.src = _src; //Notebene db
	this.id = _id;
	this.name = _name;
	this.created = _created;
	this.txt = _txt;
	return this;
}


function Notabene() {
var nb = {
        error: null, // last error
	nb:[], // no db connects yet - multi databases valid on ROOT, SEARCH
	attachStore:function( _name,_nb, _root ) { // attach new notabane controller from root path
		
	if (!_root) _root=0;
	this.nb.push ({name:_name, nb:_nb, root:_root,txt:"nb store object, read only text",ro:true}) ;
//alert('attached!');	
//	alert(this.db);
	},
	nbName:function(idx) { // resturns name of root books
	if (!idx) idx = 0;
	if (idx<0 || idx>=this.nb.length) return "";
	return this.nb[idx].name; // returns a name
	},
	searchText:function(txt,limit) {
	var ch=[];
	if (!limit) limit=100; // def
	var i; for(i=0;i<this.nb.length;i++) {
	  var c = this.nb[i].nb.searchText(txt,limit);
		//alert(c);
	   ch = ch.concat(c); // add to results
	   }
	//alert("ch="+ch);
	return ch;
	},
	getChilds:function ( up , idx )  { // get childs (default - first database) 
	   var ch = [];
	   if (!idx) idx = 0;
	   if (idx<0 || idx>=this.nb.length) return ch; // empty
	   var nb = this.nb[idx].nb;	 // get proper nb controller
		//alert('get childs from up='+up);
	   var ch = nb.getChilds(up);
	 	 //alert(ch);
	   return ch;
	   }	
	};
return nb;	
}

function deleteChildren(node) {
	while (node.firstChild)     node.removeChild(node.firstChild);

}

function getParentByTag(el, tagName) { // Ищет родителя специфического класса
while(el.parentNode) {
	if (el.parentNode.tagName==tagName) return el.parentNode; // Found
    el = el.parentNode;

}
return null; // Not found
}

function NotebeneTree( _nb, _tree, _onSelect) {
var nt = {
	  nb : _nb, // new  Notebene( .... 
          tree: _tree, // document.getElementById('nbTree')
	  onSelect: _onSelect,
	
	 init:function() { // reload roots as first elements
		  // alert('reloading roots!');
	  var t = this;	 
	
          this.tree.onselect = function (ev) { // attach my function eventer
		  t._onSelect(ev);
		  }		 
		 
	   var rows = this.tree.getElementsByTagName('treechildren')[0];
	   var nb =  this.nb; // this.nb.db[0]; // first nb
		  
	   deleteChildren( rows ); // clear all	  
		  
		  /* // load nodes as plain items
	   var ch = nb.getChilds( 0, 0) ; // get first childs
	   var i;   for(i=0;i<ch.length;i++) {
		   var r = ch[i];
		   this._addNode( rows, r.name , r ); 
	           }
		  */
	
	     var i; for(i=0;i<this.nb.nb.length;i++) { // root nodes based on controllers
		     var n = this.nb.nb[i];
		      this._addNode( rows, n.name, { nb:n.nb, id:n.root, name:n.name,txt:'ro nb root text',ro:true}) ; 
                  }	     
	    
	   
	   },
	getChildObjectByName:function (rows,name) { // find any cell in rows and returns array of [obj]
		var ch = rows.childNodes;
		//alert("ch nodes length="+ch.length);
		var i; for(i=0;i<ch.length;i++) {
		    var ti = ch[i]; 
			//alert('HERE:'+ti.data.name);
		    if (ti.tagName == 'treeitem') {
			    var tc=ti.getElementsByTagName('treecell')[0];
			    if (tc.data && tc.data.name == name) {
				    var o = { ti:ti, data:tc.data}; // construct object
				    return o;
			            }
		           }
		    //
		    }
		},
	selectObject:function(o) {
		var idx=0;
		var idx = this.tree.view.getIndexOfItem (o.ti);
		// alert('sel idx='+idx);
		this.tree.view.selection.select ( idx ); // ch - treeitem
		},
	ensureChilds:function(o) {
		if (!o.data) return ;
		if (o.data.checked) return ; // did it
		   this.refreshChilds(o);
		   o.ti.setAttribute('open','true');
		o.data.checked=1;		
		},
	setPath:function(path,autocreate) {
		//alert("setPath:"+path);
		return this.setPathA(path.split('/').slice(1),autocreate);
	},
	setPathA:function(P,autocreate) { // P - is array of name that need to be clicked and opened
	var i;
	var rows = this.tree.getElementsByTagName('treechildren')[0]; // first one block
	//var rows = rows.getElementsByTagName('treeitem'); // childs inside
	//	alert("setPath root treechildren rows.length="+rows.length);
	//rows=rows[0]; // first one
	var o = this.getChildObjectByName(rows,P[0]); if (!o) return 0; // if not found root NoteBook
	//this.refreshChilds( o );  // and select ?
	for(i=1;i<P.length;i++) { // need to open one-by one
		this.ensureChilds(o);
		/*
		   var r = o.ti.getAttribute('open');
		//alert('opened='+r);
		  if ( r == "false" ) {
			   this.refreshChilds( o );  
	                   o.ti.setAttribute('open','true'); // open me?
			   return this.setPath(P,autocreate); // do it again
		            }
		*/
		 //alert('refreshed '+o.data.name);
		 //alert('processing:'+P[i]);
		  var rows = o.ti.getElementsByTagName('treechildren')[0]; // upper case
		  var p = this.getChildObjectByName(rows,P[i]);
		  if (!p) {
			      //alert("Chunk "+P[i]+" not found in o.data.name="+o.data.name);
			       if (autocreate) {
				       //alert("Autocreating parent="+o.data.id+" name="+P[i]);
				       //alert("o.nb="+o.nb);
				       //alert("o.nb.addNote="+o.data.nb.addNote);
				       if (!o.data.nb.addNote( o.data.id, P[i], '')) {
					   o.data.checked=0;
					 //alert("Created OK - reset loop");
					  i--;  continue;
				          } else alert("Failed create new ID!");
			       }
			   return null;
		           }
		  //alert("CHUNK found OK"+P[i]+" p.name="+p.data.name);
		  // select this item?
		  
		  o = p; // do it again...
		  this.ensureChilds(o);
		this.selectObject(o);
		  //o.ti.setAttribute('open','true'); // open me?
		  }
	return i==P.length; // get last point
	},
	getPath:function (obj, sep) {
		if (!sep) sep='/';
		var p=''; 
		while(obj) {
			p=sep+obj.data.name+p;
			obj = this.getParentObject( obj);
			}
	return p;
	},
	getParentObject:function (obj) {
	var ti = getParentByTag(obj.ti,'treeitem'); 
		if (!ti) return null;
	var obj={};
	obj.ti=ti;
	obj.tc = obj.ti.getElementsByTagName('treecell')[0];
	obj.rows = obj.ti.getElementsByTagName('treechildren')[0];
	if (obj.tc) obj.data = obj.tc.data;
	return obj;		
	},	   
	   _addNode: function (rows,title,data) {
        var ti,tr,tc,ch;
	//alert('eee');
        ti = document.createElement('treeitem');
        ti.setAttribute("container",true); // Can have childs
	ti.setAttribute("open",false); // Open	   
		  ti.data = data; // primary
        tr = document.createElement('treerow'); ti.appendChild(tr);
        ch = document.createElement('treechildren'); ti.appendChild(ch);
        //for(i=0;i<db.colCount;i++) {
        tc = document.createElement('treecell');
        tc.setAttribute('label',title);  
		   tc.data = data; // 
		   
		   
        tr.appendChild(tc);
        // }
        rows.appendChild(ti); // Add a tree item
        return ti; // Tree Item - back
        },
         refreshChilds:function(obj) { // 
		 //alert('begin refresh obj.ti='+obj.ti);
		 var tc = obj.ti.getElementsByTagName('treechildren')[0]; // rows here
		 //alert('tc='+tc);
		 var rows = tc;
		 //var nb = this.nb;
		 var nb = obj.data.nb; // controller MUST be in a data ref
		 if (!nb) return ; // not editable at all
		 //alert('obj.data.id='+obj.data.id);
		 deleteChildren( rows ); // clear all	  
		 
	         var ch = nb.getChilds( obj.data.id , 0) ; // get first childs
		 if (ch.length == 0) obj.ti.setAttribute('container','false');
	         var i;   for(i=0;i<ch.length;i++) {
		   var r = ch[i];
		   this._addNode( rows, r.name , r ); 
	           }
		   if (ch.length > 0) obj.ti.setAttribute('open','true');
		 //deleteChildren( tc);
		 //alert('tc='+tc);
		 //this._addNode( tc, 'Hello' , 'Data');
		 
	},	
	_onSelect: function () {
	var treeItem = this.selectedRow() ; 
	if (!treeItem) return null;
	var obj  = {};
	obj.ti=treeItem;
	obj.tc = obj.ti.getElementsByTagName('treecell')[0];
	obj.rows = obj.ti.getElementsByTagName('treechildren')[0];
	
	if (obj.tc) obj.data = obj.tc.data;
	   // first of all - want to reload childs ...
	//this.refreshChilds(obj);
	this.ensureChilds(obj);
	this.onSelect(obj);
	},
	defOnSelect:function (obj) {
	      alert("User  Event, MustBe Overriden, data:"+obj.data.name);
	},
	
	selectedRow: function () { // called from onSelect
		//alert('called selectedRow()');
    var start = new Object();
    var end = new Object();
    var numRanges = this.tree.view.selection.getRangeCount();
      // alert('numRanges='+numRanges);
    for (var t=0; t<numRanges; t++){
    this.tree.view.selection.getRangeAt(t,start,end);
      for (var v=start.value; v<=end.value; v++){
        return this.tree.view.getItemAtIndex(v);
        return v; // alert("Item "+v+" is selected.");
        }
    }
    }
	
	
   }
return nt;	
}
