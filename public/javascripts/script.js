// const axios = require('axios');
// import axios from 'https://unpkg.com/axios/dist/axios.min.js';
// import {} from 'dotenv/config';
// import dotenv from 'dotenv/config';
// dotenv.config();
// import theEnv from '.env';

// console.log("these are the environment variables ======== ", theEnv);

document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);

function changeAction(val) {
  // console.log("value of search form --------------- ", val);
  $('#searchForm')[0].setAttribute('action', val);
}

var faveButton = $('.addToFaveButton')[0];
// console.log("><>><<><><><><><<<><>><>", faveButton);

function spinner(event) {
  console.log("the parent node ========= ", $(event)[0].parentNode.className.includes('show'));
  console.log("the button on click -------- ", $(event)[0].childNodes[1]);
  if(!$(event)[0].parentNode.className.includes('show')) {
    console.log("it has a class show ------------- >>>> ", !$(event)[0].parentNode.className.includes('show'));
    $($(event)[0].childNodes[1]).addClass('spin');
    $($(event)[0].childNodes[1]).removeClass('spinReverse');
  } else {
    console.log("does not have the class show <<< ------------ >>> ", !$(event)[0].parentNode.className.includes('show'));
    $($(event)[0].childNodes[1]).addClass('spinReverse');
    $($(event)[0].childNodes[1]).removeClass('spin');
  }
}

var toggleInputValue = $("input.custom-control-input").prop('value');
// console.log("===================== ", toggleInputValue);
// console.log("is it public >>>>>>>>>>>>> ", $("input.custom-control-input").prop('checked'), "======", $("input.custom-control-input").prop('name'));


// console.log("the domain name >>>>>>>>>>>> ", `${new URL($('#theDomainName')[0].innerHTML)}playlists/changePublicStatus`);


$("input.custom-control-input").change(function(){
  theData = {
    isPublic: $("input.custom-control-input").prop('checked'),
    playlistId: $("input.custom-control-input").prop('value')
  };
    if($(this).prop("checked") == true){
       console.log("the toggle button is true", theData);
       axios.post(`${new URL($('#theDomainName')[0].innerHTML)}playlists/changePublicStatus`, theData);
       // axios.
    }else{
       console.log('the toggle button is false', theData);
       axios.post(`${new URL($('#theDomainName')[0].innerHTML)}playlists/changePublicStatus`, theData);
    }
});

// $('#theAddToFaveButton').click((event) => {
//   console.log("the event --- ", event);
// });

$(document).ready(() => {
  $(".carousel-item:nth-child(1)").addClass("active");

  if($("input.custom-control-input").prop('name') == 'true') {
    // console.log("the name is set to true <<<<<<<<< ", $("input.custom-control-input").prop('name'));
    $("input.custom-control-input").prop('checked', true);
  } else {
    // console.log("the name is set to false >>>>>>>>>>  <<<<<<<<< ", $("input.custom-control-input").prop('name'));
    $("input.custom-control-input").prop('checked', false);
  }
});
