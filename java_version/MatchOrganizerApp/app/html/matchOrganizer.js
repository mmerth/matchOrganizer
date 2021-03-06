var tourneyJSON = [];
var eventList = [];

//key = matchId
//value = rowId - each row <tr> will have an id attribute with a global index
var matchRowHash = {};
var ROW_COUNT = 0;

//initialize some eventListeners
window.onload = function() {
	addEvents();
};

//------------------------Station Functions-------------------------
function addEvents(){
	getId("addStations").addEventListener("click", editStations);
}

function editStations(){
	var textAreaValue = getId("stationList").value;

	if(getId("addStations").innerHTML === "Edit"){
		getId("addStations").innerHTML = "Update stations";//change the button value
		getId("stationList").readOnly = false;
		getId("stationList").focus();
	}else {
		if(window.cAPI.populateStationHash(textAreaValue) == true){
			getId("addStations").innerHTML = "Edit";//change the button value
			getId("stationList").readOnly = true;
		}
		updateStationList();
	}

}

function updateStationList(){
	getId("stationList").value = window.cAPI.getOpenStations();
}

function updateStation(event){
	var stationValue;
	if(event.target.innerHTML == "Edit"){

		//get the station value
		stationValue = event.target.previousSibling.nodeValue;

		if(window.cAPI.updateStation(stationValue, "true")) {//successful
			checkDupMatches(event.target.parentElement.parentElement.getAttribute("matchId"),//matchId
				getPrevElement(getPrevElement(getPrevElement(getPrevElement(event.target.parentElement)))).innerHTML,//p1
				getPrevElement(getPrevElement(getPrevElement(event.target.parentElement))).innerHTML,//p2
				true);//clear dup match style

			//remove the textNode data
			event.target.previousSibling.nodeValue = "";

			//reset the text box
			getPrevElement(event.target).setAttribute("class", "");
			getPrevElement(event.target).value = "";

			//change the button text back to 'assign'
			event.target.innerHTML = "Assign";

			//stop current timer
			event.target.parentNode.parentNode.children[3].setAttribute("stop", "1");
			event.target.parentNode.parentNode.children[3].setAttribute("class", "");

			//update the list of stations

			//<td> tag has this attribute
			event.target.parentElement.setAttribute("station", stationValue);
			window.cAPI.updateStation(stationValue, "true");
			//re-draw the text area
			updateStationList();
		}

	}else {//Assign

		stationValue = getPrevElement(event.target).value;//grab the user input
		//update the station hashMap
		if(window.cAPI.updateStation(stationValue, "false")) {//successful
			checkDupMatches(event.target.parentElement.parentElement.getAttribute("matchId"),//matchId
				getPrevElement(getPrevElement(getPrevElement(getPrevElement(event.target.parentElement)))).innerHTML,//p1
				getPrevElement(getPrevElement(getPrevElement(event.target.parentElement))).innerHTML,//p2
				false);// add dup match style

			//get the input value and change the button text to 'edit'

			event.target.parentNode.insertBefore(document.createTextNode(stationValue), event.target);
			getPrevElement(event.target).setAttribute("class", "hide");
			event.target.innerHTML = "Edit";

			//start the timer
			var newTimer = event.target.parentNode.parentNode.children[3];
			newTimer.setAttribute("count", "0");
			event.target.parentNode.parentNode.children[3].setAttribute("stop", "0");
			event.target.parentNode.parentNode.children[3].setAttribute("class", "assigned");
			timer(newTimer);

			//<td> tag has this attribute
			event.target.parentElement.setAttribute("station", stationValue);
			//re-draw the station list text area
			updateStationList();
		}
	}
}
//=========================================================================

