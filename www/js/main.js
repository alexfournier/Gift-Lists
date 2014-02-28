// JavaScript Document
// back btn
// google search
// refrsh
// page width
/**********************************
			GLOBAL DECLARATIONS
**********************************/

var pages = null;
var tabs = null;
var myHistory = [];
var numLinks =0;
var numPages = 0;
var db = null;
var currentPersonName = null;
var currentPersonId = 0;
var currentOccasionName = null;
var currentOccasionId = 0;
var currentGiftName = null;
var currentGiftId = 0;
var isPurchased = 0;
var currentTab = "plan";
var occ = ""; 	//name of added occasion
var idea = "";	//name of added idea
var contacts = []; //this is loaded at the start only
var occasions = [];	//this won't change often
var gifts = []; //this will be cleared out after each time on the gifts page

/**********************************
			SETUP FUNCTIONS
**********************************/
window.onload = init;

function init( ){
	//device ready...
	document.addEventListener("deviceready", startApp, false);
}

function startApp(ev){
	pages = document.querySelectorAll('[data-role="page"]'); 
	
	tabs = document.querySelectorAll('a.mainNav'); 
	var numTabs = tabs.length;
	console.log(numTabs);
	for(var t=0; t<numTabs; t++){
		tabs[t].addEventListener("click", handleNav, false);
	}
	var backBtn = document.querySelector(".back"); //local var
	backBtn.addEventListener("click", goBack, false);	
	
	document.querySelector("#btnAddGift").addEventListener("click", addGiftIdea, false);
	document.querySelector("#btnAddOccasion").addEventListener("click", addOccasion, false);
	
	//create the database and set up the tables
	db = window.openDatabase("shoppingDB", "1.0", "shopping", 1024000);
	db.transaction( buildDB, dbErr );
	
	setActiveTab('planLink');
	//show the first page
	loadPage(null);
	//get the list of contacts and load them into the People lists
	fetchContacts();
	//get the list of occasions and load them into the occasion lists
	db.transaction( fetchOccasions, dbErr);
}

function buildDB(trans){
	//trans.executeSql('DROP TABLE IF EXISTS Occasions');
	trans.executeSql('CREATE TABLE IF NOT EXISTS Occasions (id INTEGER PRIMARY KEY, occasion TEXT)' );
	
	//trans.executeSql('DROP TABLE IF EXISTS Gifts');
	trans.executeSql('CREATE TABLE IF NOT EXISTS Gifts (id INTEGER PRIMARY KEY, person INTEGER, occasion INTEGER, name TEXT, purchased INTEGER)' );
    /*trans.executeSql('INSERT INTO Occasions(occasion) VALUES ("Christmas")', []);
    trans.executeSql('INSERT INTO Occasions(occasion) VALUES ("Birthday")', []);
    trans.executeSql('INSERT INTO Occasions(occasion) VALUES ("Valentines")', []);
    trans.executeSql('INSERT INTO Occasions(occasion) VALUES ("Halloween")', []);
    trans.executeSql('INSERT INTO Occasions(occasion) VALUES ("Holiday")', []);
	//these assume that there is at least two contacts in the device
	trans.executeSql('INSERT INTO Gifts(person, occasion, name, purchased) VALUES(1, 1, "Lego", 0)');
	trans.executeSql('INSERT INTO Gifts(person, occasion, name, purchased) VALUES(2, 1, "Crossbow", 0)');
	trans.executeSql('INSERT INTO Gifts(person, occasion, name, purchased) VALUES(3, 1, "Bike", 0)');
	trans.executeSql('INSERT INTO Gifts(person, occasion, name, purchased) VALUES(1, 2, "Skates", 0)');
	trans.executeSql('INSERT INTO Gifts(person, occasion, name, purchased) VALUES(2, 2, "Laptop", 0)');
	trans.executeSql('INSERT INTO Gifts(person, occasion, name, purchased) VALUES(3, 2, "Tablet", 0)');*/
}

