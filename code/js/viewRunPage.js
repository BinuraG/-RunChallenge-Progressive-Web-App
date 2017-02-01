// Code for the View Run page.
var map= null;
var infoWindow = null;
var dest_infoWindow = null; //destination infoWindow used in function createNewRun() requires gloabl scope intialization.


function initMap() 
{	
	var run;
	window.onload = function(){ // Run when the DOM has finished loading...
	
		// Retrieve the CurrentIndex of the selected run from local storage.
		var APP_PREFIX = "monash.mcd4290.bin.runChallengeApp.";
		var currentIndex = localStorage.getItem(APP_PREFIX+'.currentIndex');

		// Retrieve Run information from Local Storage
		run = getRun(currentIndex);
		
		// Get starting and ending infomation from the run object.
		var start = new google.maps.LatLng(run.starting_lat, run.starting_lng);
		var end = new google.maps.LatLng(run.ending_lat, run.ending_lng);
		
						// Initialize new map object from Google Maps API
		map = new google.maps.Map(document.getElementById('map'),{
			center: start,
			zoom: 18,
			styles: [
				{elementType: 'geometry', stylers: [{color: '#242f3e'}]},
				{elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
				{elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
				{
				  featureType: 'administrative.locality',
				  elementType: 'labels.text.fill',
				  stylers: [{color: '#d59563'}]
				},
				{
				  featureType: 'poi',
				  elementType: 'labels.text.fill',
				  stylers: [{color: '#d59563'}]
				},
				{
				  featureType: 'poi.park',
				  elementType: 'geometry',
				  stylers: [{color: '#263c3f'}]
				},
				{
				  featureType: 'poi.park',
				  elementType: 'labels.text.fill',
				  stylers: [{color: '#6b9a76'}]
				},
				{
				  featureType: 'road',
				  elementType: 'geometry',
				  stylers: [{color: '#38414e'}]
				},
				{
				  featureType: 'road',
				  elementType: 'geometry.stroke',
				  stylers: [{color: '#212a37'}]
				},
				{
				  featureType: 'road',
				  elementType: 'labels.text.fill',
				  stylers: [{color: '#9ca5b3'}]
				},
				{
				  featureType: 'road.highway',
				  elementType: 'geometry',
				  stylers: [{color: '#746855'}]
				},
				{
				  featureType: 'road.highway',
				  elementType: 'geometry.stroke',
				  stylers: [{color: '#1f2835'}]
				},
				{
				  featureType: 'road.highway',
				  elementType: 'labels.text.fill',
				  stylers: [{color: '#f3d19c'}]
				},
				{
				  featureType: 'transit',
				  elementType: 'geometry',
				  stylers: [{color: '#2f3948'}]
				},
				{
				  featureType: 'transit.station',
				  elementType: 'labels.text.fill',
				  stylers: [{color: '#d59563'}]
				},
				{
				  featureType: 'water',
				  elementType: 'geometry',
				  stylers: [{color: '#17263c'}]
				},
				{
				  featureType: 'water',
				  elementType: 'labels.text.fill',
				  stylers: [{color: '#515c6d'}]
				},
				{
				  featureType: 'water',
				  elementType: 'labels.text.stroke',
				  stylers: [{color: '#17263c'}]
				}
]	
		});
		// Call displayViewPage function to create the page elements.
		displayViewPage(run);	

		// Draw the run path run by the User using a polyline. Calling the createRunPathPoly() function.
		var runPath = getLatLngRunPoints(run.runPoints);
		createRunPathPoly(runPath);
		// Function: Draws a Polyline for a given array of LatLng objects.
		function createRunPathPoly(runPathArray){

			var runPathPoly = new google.maps.Polyline({
				  path: runPathArray,
				  geodesic: true,
				  strokeColor: '#00ff31',
				  strokeOpacity: 1.0,
				  strokeWeight: 6
				});
			runPathPoly.setMap(map);
		};
	 
		var requestPath = {
			origin: start,
			destination: end,
			travelMode: google.maps.TravelMode.WALKING
		};

		// API obj.s
		var directionsService = new google.maps.DirectionsService();
		directionsDisplay = new google.maps.DirectionsRenderer({
			preserveViewport: true}); // set to stop map from zooming or panning once directions are rendered.

		// Request a path from start -> end, if recieved from google, draw the path onto the Map.
		directionsService.route(requestPath, function(response, status) {
			if(status=== google.maps.DirectionsStatus.OK){
				directionsDisplay.setDirections(response);
				directionsDisplay.setMap(map);
			}else { 	//display error
				alert("Directions Request Failed!");
			}
		});		
	}
}


function displayViewPage(run)
{
	// Change Header Bar title to the Run Name
	document.getElementById("headerBarTitle").innerHTML = run.name;
	// Change Body Color
	document.body.style.backgroundColor='#1f2835';
	
	var text = document.getElementById('text');
	
	if(run.runCompletedStatus==="No"){
		text.innerHTML = '<i class="material-icons" style="font-size:17px">warning</i> '+' <strong> INCOMPLETED RUN!<br></strong>';
	};
	
	text.innerHTML += '<ul>'+
			'<li>'+'<b> Run Name: </b>'+run. name+"<br>"+
			'<li>'+'<b> Date & Time: </b>'+run.dateTime+"<br>"+
			'<li>'+	'<b> Run Time: </b>'+run.timeTaken+"<br>"+
			'<li>'+	'<b> Route Distance: </b>'+run.distance+"m<br>"+
			'<li>'+	'<b> Distance Run: </b>'+run.distanceRun+" m<br>"+
			'<li>'+	'<b> Average Speed: </b>'+run.averageSpeed+" m/s<BR></ul>";
}

// DOM buttons
// Delete Run Button Function
document.getElementById('deleteRun').addEventListener('click',function(){
	
	var APP_PREFIX = "monash.mcd4290.bin.runChallengeApp.";
	// Load the current index number
	var currentIndex = localStorage.getItem(APP_PREFIX+'.currentIndex');
	// Delete the corresponding Run object from local storage.
	localStorage.removeItem(APP_PREFIX+currentIndex);
	// Return to home page.
	window.location.href = "index.html";
});

document.getElementById('ReattemptRunBtn').addEventListener('click',function(){
	localStorage.setItem("isReRun","1");
	window.location.href= "newRun.html";
	
});
