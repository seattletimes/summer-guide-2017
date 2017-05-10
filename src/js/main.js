require("./lib/social");
require("./lib/ads");
// var track = require("./lib/tracking");

var $ = require("./lib/qsa");
var debounce = require("./lib/debounce");
var scrollTo = require("./lib/animateScroll");

var formatDate = function(date) {
  var months = [null, "Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  return `${months[month]} ${day}`;
}

// rebuild data from the DOM
var rows = $(".summer-events tbody.events tr").map(function(tr) {
  var props = "event date location description".split(" ");
  var o = {};
  props.forEach(p => o[p] = tr.querySelector("." + p).innerHTML.trim().replace("&amp;", "&"));
  o.element = tr;
  o.category = tr.getAttribute("data-category");
  o.dates = tr.querySelector(".date").innerHTML;
  var [month] = o.dates.match(/thru|may|june|july|aug|sept/i) || [""];
  month = month.toLowerCase();
  o.month = month == "thru" ? "may" : month;
  o.pick = tr.classList.contains("pick");
  return o;
});

var catList = document.querySelector(".filters .categories");
var monthList = document.querySelector(".filters .meses")
var searchBox = document.querySelector(".filters .search");
var table = document.querySelector(".summer-events");
var edPicks = document.querySelector(".editors");

var filterByCategory = function(cats, list) {
  return list.filter(r => cats.indexOf(r.category) > -1);
};

var filterByMonth = function(meses, list) {
  return list.filter(r => meses.indexOf(r.month) > -1);
};

var filterBySearch = function(q, list) {
  if (!q) return list;
  var re = new RegExp(q, "i");
  return list.filter(r => r.event.match(re) || r.location.match(re) || r.description.match(re));
};


var chainFilters = function() {
  var checked = $(".categories input[type=checkbox]:checked", catList).map(el => el.getAttribute("data-category"));
  var mesChecked = $(".meses input[type=checkbox]:checked", monthList).map(el => el.getAttribute("data-month"));
  var query = searchBox.value;
  var filters = [
    // { filter: filterByCategory, value: checked },
    { filter: filterByMonth, value: mesChecked },
    { filter: filterBySearch, value: query }
  ];
  var filtered = rows;
  filters.forEach(def => filtered = def.filter(def.value, filtered));
  return filtered;
}

var applyFilters = debounce(function() {
  var final = chainFilters();
  rows.forEach(function(r) {
    if (final.indexOf(r) > -1) {
      r.element.classList.remove("hidden");
    } else {
      r.element.classList.add("hidden");
    }
  });
  if (!final.length) {
    table.classList.add("empty");
  } else {
    table.classList.remove("empty");
  }
});

catList.addEventListener("click", applyFilters);

monthList.addEventListener("click", applyFilters);

searchBox.addEventListener("keyup", applyFilters);

edPicks.addEventListener("click", applyFilters);

// applyFilters();


//scroll to today's events
// document.querySelector(".jump-to-today").addEventListener("click", function() {
//   var today = new Date();
//   today.setHours(0);
//   today.setMinutes(0);
//   today.setSeconds(0);
//   var filtered = chainFilters();
//   for (var i = 0; i < filtered.length; i++) {
//     var row = filtered[i];
//     if (row.end >= today) return scrollTo(row.element);
//     if (row.start >= today) return scrollTo(row.element);
//   }
// });