var matchJSON = [{
	"match": {
		"id": 35187608,
		"tournament_id": 1551886,
		"state": "open",
		"player1_id": 24088978,
		"player2_id": 24088982,
		"player1_prereq_match_id": null,
		"player2_prereq_match_id": null,
		"player1_is_prereq_match_loser": false,
		"player2_is_prereq_match_loser": false,
		"winner_id": 24088982,
		"loser_id": 24088978,
		"started_at": "2015-03-28T18:26:17.892-05:00",
		"created_at": "2015-03-28T18:26:17.666-05:00",
		"updated_at": "2015-03-28T18:53:23.223-05:00",
		"identifier": "A",
		"has_attachment": false,
		"round": 1,
		"player1_votes": null,
		"player2_votes": null,
		"group_id": null,
		"attachment_count": null,
		"scheduled_time": null,
		"location": null,
		"underway_at": "2015-03-28T18:41:38.676-05:00",
		"optional": false,
		"prerequisite_match_ids_csv": "",
		"scores_csv": "0-2"
	}
},
	{
		"match": {
			"id": 35187609,
			"tournament_id": 1551886,
			"state": "complete",
			"player1_id": 24088977,
			"player2_id": 24088985,
			"player1_prereq_match_id": null,
			"player2_prereq_match_id": null,
			"player1_is_prereq_match_loser": false,
			"player2_is_prereq_match_loser": false,
			"winner_id": 24088985,
			"loser_id": 24088977,
			"started_at": "2015-03-28T18:26:17.903-05:00",
			"created_at": "2015-03-28T18:26:17.669-05:00",
			"updated_at": "2015-03-28T18:56:15.159-05:00",
			"identifier": "B",
			"has_attachment": false,
			"round": -1,
			"player1_votes": null,
			"player2_votes": null,
			"group_id": null,
			"attachment_count": null,
			"scheduled_time": null,
			"location": null,
			"underway_at": "2015-03-28T18:38:33.718-05:00",
			"optional": false,
			"prerequisite_match_ids_csv": "",
			"scores_csv": "0-2"
		}
	}];





function addTable() {
	var url = getId("urlInput").value;
	getId("urlInput").value = "";

	//PASS url to Java to get the data from the url

	var eventName = window.cAPI.parseURL(url);
	//REST CALLS DONE HERE!!!!!!!!!!!!!!!!!!!!
	//********JAVA API CALL******
	if(eventName != "") {
		var players = window.cAPI.getParticipants(eventName);
		var matches = window.cAPI.getMatches(eventName);
	}
	//***************************


	//ALL ERROR MESSAGES are handled by java
	if(players == "401" || matches == "401"){
		//bad API key, re login
		window.cAPI.error("Please restart the program, and log in again.");
	}else if(players.length > 3 && matches.length > 3) {//if these are longer than 3 characters, a jsonStr was returned
		tourneyJSON[eventName] = {
			"players": createPlayerHash(JSON.parse(players)),
			"matches": JSON.parse(matches)
		};

		var tbody = getId("outerTable").lastChild;//lastChild is the tbody tag
		var lastTrIndex = tbody.children.length - 1;
		var newTable = null;
		if (tbody.children[lastTrIndex].children.length > 1) {//make a new tr
			var tr = tbody.appendChild(document.createElement("tr"));
			var td = tr.appendChild(document.createElement("td"));
			newTable = createTable(td, eventName);
		} else {//just make a new td
			var tr2 = tbody.children[lastTrIndex];
			var td2 = tr2.appendChild(document.createElement("td"));
			newTable = createTable(td2, eventName);
		}

		//set a variable in the newTable object
		newTable.setAttribute("tName", eventName);

		//loop through to find the open matches and create a row for each one.
		for(var i=0; i < tourneyJSON[eventName].matches.length; i++) {
			if (tourneyJSON[eventName].matches[i].match.state == "open") {
				//var newP1Name = tourneyJSON[eventName].players[tourneyJSON[eventName].matches[i].match.player1_id];
				//var newP2Name = tourneyJSON[eventName].players[tourneyJSON[eventName].matches[i].match.player2_id];
				createRow(newTable, tourneyJSON[eventName].matches[i].match);
			}
		}

		//add this table to the event list
		eventList.push(newTable);
	}else {//no matches or players found.
		window.cAPI.error("No data was found for this tournament, was the tournament started?");
	}
}

