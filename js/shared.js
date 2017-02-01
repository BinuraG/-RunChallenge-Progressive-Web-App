//////////////////////////////////////////////////////////////////////////
/*	
 * File: shared.js	
 * Purpose: Shared JS script
 * Author: Team2 MCD4290 (Binura, Devni, Uditha, Azad)
 * Last Modified: 18 Janury 2016	
 * Version: 2.0	
 * Licence: None
 * Syntax Style : K&R style	
 * HTML links : newRun.html, index.html, viewRun.html
 */
//////////////////////////////////////////////////////////////////////////	

// used to determine if the Run is an Re-Run. Set by the ViewRun page and used by the New Run page.
var isReRunCounter=false;

// Run Class Constructor
function Run()
{
	// Note: variables with suffix 'Position' contain coordinate objects from Navigator.Geolocation. Variables with the suffix 'Point' contain the respective google.maps.LatLng Objects of the aforesaid 'position' objects.
	var name,
		dateTime,
		startingCoordinates,
		endingCoordinates,
		startingPoint, 
		endingPoint,
		currentPoint,
		currentPosition,
		timeTaken,
		timeInSec,
		runCompletedStatus,
		distanceRun,
		distancetoEnd,
		displacement,
		averageSpeed;
	
	var runPoints= []; // record run path.
	var stringifiableRunPoints = [];
	
	// ACCESSOR AND MUTATOR METHODS FOR ALL PRIVATE ATTRIBUTES //
	
	// Mutator method for Run Name.
	this.setRunName = function(str){
		name = str;
	}
	
	// Accessor method for run name
	this.getRunName = function(){
		if(name===null || name === undefined){
			name = "The Run has no name!";
			return name;
		}else{
		return name;
		}
	}
	
	// Mutator for the map.
	this.setMapOfRun = function(map){
		mapOfRun = map;
	}
	
	// Accessor for the map.
	this.getMapOfRun = function(){
		return mapOfRun;
	}
	
	// Date object
	var currentdate = new Date();
	// saving it to a string.
	dateTime =	currentdate.getDate() + "/"
				+ (currentdate.getMonth()+1)  + "/" 
				+ currentdate.getFullYear() + " @ "  
				+ currentdate.getHours() + ":"  
				+ currentdate.getMinutes(); 
	
	// Accessor for date and time.
	this.getDateTime = function(){
	return dateTime;
	}
	
	//Mutator method for startingPoint
	this.setStartingPoint = function(start){
		startingPoint = start;
	}
	
	// Accessor method for startingPoint.
	this.getStartingPoint = function(){
		return startingPoint;
	}	
	
	//Mutator method for currentPoint
	this.setCurrentPoint = function(obj){
		currentPoint = obj;
	}
	
	// Accessor method for currentPoint.
	this.getCurrentPoint = function(){
		return currentPoint;
	}
	
	//Mutator method for currentPosition
	this.setCurrentPosition = function(obj){
		currentPosition = obj;
	}
	
	// Accessor method for currentPoint.
	this.getCurrentPosition = function(){
		return currentPosition;
	}
	
	// Mutator to push values into runPoints array.
	this.pushRunPoint = function(point){
		runPoints.push(point);	
	}
	
	// Accessor to return runPoints array.
	this.getRunPoints = function(){
		return runPoints;
	}
	
	//Mutator method for endingPoint
	this.setEndingPoint = function(end){
		endingPoint = end;
	}
	
	// Accessor method for startingPoint.
	this.getEndingPoint = function(){
		return endingPoint;
	}
	
	// Accessor and mutator for startingGeoLocationCoords
	this.setStartingCoordinates = function(value){
		startingCoordinates = value;
	}
	
	this.getStartingCoordinates = function(){
		return startingCoordinates;
	}
	
	// Mutator for geolocation ending coordinates.
	this.setEndingCoordinates = function(coords){
		endingCoordinates = coords;
	}
	
	// Accessor for geolocation ending coordinates.
	this.getEndingCoordinates = function(){
		return endingCoordinates;
	}
	
	// Mutator for RunCompletedStatus Boolean;
	this.setRunCompletedStatus = function(bool){
		
		if(bool===true){
			runCompletedStatus="Yes";
		}else{
			runCompletedStatus="No";
		}
		
	}// Accessor for RunCompletedStatus Boolean;
	this.getRunCompletedStatus = function(){
		return runCompletedStatus;
	}
	
	// Mutator for displacement
	this.setDisplacement = function(d){
		displacement=d;
	}
	
	// Accessor for displacement
	this.getDisplacement = function(){
		return displacement;
	}
	
	// Mutator and Accessor for distance to the end (distancetoEnd)
	this.setDistancetoEnd = function(d){
		distancetoEnd = d;
	}
	
	// Accessor for distance left to the end
	this.getDistancetoEnd = function(){
	 	return distancetoEnd;
	}
	
	// Accessor for distance run by user (distanceRun)
	this.getDistanceRun = function(){
		distanceRun = (displacement-distancetoEnd);
		return distanceRun;
	}
	
	// Accessor for AVERAGE SPEED
	this.getAverageSpeed = function(){
		var distanceRun = this.getDistanceRun();
		averageSpeed = (distanceRun/timeInSec);
		return averageSpeed;
	}
	
	//Stopwatch Function
	/* The timer is started when the function is called and continues until the quitRunButton
	* (in NewRun.html) is pressed. 
	* Displays to the textArea 'TimerArea' in NewRun.html;
	*/
	this.startTimer = function(domElement){
		
		var disp = document.getElementById(domElement),
		stop = document.getElementById('QuitRunButton'),
		seconds = 0, minutes = 0, hours = 0, t;

		function add() {
			seconds++;
			if (seconds >= 60) {
				seconds = 0;
				minutes++;
				if (minutes >= 60) {
					minutes = 0;
					hours++;
				}
			}	
			// create a Time display string
			timeTaken = (hours ? (hours > 9 ? hours: "0" + hours) :"00")+":"+ 
				(minutes ? (minutes > 9 ? minutes: "0" + minutes) :"00")+":"+ 
				(seconds > 9 ? seconds: "0" + seconds);
			// calculate the time in seconds...
			timeInSec = seconds+(minutes*60)+(hours*3600);
			// Output time.
			disp.value = timeTaken;
			timer();
		}
		
		function timer(){
			t = setTimeout(add, 1000);
		}
		timer();
		// stop timer
		stop.addEventListener('click', function() {
			clearTimeout(t);
			
		});
		
	}
	
	// Accessor method to get Total run time (timeTaken)
	this.getTimeTaken = function(){
		return timeTaken;
	}
	
	// Accessor method to get Total run time in seconds.
	this.getTimeInSeconds = function(){
		return timeInSec;
	}
	
	// public fuction to display Run infomation to a passed div element.
	this.displayRunInfo = function(divName){
	
		var distanceRun = this.getDistanceRun();
		var avgSpeed = this.getAverageSpeed();
		document.getElementById(divName).innerHTML+=		
		'RUN <b>SUMMARY <i class="material-icons" style="font-size:17px">directions_run</i><i class="material-icons" style="font-size:17px">flag</i></b><br>'+dateTime+
			"<br><ul>"+
			//"<li><b>Starting Coordinates:</b>    "+newRun.startingPoint+"</li>"+
			//"<li><b>Destination Coordinates:</b> "+newRun.endingPoint+"</li>"+
			"<li><b>Total Run Time:</b> "+timeTaken+"</li>"+
			"<li><b>Run Completed?:</b> "+runCompletedStatus+"</li>"+
			"<li><b>Distance Run:</b> "+distanceRun.toFixed(2)+" m</li>"+
			"<li><b>Average Speed:</b> "+avgSpeed.toFixed(2)+" m/s</li></ul>";
	}
	
	// Function returns the array of LatLng objects to an array of 'stringifiable' objects for local storage.
	function stringifyRunPoints (){
		for(var i = 0; i < runPoints.length; i++) {
			
			var obj = new Object();
			
			obj['lat'] = runPoints[i].lat();			
			obj['lng'] = runPoints[i].lng();
			
			stringifiableRunPoints.push(obj);
		}
		return stringifiableRunPoints; 
	}
	
	// Accessor for the stringified run path array.
	this.getStringifiableRunPoints =function(){
		var arr = stringifyRunPoints();
		return arr;
	}
	
	/* Constructor class to create a JSON-stringifiable object of the Run class. 
	* JSON does not support complex objects therefore a simpler object  
	* is created from this function to be stringified.
	*/
	this.getStringifiableData =function()
	{	
		var JsonClass = function(){
			// Stores all required attributes.
			this.name = name;
			this.dateTime = dateTime;
			this.timeTaken = timeTaken;
			this.distanceRun = distanceRun.toFixed(2);
			this.runCompletedStatus = runCompletedStatus;
			this.averageSpeed = averageSpeed.toFixed(2);
			this.distance = distancetoEnd.toFixed(2);
			this.runPoints = stringifyRunPoints();

			// Starting Coordinates
			this.starting_lat = startingCoordinates.lat;
			this.starting_lng = startingCoordinates.lng;

			// ending Coordinates
			this.ending_lat = endingCoordinates.lat;
			this.ending_lng = endingCoordinates.lng;
		}
		// Create a new instance of this constructor and return it.
		var obj = new JsonClass();
		return obj;
	}

	
} // end of Run constructor