function dbErr(err){
	alert("Data Error");
	console.log(	err.code + " " + err.message );
}
function fetchContacts(){
	//get the contacts
	var options = new ContactFindOptions( );
	options.filter = "";  //leaving this empty will find return all contacts
	options.multiple = true;  //return multiple results
	var filter = ["displayName"];    //an array of fields to compare against the options.filter 
	navigator.contacts.find(filter, contactsFound, contactsFailed, options);
}
function fetchOccasions(trans){
	trans.executeSql('SELECT id, occasion FROM Occasions ORDER BY occasion', [], showOccasions, dbErr);
}
function getGifts(trans){
	trans.executeSql('SELECT id, name, purchased FROM Gifts WHERE occasion=? AND person=?', [currentOccasionId, currentPersonId], showGifts, dbErr);
}
/**********************************
			LIST LOADING
**********************************/
function contactsFound( matches ){
	//save the contacts in the database
	var numContacts = matches.length;
	var ulp = document.querySelector("#ulPpeople");
	var uls = document.querySelector("#ulSpeople");
	for( var i=0; i<numContacts; i++){
		currentPersonId = matches[i].id;
		currentPersonName = matches[i].displayName;
		//add the person info to the contacts array
		contacts.push({"id": currentPersonId, "name": currentPersonName});
		//add the person to the planning people list
		var pli = document.createElement("li");
		var pa = document.createElement("a");
		pa.innerText = currentPersonName;
		pa.href = "#pOccasions";
		pa.addEventListener("click", handleNav, false);
		pa.setAttribute("data-person", currentPersonId);
		pli.appendChild(pa);
		ulp.appendChild(pli);
		
		//add the person to the shopping people list
		var sli = document.createElement("li");
		var sa = document.createElement("a");
		sa.innerText = currentPersonName;
		sa.href = "#sGifts";
		sa.addEventListener("click", handleNav, false);
		sa.setAttribute("data-person", currentPersonId);
		sli.appendChild(sa);
		uls.appendChild(sli);
	}
	//reset the variables
	currentPersonId = 0;
	currentPersonName = null;
}
function contactsFailed(  ){
	alert("Unable to retrieve device contacts");
}
function showOccasions(trans, results){
/*
 if(results.rows.item(0).cnt == 0)}
    trans.executeSql('INSERT INTO Occasions(occasion) VALUES ("Christmas")', []);
    trans.executeSql('INSERT INTO Occasions(occasion) VALUES ("Birthday")', []);
    trans.executeSql('INSERT INTO Occasions(occasion) VALUES ("Valentines")', []);
    trans.executeSql('INSERT INTO Occasions(occasion) VALUES ("Halloween")', []);
    trans.executeSql('INSERT INTO Occasions(occasion) VALUES ("Holiday")', []);
}else{
    console.log("Occations already exist");
}*/
	var ulp = document.querySelector("#ulPoccasions");
	var uls = document.querySelector("#ulSoccasions");
	
    var num = results.rows.length;
	
    for( var i=0; i<num; i++){
		currentOccasionId = results.rows.item(i).id;
		currentOccasionName = results.rows.item(i).occasion;
		//add the person info to the global occasions array
		occasions.push({"id": currentOccasionId, "name": currentOccasionName});
		
        //add the person to the planning occasions list
		var pli = document.createElement("li");
		var pa = document.createElement("a");
        var pa2 = document.createElement("a");
        var pa3 = document.createElement("a");
        
        pa.innerText = currentOccasionName;
        pa.href = "#pGifts";
		pa.addEventListener("click", handleNav, false);
		pa.setAttribute("data-occasion", currentOccasionId);
		pa2.setAttribute("data-occasion", currentOccasionId);
        pa3.setAttribute("data-occasion", currentOccasionId);
        
        pli.appendChild(pa);
        pli.appendChild(pa2);
        pli.appendChild(pa3);
		ulp.appendChild(pli);
        
        pa3.addEventListener("click", deleteOccasion, false);
        pa2.addEventListener("click", editOccasion, false);
        pa.className = "tileClass";
        pa3.className = "delete";
        pa2.className = "edit";

		//add the occasion to the shopping occasions list
		var sli = document.createElement("li");
		var sa = document.createElement("a");
        var sa2 = document.createElement("a");
        var sa3 = document.createElement("a");
		
        sa.innerText = currentOccasionName;
		sa.href = "#sPeople";
		sa.addEventListener("click", handleNav, false);
		sa.setAttribute("data-occasion", currentOccasionId);
        sa2.setAttribute("data-occasion", currentOccasionId);
        sa3.setAttribute("data-occasion", currentOccasionId);
		
        sli.appendChild(sa);
        sli.appendChild(sa2);
        sli.appendChild(sa3);
		uls.appendChild(sli);
        
        sa3.addEventListener("click", deleteOccasion, false);
        sa2.addEventListener("click", editOccasion, false);
        sa.className = "tileClass";
        sa3.className = "delete";
        sa2.className = "edit";
	}
	//reset the variables
	currentPersonId = 0;
	currentPersonName = null;
}
function showGifts(trans, results){
	//called from getGifts
	//use currentTab to decide which list to populate
	//we only ever populate one list at a time for gifts
	var ul;
	if(currentTab == "plan"){
		//load the list #ulPgifts
		ul = document.querySelector("#ulPgifts");
	}else{
		//load the list #ulSgifts
		ul = document.querySelector("#ulSgifts");
	}
	ul.innerHTML = "";
	var num = results.rows.length;
	for(var i=0;i<num; i++){
		var li = document.createElement("li");
        var a = document.createElement("a"); //delete btn
        var a2 = document.createElement("a"); // edit btn
        var span = document.createElement("span");
        
        span.innerText = results.rows.item(i).name;
        li.appendChild(span);
        li.appendChild(a);
        li.appendChild(a2);
		
        a.setAttribute("data-gift", results.rows.item(i).id);
        a2.setAttribute("data-gift", results.rows.item(i).id);
		li.setAttribute("data-purchased", results.rows.item(i).purchased);
        a.href="#";
        a2.href="#";
		
        if(currentTab == "plan"){
			a2.addEventListener("click", deleteGift, false);
			a2.className = "delete";
            a.addEventListener("click", editGift, false); // click amazon link
			a.className = "edit"; // amzon logo
		}else{
			li.addEventListener("click", togglePurchased, false);
			if(results.rows.item(i).purchased == "1"){
				li.className = "purchased";
			}else{
				li.className = "notpurchased";
			}
		}
		ul.appendChild(li);
	}
}
/*******************************************
			ADDING, DELETING & TOGGLING FUNCTIONS
*******************************************/
function deleteGift(ev){
	ev.preventDefault();
	currentGiftId = ev.target.getAttribute("data-gift");
	currentGiftName = ev.target.innerText;
	//delete gift from db
	db.transaction(deleteGiftDB, dbErr);
	//remove the list item from the ul
	var obj = ev.target;
	while(obj.nodeName.toLowerCase() != "li"){
		//keep moving up the chain of parent elements
		//until you find the list item to remove
		obj = obj.parentNode;	
	}
	obj.parentNode.removeChild(obj);
}
function deleteGiftDB(trans){
	trans.executeSql('DELETE FROM Gifts WHERE id=?', [currentGiftId], giftDeleted, dbErr);
}
function occasionDeleted(trans, results){
    if(results.rowsAffected == 1){
		//it was deleted
		console.log("Gift was removed from the database");
	}
	currentOccasionId = 0;
	currentOccasionName = null;
}
function deleteOccasion(ev){
    ev.preventDefault;
    currentOccasionId = ev.target.parentNode.querySelector("data-occasion");
    currentOccasionName = ev.target.innerText;
    db.transaction(deleteOccasionTrans, dbErr);
    
    var obj = ev.target;
    while(obj.nodeName.toLowerCase() != "li"){
        obj = obj.parentNode;
    }
    obj.parentNode.removeChild(obj);
}
function deleteOccasionTrans(trans){
    trans.executeSql('DELETE FROM Occasions WHERE id=?', [currentOccasionId], occasionDeleted, dbErr);
}
function giftDeleted(trans, results){
	if(results.rowsAffected == 1){
		//it was deleted
		console.log("Gift was removed from the database");
	}
	currentGiftId = 0;
	currentGiftName = null;
}
function editOccasion(ev){
    var update = ev.target.parentNode.firstChild.innerText;
    currentOccasionId = ev.target.getAttribute("data-occasion");
	occ = prompt('Edit Occasion', update);
	
    if(occ && occ.length > 0){
        update = occ;
		db.transaction(function(tx){
                       tx.executeSql('UPDATE Occasions SET name=? WHERE id=?',[update, currentOccasionId]);})
        ev.target.parentNode.firstChild.innerText = occ;
	}

}
function editGift(ev){
    
    var update = ev.target.parentNode.querySelector("span").innerText;
    currentGiftId = ev.target.getAttribute("data-gift");
	idea = prompt('Edit Gift Idea', update);
	
    if(idea && idea.length > 0){
        update = idea;
		db.transaction(function(tx){
                       tx.executeSql('UPDATE Gifts SET name=? WHERE id=?',[update, currentGiftId]);})
        ev.target.parentNode.querySelector("span").innerText = idea;
	}
}
function togglePurchased(ev){
	ev.preventDefault();	
	currentGiftId = ev.target.getAttribute("data-gift");
	currentGiftName = ev.target.innerText;
	isPurchased = parseInt(ev.target.getAttribute("data-purchased"));
	//update gift as purchased
	if(isPurchased == 1){
		isPurchased = 0;
		ev.target.className = "notpurchased";	
	}else{
		isPurchased = 1;
		ev.target.className = "purchased";	
	}
	ev.target.setAttribute("data-purchased", isPurchased);
	db.transaction(togglePurchasedDB, dbErr);
}
function togglePurchasedDB(trans){
	trans.executeSql('UPDATE Gifts SET purchased=? WHERE id=?',[isPurchased, currentGiftId], giftToggled, dbErr);	
}
function giftToggled(trans, results){
	//if this runs it means it was updated
	if(results.rowsAffected == 1){
		//anything you want to tell the user?
		currentGiftId = 0;
		currentGiftName = null;
	}
}
function addGiftIdea(ev){
	idea = prompt('Please Add a Gift Idea', '');
	if(idea && idea.length > 0){
		db.transaction(function(tx){
			tx.executeSql('INSERT INTO Gifts(name, person, occasion, purchased) VALUES(?,?,?,?)',[idea, currentPersonId, currentOccasionId, 0], giftAdded, dbErr);
		}, dbErr);
	}
}
function giftAdded(trans, results){
	//add to the current ul -only happens with ulPgifts
	var ul = document.querySelector("#ulPgifts");	///NEXTFMEEFOCMEERv EVDVOEW
	var id = results.insertId;
	var li = document.createElement("li");
    var span = document.createElement("span");
	
    var a = document.createElement("a");
    var a2 = document.createElement("a");
	
    span.innerText = idea;
	a.href= "#";
	a.setAttribute("data-gift", id);
    a2.setAttribute("data-gift", id);
    
	a2.className = "delete";
	a2.addEventListener("click", deleteGift, false);
	a.className = "edit";
    a.addEventListener("click", editGift, false);
    
    li.appendChild(span);
	li.appendChild(a);
    li.appendChild(a2);
    
    ul.appendChild(li);
}
function addOccasion(ev){
	occ = prompt('Please add an Occasion','');
	if(occ && occ.length > 0){
		db.transaction(function(tx){
			tx.executeSql('INSERT INTO Occasions(occasion) VALUES(?)',[occ], occasionAdded, dbErr);
		}, dbErr);
	}
}
function occasionAdded(trans, results){
	//add to the occasions array AND the ul lists	
	var ulp = document.querySelector("#ulPoccasions");
	var uls = document.querySelector("#ulSoccasions");
    var id = results.insertId;
	var name = occ;
	//add the person info to the global occasions array
	occasions.push({"id": id, "name": name});
	//add the person to the planning occasions list
	var pli = document.createElement("li");
	var pa = document.createElement("a");
    var pa2 = document.createElement("a");
    var pa3 = document.createElement("a");
	
    pa.innerText = name;
	pa.href = "#pGifts";
	
    pa.addEventListener("click", handleNav, false);
    pa2.addEventListener("click", editOccasion, false);
    pa3.addEventListener("click", deleteOccasion, false);
    
    pa.className = "tileClass";
    pa2.className = "edit";
    pa3.className = "delete";
    
	pa.setAttribute("data-occasion", id);
    pa2.setAttribute("data-occasion", id);
    pa3.setAttribute("data-occasion", id);
    
	pli.appendChild(pa);
    pli.appendChild(pa2);
    pli.appendChild(pa3);
    
	ulp.appendChild(pli);
	
	//add the person to the shopping occasions list
	var sli = document.createElement("li");
	var sa = document.createElement("a");
    var sa2 = document.createElement("a");
    var sa3 = document.createElement("a");
	
    sa.innerText = name;
	sa.href = "#sPeople";
    
	sa.addEventListener("click", handleNav, false);
    sa2.addEventListener("click", editOccasion, false);
    sa3.addEventListener("click", deleteOccasion, false);
	
    sa.className = "tileClass";
    sa2.className = "edit";
    sa3.className = "delete";
    
    sa.setAttribute("data-occasion", id);
    sa2.setAttribute("data-occasion", id);
    sa3.setAttribute("data-occasion", id);
	
    sli.appendChild(sa);
    sli.appendChild(sa2);
    sli.appendChild(sa3);
	
    uls.appendChild(sli);
	
}
/**********************************
			PAGE NAVIGATION
**********************************/
function handleNav(ev){
	ev.preventDefault();
	var id = ev.target.href.split("#")[1];
	var div = document.querySelector("#" + id);
	console.log("show " + id);
	switch( id ){
		case "pPeople":
			setActiveTab("planLink");
			hideBack();
			break;	
		case "pOccasions":
			setActiveTab("planLink");
			currentPersonId = ev.target.getAttribute("data-person");
			currentPersonName = ev.target.innerText;
			div.querySelector('h3.msg').innerText = "Choose an Occasion for " + currentPersonName;
			showBack();
			break;	
		case "pGifts":
			setActiveTab("planLink");
			currentOccasionId = ev.target.getAttribute("data-occasion");
			currentOccasionName = ev.target.innerText;
			db.transaction( getGifts, dbErr);
			div.querySelector("h3.msg").innerText = "Gifts for " + currentPersonName + " on " + currentOccasionName;
			showBack();
			break;	
		case "sOccasions":
			setActiveTab("shopLink");
			hideBack();
			break;	
		case "sPeople":
			setActiveTab("shopLink");
			currentOccasionId = ev.target.getAttribute("data-occasion");
			currentOccasionName = ev.target.innerText;
			div.querySelector('h3.msg').innerText = "Choose a Person for " + currentOccasionName;
			showBack();
			break;	
		case "sGifts":
			setActiveTab("shopLink");
			currentPersonId = ev.target.getAttribute("data-person");
			currentPersonName = ev.target.innerText;
			db.transaction(getGifts, dbErr);
			div.querySelector("h3.msg").innerText = "Gifts for " + currentPersonName + " on " + currentOccasionName;
			showBack();
			break;	
	}
	loadPage( id );
}
function setActiveTab(id){
	if(id == "planLink"){
		document.querySelector("#planLink").className = "current";
		document.querySelector("#shopLink").className = "";
		document.querySelector('[data-role="header"] h1 span').innerText = "Planning";
		currentTab = "plan";
	}else{
		document.querySelector("#planLink").className = "";
		document.querySelector("#shopLink").className = "current";
		document.querySelector('[data-role="header"] h1 span').innerText = "Shopping";
		currentTab = "shop";
	}
}
function showBack(){
	document.querySelector('a.back').style.display="block";
	console.log("show back button");
}
function hideBack(){
	document.querySelector('a.back').style.display="none";
	console.log("hide back button");
}
function loadPage(url){
	if(url == null){
		//home page
		pages[0].style.display = 'block';
		myHistory.push(pages[0]);	
	}else{
		//other page
		for(var p in pages){
			pages[p].className = "goneleft";
			if(url == pages[p].id){
				pages[p].className = "";
				myHistory.push(pages[p]);	
			}
		}
	}
}
function goBack(ev){
	ev.preventDefault();
	var href = myHistory[myHistory.length-2].id;
	myHistory.pop();
	myHistory.pop();
	loadPage( href );
}