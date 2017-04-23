// externally - Nb (for search)

var Nb;

function $$(id) { return document.getElementById(id)}; // shortcut

 function rowsAddNode (rows, data, title, col2) {
        var ti,tr,tc,ch;
	ti = document.createElement('treeitem');
       // ti.setAttribute("container",true); // Can have childs
	//ti.setAttribute("open",false); // Open	   
		  ti.data = data; // primary
	 
        tr = document.createElement('treerow'); ti.appendChild(tr);
        ch = document.createElement('treechildren'); ti.appendChild(ch);
        //for(i=0;i<db.colCount;i++) {
        tc = document.createElement('treecell');
        tc.setAttribute('label',title);  		   
        tr.appendChild(tc);
	 
	 if (col2) {
		 tc = document.createElement('treecell');
                 tc.setAttribute('label',col2);   		   
                 tr.appendChild(tc);
		 }
	 
        // }
        rows.appendChild(ti); // Add a tree item
        return ti; // Tree Item - back
	
 }
 
 function onLoad() {
	var par = window.arguments[0]; // init
	Nb = par[0]; // 
 doSearchText('Hello',2); // test	 
 }
 
function treeItemSelected(tree) { // called from onSelect
		//alert('called selectedRow()');
    var start = new Object();
    var end = new Object();
    var numRanges = tree.view.selection.getRangeCount();
      // alert('numRanges='+numRanges);
    for (var t=0; t<numRanges; t++){
      tree.view.selection.getRangeAt(t,start,end);
      for (var v=start.value; v<=end.value; v++){
            return tree.view.getItemAtIndex(v);
            }
       }    
return null;
}

 
 function rowSelected() { // called on selected row
	 var ti = treeItemSelected( $$('searchTree'));
	 
	 //alert("selected ti="+ti);
	 //alert("ti.tagName="+ti.tagName);
	 var o = ti.data ;
	 //alert('o='+o);
	 var txt = o.nb.getNote( o.id ).txt;
	 //alert(txt);
	 var id = $$('NoteText');
	 id.value = txt;
	 //  Hilight text now
	 var searchText = $$('searchText').value;
	 var pos  = txt.toUpperCase().indexOf(searchText.toUpperCase()); // case in-sensitive
         if (pos>=0) {
            //id.selectionStart=pos;  id.selectionEnd=pos+searchText.length;
	     
             id.setSelectionRange(pos,pos+searchText.length);
            //alert('OK');
            }

	 
 }
 

function doSearchText(txt, limit) {

	
	//alert("Find "+txt+" with limit:"+(limit+1) +" and Nb="+Nb);
	// now - 
	var ch = Nb.searchText(txt,limit); // myst be list of objects  obj.id, obj,nb ...
	var tv = $$("searchTree"); // tree here
	//alert('2 tv='+tv);
	var rows = tv.getElementsByTagName('treechildren')[0]; 
	//alert('3');
	deleteChildren( rows ); // clear all childs
	//alert(ch);
	var i; for(i=0;i<ch.length;i++) { // push to treeView
		var o = ch[i];
		rowsAddNode( rows, o, o.name, o.created); 
	    
	}
	//alert('results:'+ch);
}

function textKeyUp(event) { // when search result here
  if (event.keyCode==13)  doSearchText( $$("searchText").value, parseInt ($$("limitResults").value) );
}