//*** Function: getLatLngRunPoints(data) ***//
/* Function: converts an array of stringified run points to an LatLng 
* Object Array to be drawn in view Run.
*>Input: array of stringified data.(data)
*>Output: array of Latlng objects.*/
function getLatLngRunPoints(data){

	var runPoints=[];
	
	for(var i = 0; i < data.length; i++) {

		var latLngObj = new google.maps.LatLng(data[i].lat,data[i].lng);
		runPoints.push(latLngObj);
	}
	return runPoints;
}

//*** Function: saveRun(runObj) ***//
/* Function to pass any given JSON-compatible Run Object to the local Storage. 
* INPUT: runObj - this instance must be constructed from the class JsonRunObject */
function saveRun(runObj)
{
	var APP_PREFIX = "monash.mcd4290.bin.runChallengeApp.";
	// Check if the browser supports local storage
	if (typeof(Storage) !== undefined){
		
		// Check if the program is saving for the first time or not
		if (localStorage.getItem(APP_PREFIX+'runIndex')===null){	
			// Initialize the local storage for further use.
			var runIndex = 0;
			localStorage.setItem(APP_PREFIX+'runIndex', runIndex);
		}
		
		// Obtain the run index number.
		var runIndex = localStorage.getItem(APP_PREFIX+'runIndex');
		// Stringify the run object.
		//var JSONrunObj = new JSON.stringify(runObj);
		// Store the JSON run object in local storage.
		localStorage.setItem(APP_PREFIX+runIndex, JSON.stringify(runObj));
		
		// Iterate the run index number
		runIndex++;
		
		// Store it.
		localStorage.setItem(APP_PREFIX+'runIndex',runIndex);

	} else {
		
		alert("Your browser does not support local storage. Update or change browser.");
	}
}

