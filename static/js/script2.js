/* initialization of different variables
to be used in Count-Up App*/
var clearTime;
var seconds = 0,
  minutes = 25,
  hours = 0;
  break_on = 0;
var secs, mins, gethours;
var pomodoro_score = 0;
var pomodoro_start = 0;
var work_start = 0;
var continueButton_key = 0;

function startWatch() {

  if (seconds === 0) {
    seconds = 59;
    minutes = minutes - 1;
  }

  mins = minutes < 10 ? "0" + minutes + ": " : minutes + ": ";

  gethours = hours < 10 ? "0" + hours + ": " : hours + ": ";
  secs = seconds < 10 ? "0" + seconds : seconds;

  var continueButton = document.getElementById("continue");
  continueButton.removeAttribute("hidden");

  var pauseButton = document.getElementById("pause");
  pauseButton.removeAttribute("hidden");

  var stopButton = document.getElementById("stop");
  stopButton.removeAttribute("hidden");

  /* display the Count-Up Timer */
  var x = document.getElementById("timer");
  x.innerHTML = mins + secs;

  /* display the current activity */
  var a = document.getElementById("section");
  a.innerHTML = "Time for Work!";

  if (minutes == 0 && seconds == 1) {
    //x.innerHTML = "bitti amk";
    //window.alert(12 + 3);
    seconds = 0;
    minutes = 5;
    break_on = 1000;
    pomodoro_score = pomodoro_score + 1;
    if (pomodoro_score === 1){
        document.getElementById('worktime').innerHTML = "Work times: ";
    }
    var html_to_insert = "✔";
    document.getElementById('worktime').innerHTML += html_to_insert;
    startTime();
  }
  else{
    seconds--;
    clearTime = setTimeout("startWatch( )", 1000);
  }
}

function BreakTime() {

  if (seconds === 0) {
    seconds = 59;
    minutes = minutes - 1;
  }

  mins = minutes < 10 ? "0" + minutes + ": " : minutes + ": ";

  gethours = hours < 10 ? "0" + hours + ": " : hours + ": ";
  secs = seconds < 10 ? "0" + seconds : seconds;

  var continueButton = document.getElementById("continue");
  continueButton.removeAttribute("hidden");

  /* display the Count-Up Timer */
  var x = document.getElementById("timer");
  x.innerHTML = mins + secs;

  /* display the current activity */
  var a = document.getElementById("section");
  a.innerHTML = "Time for Break!";
  if (pomodoro_score === 4){
        document.getElementById('scores').innerHTML = "Pomodoro score: ";
  }
  if (minutes == 0 && seconds == 1) {
    //x.innerHTML = "bitti amk";
    //window.alert(12 + 3);
    seconds = 0;
    minutes = 25;
    break_on = 0;

    if (pomodoro_score % 4 === 0){
      var pomodoro_symbol = "🍎";
      document.getElementById('scores').innerHTML += pomodoro_symbol;
    }
    startTime();
  }
  else{
    seconds--;
    clearTime = setTimeout("BreakTime( )", 1000);
  }
}


//create a function to start the Count-Up
function startTime() {
  /* check if seconds, minutes, and hours are equal to zero
    and start the Count-Up */
  //if (seconds === 0 && minutes === 1 && hours === 0) {
  if (seconds === 0 && hours === 0) {
    /* hide the fulltime when the Count-Up is running */
    var fulltime = document.getElementById("fulltime");
    fulltime.style.display = "none";
    var showStart = document.getElementById("start");
    showStart.style.display = "none";
    var yesButton = document.getElementById("yes");
    yesButton.setAttribute("hidden", "true");
    var noButton = document.getElementById("no");
    noButton.setAttribute("hidden", "true");
    }
  if (minutes == 25 && break_on == 0){
    startWatch();
  }
  if (minutes == 5 && break_on == 1000){
    BreakTime();
  }
}

var start = document.getElementById("start");
start.addEventListener("click", startTime);

