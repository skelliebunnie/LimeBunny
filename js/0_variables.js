const clockContainer = document.querySelector("#clock_container");
const tabbedContentContainer = document.querySelector("#tabbedContent");
const timersContainer = document.querySelector("#timers_container");

/** CLOCK **/
const CLOCK = document.querySelector("#clock");

const DOTS_CONTAINER = document.querySelector("#dotsContainer");

const LINE_CONTAINER = document.querySelector("#lineContainer");
const LINE = document.querySelector("#line");

const CIRCLE_CONTAINER = document.querySelector("#circleContainer");
const CIRCLE = document.querySelector("#circleContainer .circle");
const FILL_CIRCLE = document.querySelector("#circleContainer .fill-circle");

let clockSize = { 
	width: clockContainer.clientWidth, 
	height: clockContainer.clientHeight,
	circle: clockContainer.clientWidth - 40,
	radius: (clockContainer.clientWidth - 40) / 2
};

let OPTIONS = {};

let CLOCK_INTERVAL = setInterval(showClockTime, 1000);

/** TIMERS **/
let TIMERS = {count: 0, docs: {}};
let storedTimers = localStorage.getItem('sktt_timers') ? JSON.parse(localStorage.getItem('sktt_timers')) : null;
if(storedTimers !== null) { storedTimers.count = Object.keys(storedTimers.docs).length };

/** TIME ENTRIES **/
let TIME_ENTRIES = {count: 0, docs: {}};
let storedTimeEntries = localStorage.getItem('sktt_time_entries') ? JSON.parse(localStorage.getItem('sktt_time_entries')) : null;
if(storedTimeEntries !== null) { storedTimeEntries.count = Object.keys(storedTimeEntries.docs).length };

if(storedTimeEntries === null) {
	localStorage.setItem('sktt_time_entries', JSON.stringify(TIME_ENTRIES));
	storedTimeEntries = TIME_ENTRIES;
}