function createTable(parent, eventName){
	var table = parent.appendChild(document.createElement("table"));
	table.setAttribute("class", "innerTable");
	var trHeader = table.appendChild(document.createElement("tr"));
	trHeader.setAttribute("class", "tableName");
	var tdHeader = trHeader.appendChild(document.createElement("td"));
	tdHeader.setAttribute("colspan", "6");
	tdHeader.innerHTML = eventName;

	var trColNames = table.appendChild(document.createElement("tr"));
	var thPlayer1 = trColNames.appendChild(document.createElement("th"));
	thPlayer1.innerHTML = "Player 1";
	var thPlayer2 = trColNames.appendChild(document.createElement("th"));
	thPlayer2.innerHTML = "Player 2";
	var thRound = trColNames.appendChild(document.createElement("th"));
	thRound.innerHTML = "Round";
	var thMatch = trColNames.appendChild(document.createElement("th"));
	thMatch.innerHTML = "Match assigned";
	var thStation = trColNames.appendChild(document.createElement("th"));
	thStation.innerHTML = "Station #";
	var thScore = trColNames.appendChild(document.createElement("th"));
	thScore.innerHTML = "Score";

	return table;
}
//------------------------------------------



function createRow(parent, matchInfo){
	var eventName = parent.getAttribute("tName");
	var tr = parent.appendChild(document.createElement("tr"));
	tr.setAttribute("matchId", matchInfo.id + "");//set the matchId for this row
	tr.setAttribute("id", ROW_COUNT+"");//set the row index
	//add the new row to the matchRowHash
	matchRowHash[matchInfo.id + ""] = ROW_COUNT;
	ROW_COUNT++;

	//player 1
	var tdPlayer1 = tr.appendChild(document.createElement("td"));
	tdPlayer1.innerHTML = tourneyJSON[eventName].players[matchInfo.player1_id];

	//player 2
	var tdPlayer2 = tr.appendChild(document.createElement("td"));
	tdPlayer2.innerHTML = tourneyJSON[eventName].players[matchInfo.player2_id];

	//round
	var tdRound = tr.appendChild(document.createElement("td"));
	var round = matchInfo.round;
	var roundCode = "";
	if ((round * -1) > 0) {//loser round
		roundCode = "LR-" + (Math.abs(round));
	} else {//winner round
		roundCode = "WR-" + (Math.abs(round));
	}
	tdRound.innerHTML = roundCode;

	//timer
	var tdMatch = tr.appendChild(document.createElement("td"));
	tdMatch.innerHTML = "0:00";

	//station #
	var tdStation = tr.appendChild(document.createElement("td"));
	tdStation.setAttribute("class", "assignCol");
	var stationInput = tdStation.appendChild(document.createElement("input"));
	stationInput.setAttribute("type", "text");
	var stationBtn = tdStation.appendChild(document.createElement("button"));
	stationBtn.setAttribute("class", "stationBtn");

	stationBtn.addEventListener("click", updateStation, false);

	stationBtn.innerHTML = "Assign";

	//score
	var tdScore = tr.appendChild(document.createElement("td"));
	tdScore.setAttribute("class", "scoreCol");
	var score1Input = tdScore.appendChild(document.createElement("input"));
	score1Input.setAttribute("type", "text");
	tdScore.appendChild(document.createTextNode(" - "));
	var score2Input = tdScore.appendChild(document.createElement("input"));
	score2Input.setAttribute("type", "text");
	tdScore.appendChild(document.createTextNode(" "));
	var scoreBtn = tdScore.appendChild(document.createElement("button"));

	scoreBtn.addEventListener("click", submitScore, false);

	scoreBtn.setAttribute("tName", eventName);
	scoreBtn.setAttribute("matchId", matchInfo.id + "");
	scoreBtn.setAttribute("tourneyId", matchInfo.tournament_id + "");
	scoreBtn.setAttribute("p1Id", matchInfo.player1_id + "");
	scoreBtn.setAttribute("p2Id", matchInfo.player2_id + "");
	scoreBtn.innerHTML = "Submit Score";

	checkInProgMatches(tr, matchInfo.id + "",
					   tourneyJSON[eventName].players[matchInfo.player1_id + ""],
					   tourneyJSON[eventName].players[matchInfo.player2_id + ""]);





}


