////////////////////////////////////////////////////////////
/*	
 * File: main.js	
 * Purpose: Homepage JS script to display previous runs.
 * Author: Team2 MCD4290 (Binura, Devni, Uditha, Azad)
 * Last Modified: 16 Janury 2016	
 * Version: 2.0	
 * Licence: None
 * Syntax Style : K&R style	
 * HTML links : newRun.html, index.html, viewRun.html
 */
///////////////////////////////////////////////////////////

// Global Scope Declartions
var currentRunIndex,i;	// index key of the run card pressed by the user.

// Function Handle called when DOM finishes loading.
window.addEventListener("load", function() 
{	// JS trick to hide the adress bar in some browsers
	//(if the app hasn't been added to the homescreen)
	window.scrollTo(0, 1); 
});

// Call displayRuns();
displayRuns();

//*** Function: displayRuns() ***//
/*Retrieves previous run data and displays them in dynamically generated
* Material cards on the homescreen.*/
function displayRuns()
{
	// Assign HTML elements in index.html to variables.
	var mainDiv = document.getElementById('prevRunDiv');
	var dispDiv = document.getElementById('testList');
	
	var APP_PREFIX = "monash.mcd4290.bin.runChallengeApp.";
	// Retrieve from local storage the current run index key.
	currentRunIndex =Number(localStorage.getItem(APP_PREFIX+'runIndex'));

	if(currentRunIndex === null){	// If there are no previous saved runs...

		dispDiv.innerHTML = "You have no previous saved Runs!";

	}else{	// If there are previous runs saved in the localStorage...

		i = currentRunIndex-1; // COUNTER	

		while( i >= 0 ){
			
			// Retrieve all the saved runs from local storage using getRun() method.
			var runObj = getRun(i);
			
			//checking and skipping deleted runs from View Run.
			if(runObj===null || runObj===undefined){
				--i; //skip
				
			// If the run is not deleted continue..
			}else {
				var btn = document.createElement('div');
				mainDiv.appendChild(btn);
				btn.className="divBtn mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effec";

				// Set Button Id as the index value for future referencing.
				btn.id=i;

				// Set an onclick attribute to the element that calls the function 
				btn.setAttribute('onclick','createViewPage('+i+'); location.href="viewRun.html";');

				// If the Run is incomplete set the left border color to Red.
				if(runObj.runCompletedStatus==="No"){

					btn.style.borderLeft = '5px outset red';
				// If the Run is complete set the left border color to Green.
				}else {
					btn.style.borderLeft = '5px outset green';
				}

				// Set the Contents (infomation about the run) on created element.
				btn.innerHTML =
					'    <br><strong><i class="material-icons">place</i>&nbsp&nbsp&nbsp'+runObj.name+
					'</strong> | '+
					runObj.dateTime+"h<BR><BR>"+
					'<b>» Run Time: </b>'+runObj.timeTaken+"<br>"+
					'<b>» Distance Run: </b>'+runObj.distanceRun+" m<br>"+
					'<b>» Average Speed: </b>'+runObj.averageSpeed+" m/s<BR>";

				
				--i; //decrement counter
			}
		}
	}
}

