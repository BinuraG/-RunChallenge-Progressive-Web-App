//////////////////////////////////////////////////////////////////////////
/*	
 * File: newRunPage.js	
 * Purpose: JS script for the New Run Interfact (as well for the Re-
 * attempt run)	
 * Author: Team2 MCD4290 (Binura, Devni, Uditha, Azad)
 * Last Modified: 17 Janury 2016	
 * Version: 2.0	
 * Licence: None
 * Syntax Style : K&R style	
 * HTML links : newRun.html	
 */
//////////////////////////////////////////////////////////////////////////	

// Global-scope variable declarations
// These objects (3) have private attributes from Googles Map API classes.
var map = null;
var dest_infoWindow = null; //destination infoWindow used in function createNewRun() requires gloabl scope intialization.
var directionsDisplay = null; // google.maps.Directio+nsRender Object, used by function drawRunPath(). Requires gloabl scope.
// global instance of a Run. All object attributes and methods are private and cannot be accessed without explicit accessor/mutator methods.
var newRun;
// Global control variable to stop the GPS and run-in progress.
var timerUpdateLocation, runInProgressVar;

//*** Function handle window.onload ***//
// This function handle is run when the DOM has completely initialized.
// Used to prevent asyncronities with the script loading before the DOM is loaded.
// Inputs / Returns : none
window.onload = function() {
    // Change Body Color
    document.body.style.backgroundColor = '#1f2835';

    // Buttons are initially disabled.
    document.getElementById('createDestinationButton').disabled = true;
    document.getElementById('RUNButton').disabled = true;
}