function submitScore(event){
	//need match id, tourney id, and winner id
	var eventName = event.target.getAttribute("tName");
	var myTable = event.target.parentElement.parentElement.parentElement;
	var matchId = event.target.getAttribute("matchId");
	var tourneyId = event.target.getAttribute("tourneyId");
	var p1Id = event.target.getAttribute("p1Id");
	var p2Id = event.target.getAttribute("p2Id");
	var p1Score = getPrevElement(getPrevElement(event.target)).value;
	var p2Score = getPrevElement(event.target).value;
	var score = p1Score + "-" + p2Score;

	//row has this attribute of station
	var stationValue = getPrevElement(event.target.parentElement).getAttribute("station");

	var winnerId = "";
	if(parseInt(p1Score) > parseInt(p2Score)){
		winnerId = p1Id;
	}else{
		winnerId = p2Id;
	}


	checkDupMatches(matchId, tourneyJSON[eventName].players[p1Id], tourneyJSON[eventName].players[p2Id], true);//clear dup match style
	//console.log(getPrevElement(event.target).value);//player2 score
	//console.log(getPrevElement(getPrevElement(event.target)).value); //player1 score

	//submit scores to challonge
	//********JAVA API CALL******
	var match = window.cAPI.updateMatch(tourneyId, matchId, score, winnerId);
	//***************************

	if(match == "OK") {
		//get matches from challonge
		// for this tourneyId and update the table
		//stop my clock
		getPrevElement(getPrevElement(event.target.parentElement)).setAttribute("stop", "1");

		//rebuild the table based on the matchesJSON returned from java
		//loop through the open matches and create a row for each one.

		//********JAVA API CALL******
		var matches = window.cAPI.getMatches(eventName);
		if (matches.length > 3) {
			tourneyJSON[eventName].matches = JSON.parse(matches);
		}
		//***************************

		for (var i = 0; i < tourneyJSON[eventName].matches.length; i++) {
			if (tourneyJSON[eventName].matches[i].match.state == "open") {
				//var newP1Name = tourneyJSON[eventName].players[tourneyJSON[eventName].matches[i].match.player1_id];
				//var newP2Name = tourneyJSON[eventName].players[tourneyJSON[eventName].matches[i].match.player2_id];

				if (!containsMatch(myTable, tourneyJSON[eventName].matches[i].match.id + "")) {
					createRow(myTable, tourneyJSON[eventName].matches[i].match);
				}
			}
		}

		//remove the row that was submitted.
		removeRow(event.target.parentElement.parentNode.getAttribute("id"));
		//removeRow(myTable, event.target.parentElement.parentNode);

		//re-draw the station list text area
		if(window.cAPI.updateStation(stationValue, "true")) {//successful
			updateStationList();
		}

	}
}


function containsMatch(table, matchId){
	for(var row = 2; row < table.children.length; row++){
		if(table.children[row].getAttribute("matchId") == matchId){
			return true;
		}
	}
	return false;
}

//if p1 or p2 are in a match, set this newly created row to "can't call" style
function checkInProgMatches(myRow, matchId, p1, p2){

	//is p1 or p2 a doubles team?


	//loop through all current tables and check duplicate names
	for (var i=0; i < eventList.length; i++) {
		for (var row = 2; row < eventList[i].children.length; row++) {
			if (eventList[i].children[row].getAttribute("matchId") != matchId) {
				var player1Name = eventList[i].children[row].children[0].innerHTML;
				var player2Name = eventList[i].children[row].children[1].innerHTML;

				var inProgMatch1 = false;
				var inProgMatch2 = false;
				if ((compareNames(p1, player1Name) || compareNames(p2, player1Name))) {
					if(eventList[i].children[row].children[3].getAttribute("stop") == "0"){
						inProgMatch1 = true;
					}
				}
				if (compareNames(p1, player2Name) || compareNames(p2, player2Name)) {
					if(eventList[i].children[row].children[3].getAttribute("stop") == "0"){
						inProgMatch2 = true;
					}
				}

				if(inProgMatch1 == true){
					//child 0 = player 1 name
					myRow.children[0].setAttribute("class", "cantCall");
				}

				if(inProgMatch2 == true){
					//child 1 = player 2 name
					myRow.children[1].setAttribute("class", "cantCall");
				}
			}
		}
	}
}

