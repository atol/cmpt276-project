//jQuery to make the background image stretch all the way across the screen
$(document).ready(function () {
  $('.header').height($(window).height());
})


// function login() {
//   var data = {};
//   data.email = document.getElementById("email");
//   data.password = document.getElementById("pwd");
//   $.ajax({
//     type: 'POST',
//     data: JSON.stringify(data),
//     cache: false,
//     contentType: 'application/json',
//     datatype: "json",
//     url: '/',
//     success: function (returns) {
//       if (returns)
//         alert("User save");
//       else
//         alert("Error: user not save");
//     }
//   });
// }