//*** Function: getRun(runIndex) ***//
// Function to retrieve any passed Run Object index Number from the local Storage.
// The returned object is already parsed into a normal JS object.
// INPUT: index key for the retrievable run object.
// RETURNS: parsed run object in JS literal format.
function getRun(runIndex){
	
	var APP_PREFIX = "monash.mcd4290.bin.runChallengeApp.";
	
	// Check if the browser supports local storage
	if (typeof(Storage) !== undefined){
		
		var retrievedRunObject = localStorage.getItem(APP_PREFIX+runIndex);
		
		return JSON.parse(retrievedRunObject);
				
	} else {
		alert("Your browser does not support local storage. Update or change browser.");
	}
}

//*** Function: createViewPage(i)***//
// Function in shared js file to switch to the viewRunPage when a specific Run Card is pressed in the index.html
function createViewPage(i)
{	
	// Set the current index in use to the local storage as .currentIndex so that it can be retrieved from the ViewRunPage.js script.
	var APP_PREFIX = "monash.mcd4290.bin.runChallengeApp.";
	var currentIndex = i;
	localStorage.setItem(APP_PREFIX+'.currentIndex',currentIndex);
}

//*** Function: loadNewRunPage()***//
// Function ensures a the New Run page loads a fresh run and not a Re-attempt. Called by the two buttons on the index.html page. 
function loadNewRunPage(){
	localStorage.setItem('isReRun', "0");
	window.location.href = "newRun.html";
}

// This function displays the given message String as a "toast" message at
// the bottom of the screen.  It will be displayed for 2 second, or if the
// number of milliseconds given by the timeout argument if specified.
function displayMessage(message, timeout)
{
    if (timeout === undefined)
    {
        // Timeout argument not specifed, use default.
        timeout = 2000;
    } 

    if (typeof(message) == 'number')
    {
        // If argument is a number, convert to a string.
        message = message.toString();
    }

    if (typeof(message) != 'string')
    {
        console.log("displayMessage: Argument is not a string.");
        return;
    }

    if (message.length == 0)
    {
        console.log("displayMessage: Given an empty string.");
        return;
    }

    var snackbarContainer = document.getElementById('toast');
    var data = {
        message: message,
        timeout: timeout
    };
    if (snackbarContainer && snackbarContainer.hasOwnProperty("MaterialSnackbar"))
    {
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
}