// Map Initialisation callback function.
function initMap() {
    // local variable declaration.
    var currentPos;
    var currentPosMarker = null;
    var circle = null; // accuracy circle

    // First check if this is a new Run or an Re-attempt Run.
    var isReRun = localStorage.getItem('isReRun');

    // If this is a Re-Attempt Run...
    if (isReRun === "1") {

        // Change Header bar title for a Re-Ren Attempt.
        document.getElementById('headerBarTitle').innerHTML = '<b>Re-Attempting</b> Run';
        // Hide the random location generation button
        document.getElementById('createDestinationButton').style.display = "none";
        // Change Run button text
        document.getElementById('RUNButton').innerHTML = '<i class="material-icons">directions_run</i> Re-Attempt Run Now!';

        // Retrieve the CurrentIndex of the selected run from local storage.
        var APP_PREFIX = "monash.mcd4290.bin.runChallengeApp.";
        var currentIndex = localStorage.getItem(APP_PREFIX + '.currentIndex');

        // Retrieve the Run information from Local Storage
        var run = getRun(currentIndex);
        // initialize LatLng objects from Google's map class for the start and end.
        var start = new google.maps.LatLng(run.starting_lat, run.starting_lng);
        var end = new google.maps.LatLng(run.ending_lat, run.ending_lng);

        // Initialize a new Run instance of the Run class and set it's properties to the re-attempted Run's properties.
        newRun = new Run();
        newRun.setStartingPoint(start);
        newRun.setEndingPoint(end);
        var startingCoords = {
            lat: run.starting_lat,
            lng: run.starting_lng
        }
        newRun.setStartingCoordinates(startingCoords);

        var endingCoords = {
            lat: run.ending_lat,
            lng: run.ending_lng
        }
        newRun.setEndingCoordinates(endingCoords);
        newRun.setDisplacement(run.distance);

        // Call drawRunPath to display the saved run.
        drawRunPath();

        // Else if this a fresh New Run..
    } else if (isReRun === "0") // if the Run is a fresh run create new Run Instance.
    {
        // Create a new instance of the Run class.
        newRun = new Run();
    }

    // Initialize new map object from Google Maps API
    map = new google.maps.Map(document.getElementById('map'), {
        center: start,
        zoom: 17,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#263c3f' }]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#6b9a76' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#38414e' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#212a37' }]
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9ca5b3' }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#746855' }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#1f2835' }]
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#f3d19c' }]
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{ color: '#2f3948' }]
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#17263c' }]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#515c6d' }]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#17263c' }]
            }
        ] // Dark theme styling
    });

    //update the current location every 1s. (+50ms to avoid displayMessege() latency)
    timerUpdateLocation = setInterval(updateCurrentLocation, 1050);

    //*** Encapsulated Function : updateCurrentLocation() ***//
    // This function calls the HTML Geolocation service and obtains user position and accuracy.
    // Returns : User position rendered on the Map instance.
    function updateCurrentLocation() {

        if (navigator.geolocation) { // If geolocation service is supported by the browser...

            // Use Geolocation to obtain user coordinates and position accuracy
            navigator.geolocation.getCurrentPosition(function(position) {

                var position = {
                    lat: position.coords.latitude, // user lattitude
                    lng: position.coords.longitude, // user longitude
                    accuracy: position.coords.accuracy // user's location accuracy in meters.
                };

                // Accessor to newRun object to set current position. (Only coordinates not a LatLng object)
                newRun.setCurrentPosition(position);

                // Disable the createDestination button if the user's accuracy is below 20m
                if (position.accuracy > 20) {
                    // Inform the user 
                    displayMessage("Your Location Accuracy of " + position.accuracy.toFixed(0) + "m is Insufficient.", 1000);

                    // Else If location is sufficient...	
                } else {

                    // Check If this is a Re-Attempt Run, call checkReAttemptLocationValidity()
                    if (isReRun === "1") {
                        checkReAttemptLocationValidity();

                        // Else, enable the create destination button.	
                    } else {
                        document.getElementById('createDestinationButton').disabled = false;
                    }
                }

                // Create a LatLng Object from the position Coordinates.	
                var currentPoint = new google.maps.LatLng(position.lat, position.lng);

                //update the run object current position attribute.
                newRun.setCurrentPoint(currentPoint);

                // update the positions of previous marker and accuracy circle if any
                if (currentPosMarker !== null) {

                    currentPosMarker.setPosition(currentPoint); // Position marker update

                    circle.setCenter(currentPoint); // Accuracy circle update

                } else {

                    //Instantialize new Marker
                    currentPosMarker = new google.maps.Marker({
                        position: currentPoint,
                        map: map,
                        title: 'Current Position',
                        icon: 'images/custom-marker1.png' // using a custom marker.
                    });

                    // Encapsulated function returns a accuracy circle.
                    // Instantialize a new accuracy circle. 
                    // Inputs: (map, coordinates, accuracy)
                    // Returns: google.maps.circle object.
                    var addCircle = function(map, coordinates, accuracy) {
                        var circleOptions = {
                            center: coordinates,
                            clickable: false,
                            fillColor: "lightblue",
                            fillOpacity: 0.10,
                            map: map,
                            radius: accuracy,
                            strokeColor: "lightblue",
                            strokeOpacity: 0.5,
                            strokeWeight: 3
                        };

                        circle = new google.maps.Circle(circleOptions);
                        return circle;
                    };

                    // Add the circle to the map by calling addCircle();	 
                    var accuracy = position.accuracy;
                    addCircle(map, currentPoint, accuracy);
                }

                // Pan the map to move with the user.
                map.setCenter(currentPoint);

            });

            // Error handling if geolocation fails...	
        } else {
            alert("Error: Your browser does not support Geolocation. Update or switch to google Chrome.");
        }
    };
}


//*** Function :createNewRun() ***//
// function when called creates a random destination + or - 0.001 off the user's
// current coordinates.
// Input : uses NewRun object's private attributes using the accessors.
// Output: Sets NewRun object's private attributes using the mutators.
function createNewRun() {
    var properDistance = false // jump starting the while loop
    // checking if there are any previous end destination markers open from previous calls to createNewRun().
    if (dest_infoWindow !== null) {
        // Removing that marker before creating a new destination.
        dest_infoWindow.setMap(null);
    }

    while (properDistance === false) {

        //Set starting coordinate values to the run instance.
        newRun.setStartingCoordinates(newRun.getCurrentPosition());
        newRun.setStartingPoint(newRun.getCurrentPoint());

        // Access required values from the newRun Object
        var startingPosition = newRun.getStartingCoordinates();
        var start = newRun.getStartingPoint();

        var sC_lat = startingPosition.lat;
        var sC_lng = startingPosition.lng;
        // creating a destination LatLng Object by shiting coords by +-0.001 units.

        // Random Location Generation based on + or - 0.001 off the current user location.
        var rand = Math.round(Math.random());
        if (rand % 2 === 1) {
            var endingPosition = {
                lat: sC_lat + (Math.random() * 0.001),
                lng: sC_lng + (Math.random() * 0.001)
            };
        } else {
            var endingPosition = {
                lat: sC_lat - (Math.random() * 0.001),
                lng: sC_lng - (Math.random() * 0.001)
            };
        }

        var end = new google.maps.LatLng(endingPosition); // create LatLng for the end location.

        // Call object mutator method to set endingPoint
        newRun.setEndingCoordinates(endingPosition);
        newRun.setEndingPoint(end);

        //Calculating the distance between the two positions.
        var distance = google.maps.geometry.spherical.computeDistanceBetween(start, end);

        // Call run Obj. mutator to set displacement.
        newRun.setDisplacement(distance);
        //Check if the generated position falls within the requirements.
        if (distance > 60 && distance < 150) {
            properDistance = true; // set the boolean counter to true.
        }
    }

    // display a new InfoWindow at the destination with the displacement infomation.
    dest_infoWindow = new google.maps.InfoWindow({
        map: map,
        position: end,
        content: '<div style="yellow">Your Destination<br>(' + distance.toFixed(0) + 'm away)</div>'
    });

    //Invoke function drawRunPath() function to request walking directions from google.
    drawRunPath();
}

