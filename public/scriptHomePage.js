//jQuery to make the background image stretch all the way across the screen
$(document).ready(function () {
  $('.header').height($(window).height());
})

function openlogin() {
  document.getElementById("myForm").style.display = "block";
}

function closeLogin() {
  document.getElementById("myForm").style.display = "none";
}