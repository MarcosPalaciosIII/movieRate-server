document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);

function changeAction(val) {
  // console.log("value of search form --------------- ", val);
  $('#searchForm')[0].setAttribute('action', val);
}

var faveButton = $('.addToFaveButton')[0];
console.log("><>><<><><><><><<<><>><>", faveButton);

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

// $('#theAddToFaveButton').click((event) => {
//   console.log("the event --- ", event);
// });

$(document).ready(() => {
  $(".carousel-item:nth-child(1)").addClass("active");
});
