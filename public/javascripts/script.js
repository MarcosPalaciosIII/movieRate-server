document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);

function changeAction(val) {
  // console.log("value of search form --------------- ", val);
  $('#searchForm')[0].setAttribute('action', val);
}


$(document).ready(() => {
  $(".carousel-item:nth-child(1)").addClass("active");
});