//*** Function : drawRunPath() ***//
// Function uses google.maps.DirectionsService to create a WALKING path for the user.
// Input : uses NewRun object's private attributes using the accessors.
// Returns : none. Renders path on map instance using directionsDispaly object.
function drawRunPath() {
    //check for any paths drawn before, if there is a previous paths, remove it.
    // This allows new destinations to be drawn everytime the button is clicked.
    if (directionsDisplay !== null) {
        directionsDisplay.setMap(null);
    }

    var start = newRun.getStartingPoint();
    var end = newRun.getEndingPoint();
    // creating a request object to be sent to google services.
    var requestPath = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.WALKING // Request walking directions
    };

    // API obj.s
    var directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer({
        preserveViewport: true
    }); // set to stop map from zooming or panning once directions are rendered.

    // Request a path from start -> end, if recieved from google, draw the path onto the Map.
    directionsService.route(requestPath, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            directionsDisplay.setMap(map);
        } else { //display error
            alert("Directions Request Failed!");
        }
    });
}

//*** Function : runInProgress() ***//
// Function called when the 'Get Running' Button is pressed.
// Inputs : none.
// Returns : none. Changes the DOM dynamically and prepares the interface for a Run.
function runInProgress() {
    // Save the current position as the Starting Point and position of the run.
    newRun.setStartingPoint(newRun.getCurrentPoint());
    newRun.setStartingCoordinates(newRun.getCurrentPosition());

    // Global scope setInteval stop variable declaration.
    runInProgressVar = setInterval(function() {

        // Record the Run path.
        newRun.pushRunPoint(newRun.getCurrentPoint());

        var end = newRun.getEndingPoint(); // Get the ending position.

        // Compute the distance between the ending point and user location.
        var distancetoEnd = google.maps.geometry.spherical.computeDistanceBetween(newRun.getCurrentPoint(), end);

        // Call obj. mutator to set distancetoEnd
        newRun.setDistancetoEnd(distancetoEnd);

        // Tell the user the remaining distance on the Quit button itself.
        document.getElementById('QuitRunButton').innerHTML = "<b><I>QUIT RUN </I>-</b> Just " + distancetoEnd.toFixed(1) + "m to go! <I>Don't give up!</I>"

        // if the user has reached the destination, end the run.
        if (distancetoEnd <= 10) {
            // inform the user that he has completed the run.
            displayMessage("Congratulations! You just completed your Run!", 4000);

            var runComplete = true; // Will be used to later identify if the run is incomplete.
            newRun.setRunCompletedStatus(runComplete);

            // simulate the click of the quit button.
            document.getElementById('QuitRunButton').click();
        } else {

            var runComplete = false;
            newRun.setRunCompletedStatus(runComplete);
        }
    }, 2500); // update every 2.5s	 
}