//a match was just assigned, check all the other matches for p1 and p2 names,
//set the matches found to "can't call" style.
function checkDupMatches(matchId, p1, p2, clearMyDups){


	for (var i=0; i < eventList.length; i++) {
		for (var row = 2; row < eventList[i].children.length; row++) {
			if (eventList[i].children[row].getAttribute("matchId") != matchId) {
				var player1Name = eventList[i].children[row].children[0].innerHTML;
				var player2Name = eventList[i].children[row].children[1].innerHTML;


				var dupMatch1 = false;
				var dupMatch2 = false;
				if (compareNames(p1, player1Name) || compareNames(p2, player1Name)) {
					dupMatch1 = true;
				}
				if (compareNames(p1, player2Name) || compareNames(p2, player2Name)) {
					dupMatch2 = true;
				}

				//player 1
				if(dupMatch1 == true){
					if(clearMyDups == true){
						eventList[i].children[row].children[0].setAttribute("class", "canCall");
					}else{
						eventList[i].children[row].children[0].setAttribute("class", "cantCall");
					}
				}else{
					if(eventList[i].children[row].children[0].getAttribute("class") != "cantCall"){
						eventList[i].children[row].children[0].setAttribute("class", "canCall");
					}
				}

				//player 2
				if(dupMatch2 == true){
					if(clearMyDups == true){
						eventList[i].children[row].children[1].setAttribute("class", "canCall");
					}else{
						eventList[i].children[row].children[1].setAttribute("class", "cantCall");
					}
				}else{
					if(eventList[i].children[row].children[1].getAttribute("class") != "cantCall"){
						eventList[i].children[row].children[1].setAttribute("class", "canCall");
					}
				}
			}
		}
	}
}


//-----------helper functions------------------
function getId(id){
	return document.getElementById(id);
}

function getPrevElement(element){
	var prevNode = element.previousSibling;
	while (prevNode.nodeType != 1){
		prevNode=prevNode.previousSibling;
	}
	return prevNode;
}

function timer(clockEle){
	var count = parseInt(clockEle.getAttribute("count")) + 1;
	var mins = Math.floor(count/60);
	var seconds = count % 60;
	clockEle.innerHTML = mins + ":" + seconds;
	clockEle.setAttribute("count", count+"");
	if (clockEle.getAttribute("stop") == "1") {
		return;
	} else {
		setTimeout(function () {timer(clockEle)}, 1000);
	}
}

function compareNames(name1, name2){
	//return true if name1 matches at least a part of name2
	//each name could be a team that contains 2 names. (Pockets/Kevin) all team members need to be checked.
	//if at least 1 team member is in name 2, return true

	var name1Array = name1.match(/\/?[^\/]+\/?/g);
	var name2Array = name2.match(/\/?[^\/]+\/?/g);

	if(name1Array.length < 1){
		name1Array = [name1];
	}

	if(name2Array.length < 1) {
		name2Array = [name2];
	}

	for(var i = 0; i < name1Array.length; i++) {
		var n1 = name1Array[i].replace("/","");

		for(var j = 0; j < name2Array.length; j++) {
			var n2 = name2Array[j].replace("/","");

			if(n1 == n2){
				return true;
			}
		}
	}

	return false;

}

//create player json, from the challonge playerList
function createPlayerHash(playerList){
	var playerHash = {};
	for(var i=0; i < playerList.length; i++){
		playerHash[playerList[i]['participant'].id] = playerList[i]['participant'].name;
	}

	return playerHash;
}

//Theme function
function setDarkTheme() {
	getId("cssTheme").href = 'theme_dark.css';
	window.app.test();
}

function setLightTheme() {
	getId("cssTheme").href = 'theme_light.css';
	window.app.test();
}
//----------------------------------------------

//testing functions
function removeRow(rowIndex) {
	delete matchRowHash[getId(rowIndex).getAttribute("matchId")];
	getId(rowIndex).parentElement.removeChild(getId(rowIndex));
}

//function submitScore(event) {
//	var myTable = event.target.parentElement.parentElement.parentElement;
//	getPrevElement(getPrevElement(event.target.parentElement)).setAttribute("stop", "1");
//	removeRow(event.target.parentElement.parentNode.getAttribute("id"));
//}

function refreshEvents() {
	for(var i=0; i < eventList.length; i++) {
		var eventName = eventList[i].getAttribute("tName");
		var matches = JSON.parse(window.cAPI.getMatches(eventName));

		for(var j = 0; j < matches.length; j++) {
			var state = matches[j].match.state;
			var id = matches[j].match.id + "";
			if(matchRowHash.hasOwnProperty(id) == true && state != "open") {
				removeRow(matchRowHash[id]);
			} else if(matchRowHash.hasOwnProperty(id) == false && state == "open") {
				createRow(eventList[i], matches[j].match);
			}
		}
	}
}