/*create a function to stop the time */
function stopTime() {
  /* check if seconds, minutes and hours are not equal to 0 */
  if (seconds !== 0 || minutes !== 0 || hours !== 0) {
    var continueButton = document.getElementById("continue");
    continueButton.setAttribute("hidden", "true");
    var pauseButton = document.getElementById("pause");
    pauseButton.setAttribute("hidden", "true");
    var stopButton = document.getElementById("stop");
    stopButton.setAttribute("hidden", "true");

    var fulltime = document.getElementById("fulltime");
    fulltime.style.display = "block";
    fulltime.style.color = "#ff4500";
    var time = mins + secs;
    fulltime.innerHTML = "Your Pomodoro score is " + pomodoro_score + ". " + "Do you want to save it?";
    // Saving buttons
    var yesButton = document.getElementById("yes");
    yesButton.removeAttribute("hidden");
    var noButton = document.getElementById("no");
    noButton.removeAttribute("hidden");

    var form = document.getElementById("mainform");
    var input = document.getElementById("jsvar");
    form.addEventListener('submit', function(e) {
        input.value = pomodoro_score; // Replace "your_var" with the variable you want to pass
    });

    document.getElementById('no').onclick = function no_saving() {
        yesButton.setAttribute("hidden", "true");
        noButton.setAttribute("hidden", "true");
        fulltime.innerHTML = "No score was saved.";
    }

    // reset the Count-Up
    seconds = 0;
    minutes = 25;
    hours = 0;
    secs = "0" + seconds;
    mins = minutes + ": ";
    gethours = "0" + hours + ": ";
    pomodoro_score = 0;
    pomodoro_start = 0;
    work_start = 0;
    break_on = 0;

    /* display the Count-Up Timer after it's been stopped */
    var x = document.getElementById("timer");
    var stopTime = mins + secs;
    x.innerHTML = stopTime;

    /* display all Count-Up control buttons */
    var showStart = document.getElementById("start");
    showStart.style.display = "inline-block";
//    var showStop = document.getElementById("stop");
//    showStop.style.display = "inline-block";
//    var showPause = document.getElementById("pause");
//    showPause.style.display = "inline-block";

    document.getElementById('scores').innerHTML = "Pomodoro score: 0";
    document.getElementById('worktime').innerHTML = "Work times: 0";

    var a = document.getElementById("section");
    a.innerHTML = "Time for Sleep or Enjoy!";

    /* clear the Count-Up using the setTimeout( )
        return value 'clearTime' as ID */

    clearTimeout(clearTime);
  }
}
window.addEventListener("load", function() {
  var stop = document.getElementById("stop");
  stop.addEventListener("click", stopTime);
});
/*********** End of Stop Button Operations *********/

/*********** Pause Button Operations *********/
function pauseTime() {
  if (seconds !== 0 || minutes !== 0 || hours !== 0) {
    /* display the Count-Up Timer after clicking on pause button */
    var x = document.getElementById("timer");
    var stopTime = mins + secs;
    x.innerHTML = stopTime;

    /* display all Count-Up control buttons */
    var showStop = document.getElementById("stop");
    showStop.style.display = "inline-block";
    continueButton_key = 1000;
    var cTime = document.getElementById("continue");
    cTime.disabled = false;
    cTime.addEventListener("click", continueTime);
    /* clear the Count-Up using the setTimeout( )
        return value 'clearTime' as ID */
    clearTimeout(clearTime);
  }
}

var pause = document.getElementById("pause");
pause.addEventListener("click", pauseTime);
/*********** End of Pause Button Operations *********/

/*********** Continue Button Operations *********/
function continueTime() {
  if (seconds !== 0 || minutes !== 0 || hours !== 0) {
    /* display the Count-Up Timer after it's been paused */
    var x = document.getElementById("timer");
    var continueTime = mins + secs;
    x.innerHTML = continueTime;

    /* display all Count-Up control buttons */
    var showStop = document.getElementById("stop");
    showStop.style.display = "inline-block";
    /* clear the Count-Up using the setTimeout( )
        return value 'clearTime' as ID.
        call the setTimeout( ) to keep the Count-Up alive ! */
    clearTimeout(clearTime);

    if (break_on == 0){
      var cTime = document.getElementById("continue");
      cTime.disabled = true;
      clearTime = setTimeout("startWatch( )", 1000);
    }
    if (break_on == 1000){
      var cTime = document.getElementById("continue");
      cTime.disabled = true;
      clearTime = setTimeout("BreakTime( )", 1000);
    }
    //clearTime = setTimeout("startWatch( )", 1000);
  }
}
window.addEventListener("load", function() {
  var cTime = document.getElementById("continue");
  //cTime.addEventListener("click", continueTime);
  cTime.disabled = true;
  });
