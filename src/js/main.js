require("./lib/social");
require("./lib/ads");
// var track = require("./lib/tracking");

var $ = require("./lib/qsa");
var debounce = require("./lib/debounce");
var scrollTo = require("./lib/animateScroll");

var parseDate = function(str) {
  var [month, day, year] = str.split("/").map(Number);
  month -= 1;
  return new Date(year, month, day);
}

var formatDate = function(date) {
  var months = [null, "Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  return `${months[month]} ${day}`;
}

// rebuild data from the DOM
var rows = $(".fall-arts tbody.events tr").map(function(tr) {
  var props = "event date location description".split(" ");
  var o = {};
  props.forEach(p => o[p] = tr.querySelector("." + p).innerHTML.trim().replace("&amp;", "&"));
  o.element = tr;
  o.category = tr.getAttribute("data-category");
  o.start = parseDate(tr.getAttribute("data-start"));
  if (tr.getAttribute("data-end")) o.end = parseDate(tr.getAttribute("data-end"));
  tr.querySelector("span.start").innerHTML = formatDate(o.start);
  if (o.end) tr.querySelector("span.end").innerHTML = formatDate(o.end);
  o.pick = tr.classList.contains("pick");
  return o;
});

var catList = document.querySelector(".filters .categories");
var searchBox = document.querySelector(".filters .search");
var table = document.querySelector(".fall-arts");
var edPicks = document.querySelector(".editors");

var filterByCategory = function(cats, list) {
  return list.filter(r => cats.indexOf(r.category) > -1);
};

var filterBySearch = function(q, list) {
  var re = new RegExp(q, "i");
  return list.filter(r => r.event.match(re) || r.location.match(re) || r.description.match(re));
};

var filterForPicks = function(list) {
  return list.filter(r => r.pick);
};

var chainFilters = function() {
  var checked = $("input[type=checkbox]:checked", catList).map(el => el.getAttribute("data-category"));
  var query = searchBox.value;
  var byCat = filterByCategory(checked, rows);
  var byQ = query ? filterBySearch(query, byCat) : byCat;
  var picks = edPicks.checked ? filterForPicks(byQ) : byQ;
  return picks;
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

searchBox.addEventListener("keyup", applyFilters);

edPicks.addEventListener("click", applyFilters);

// applyFilters();


//scroll to today's events
document.querySelector(".jump-to-today").addEventListener("click", function() {
  var today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  var filtered = chainFilters();
  for (var i = 0; i < filtered.length; i++) {
    var row = filtered[i];
    if (row.end >= today) return scrollTo(row.element);
    if (row.start >= today) return scrollTo(row.element);
  }
});