//*** Function : checkReAttemptLocationValidity() ***//
// Function only called if it is a Reattempt run.
// Checks if the user is at the saved starting point and only allows the user to start the run
// if he is at the proper location.
// Input : uses NewRun object's private attributes using the accessors.
// Returns : none.
function checkReAttemptLocationValidity() {

    // Hide the createDestination Button.
    document.getElementById('createDestinationButton').style.visibility = "hidden"

    // Timeout the location check every 5s.
    setTimeout(checkDistance, 50);
    var stopChecking = setInterval(checkDistance, 5000);

    // Encapsulated Function will be called every 5 seconds to check the user location is at the starting point.
    function checkDistance() {

        //Obtain user location from geolocation.
        navigator.geolocation.getCurrentPosition(function(position) {

            // startingPosition contains the latitute and longitude from the navigator.geolocation class
            var userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
            };

            // Obtain starting point infomation from the run instance and compute the distance to it from current position.
            var start = newRun.getStartingPoint();
            var userPositionLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);
            var checkDistance = google.maps.geometry.spherical.computeDistanceBetween(userPositionLatLng, start);
            // if the distance is below 20m, the user is eligible to start the run.
            if (checkDistance < 20) {
                // Stop the Re-Checking Process.
                clearInterval(stopChecking);

                // display messege only once.
                if (document.getElementById('RUNButton').disabled === true) {
                    displayMessage("You are at the starting location. You can start your run!", 5000);
                }

                // Change the Buttons to initiate a Run.
                document.getElementById('RUNButton').disabled = false;

                // Check the mandotary counter to initiate the startRun() method.
                dest_infoWindow = "1";


            } else {
                // Display error messege to the user and request him to retry from the actual starting position.
                displayMessage("You are " + checkDistance.toFixed(0) + "m away from the Saved Starting Point! I will re-check your location again in 5 seconds...", 6000);
            }
        });
    };
}


// Function to reload the page.
function reloadPage() {
    window.location.href = "newRun.html";
}

//***DOM : 'Create Destination' Button
// Invoking the CreateNewRun() method when the "Create a new Destination" Button is pressed.
if (document.getElementById('createDestinationButton')) {
    document.getElementById('createDestinationButton').addEventListener('click', function() {
        createNewRun(); // Call the createNewRun() function.
        if (dest_infoWindow !== null) {
            // Enable the Run button if a destination has been generated.
            document.getElementById('RUNButton').disabled = false;
        }
    });
}
//***DOM : 'Get Running!' Button (start run button)
// When the Start RUN button is pressed...
if (document.getElementById('RUNButton')) { // if check to prevent DOM error returns when the element is hidden.
    document.getElementById('RUNButton').addEventListener('click', function startRun() {
        // Check if a destination has been set before starting the Run...
        if (dest_infoWindow !== null) {

            //change body color back to white.
            document.body.style.backgroundColor = '#fff';

            // Invoke runInProgress() to keep track of user position.
            runInProgress();

            //hide current buttons.
            document.getElementById('newRunButtonDiv').style.display = 'none';

            // The size of the map is reduced to compensate for the new interface.
            document.getElementById('map').style.height = 'calc(100vh - 185px)';

            //Enabling the new interface StartedRunningDiv. (Quit button and timer)
            document.getElementById('startedRunningDiv').style.display = 'inline-block';

            //Resetting and calling the stopwatch function startTimer() to initiate.
            document.getElementById('TimerArea').value = "00:00:00";

            newRun.startTimer('TimerArea'); //initiate stopwatch.

            //Toast Message to the user.
            displayMessage("Your Run will automatically end when you are close to your destination!", 3500)

        } else {
            // Dispaly a messege asking the user to select a destination first.
            displayMessage("Create a Destination before starting a new Run!!")
        }
    });
}

//***DOM : QUIT BUTTON
//If the Quit RUN button is pressed... 
if (document.getElementById('QuitRunButton')) { // if check to prevent DOM error returns when the element is hidden.
    document.getElementById('QuitRunButton').addEventListener('click', function() {
        // Stop tracking user location and the run in progress.
        clearInterval(timerUpdateLocation);
        clearInterval(runInProgressVar);
        // Change Body Color
        document.body.style.backgroundColor = '#1f2835';
        // display infoCard
        document.getElementById("clearAfterRunDiv").innerHTML = "";
        document.getElementById('runInfoCard').style.display = 'block';

        // Display infomation about the run in the newly displayed material card...
        newRun.displayRunInfo("runInfo");

    });
}

//***DOM : Save Run Button
// Instructions for when the "save Run" button is pressed on the summary card.
if (document.getElementById('saveRunButton')) { // if check to prevent DOM error returns when the element is hidden.
    document.getElementById('saveRunButton').addEventListener('click', function() {

        // Take the string given as the name of the run and pass it to the Run Object's name property.
        var nameStr = document.getElementById('nameRunInput').value;
        newRun.setRunName(nameStr);

        // Create a JSON compatible run object as newRun is too complex to be stringified.
        var JsonRunObject = newRun.getStringifiableData();

        // Send the JSON compatible Run Object to local storage
        saveRun(JsonRunObject);
        // Take user back to the home page.
        window.location.href = 'index.html';

    });
}
