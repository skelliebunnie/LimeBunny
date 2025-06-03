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
/**
 * GENERAL FUNCTIONS
 */
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, 
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getChildren(n, skipMe){
    var r = [];
    for ( ; n; n = n.nextSibling ) 
       if ( n.nodeType == 1 && n != skipMe)
          r.push( n );        
    return r;
};

function getSiblings(n) {
    return getChildren(n.parentNode.firstChild, n);
}

function getTimeObject(seconds) {
	return {
		h: Math.floor(seconds / 3600),
		m: Math.floor(seconds / 60 % 60),
		s: Math.floor(seconds % 60)
	};
}

function getTimer(idx) {
	let res = null;
	res = document.querySelectorAll(".timer").forEach(timer => {
		if(timer.dataset["idx"] === idx) return timer;
	});

	return res;
}
function showToast(opts) {
	options = {
		type: 'info',
		fadeDelay: 5000,
		position: 'bl', // bl: bottom-left, br: bottom-right, etc.
		title: "Toast Title",
		message: "This is a toast notification",
		...opts
	}
	let toastId = uuidv4();

	let template = document.querySelector("#toastTemplate");
	let toastClone = template.content.cloneNode(true);
	let toast = toastClone.querySelector(".toast");
	toast.setAttribute("id", `toast-${toastId}`);
	toast.querySelector(".content").innerHTML = options.title !== '' ? `<h6>${options.title}</h6>` : '';
	toast.querySelector(".content").innerHTML += `<p>${options.message}</p>`;



	toast.querySelector(".close").addEventListener("click", function() {
		toast.classList.remove("active");

		setTimeout(() => { toast.remove() }, 800);
	});

	document.querySelector("body").append(toast);

	toast.classList.add(options.position, options.type);

	setTimeout(() => {
		toast.classList.add("active");
	}, 200)

	if(options.fadeDelay > 0) {
		setTimeout(() => {
			toast.classList.remove("active");
			setTimeout(() => { toast.remove() }, 800);
		}, options.fadeDelay);
	}
}
/**
 * TIMERS
 * idx: {
 *  title: "string",
 * 	start: <date>,
 * 	end: <date>,
 * 	interval: function()
 * }
 */

// check for stored timers, and if none found add a starting one
// otherwise, load up the saved timers
if(storedTimers === null) {
	localTimers("save");
	storedTimers = localTimers("get");
} 

if(storedTimers.count === 0) {
	let idx = uuidv4();
	buildTimer(idx);

} else {
	Object.keys(storedTimers.docs).forEach(key => {
		buildTimer(key);
	});
}

function localTimers(action) {
	let res;

	if(action === "get") {
		res = JSON.parse(localStorage.getItem('sktt_timers'));
	}

	if(action === "set" || action === "save") {
		localStorage.setItem('sktt_timers', JSON.stringify(TIMERS));
		res = { message: 'saved timers' };
	}

	if(action === "clear") {
		localStorage.removeItem('sktt_timers');
		res = { message: 'timers removed' };
	}

	return res;
}

function showTimerTime(target, idx, update=false) {
	if(update) {
		let startTime = dayjs(TIMERS.docs[idx].start);
		let currentTime = dayjs();
		let diff = currentTime.diff(startTime, 'second', true);

		let res = getTimeObject(diff);

		TIMERS.docs[idx] = {
			...TIMERS.docs[idx],
			secondsElapsed: Math.floor(diff)
		}

		localTimers('save');

		target.innerText = `${padTime(res.h)}:${padTime(res.m)}:${padTime(res.s)}`;

	} else if(TIMERS.docs[idx].secondsElapsed > 0) {
		const s = TIMERS.docs[idx].secondsElapsed;
		let res = getTimeObject(s);

		target.innerText = `${padTime(res.h)}:${padTime(res.m)}:${padTime(res.s)}`;

	} else {
		target.innerText = `00:00:00`;

	}
}

function padTime(i) {
	if(i < 10) i = `0${i}`;
	return i;
}

function updateData(idx) {
	let timer, timeContainer, title;
	storedTimers = localTimers("get");

	// if data for the idx exists in localStorage, use that
	if(storedTimers.docs[idx]) {

		TIMERS.docs[idx] = {
			...storedTimers.docs[idx],
			interval: null
		};

		if(storedTimeEntries.docs[idx]) {
			TIME_ENTRIES.docs[idx] = { ...storedTimeEntries.docs[idx] };
		}

	} else {
		// otherwise, set up new data
		TIMERS.docs[idx] = {
			title: `timer-${idx.substring(0,5)}`,
			interval: null,
			start: dayjs(),
			secondsElapsed: 0
		};

		TIME_ENTRIES.docs[idx] = {
			title: `timer-${idx.substring(0,5)}`,
			created: dayjs(),
			updated: dayjs(),
			secondsElapsed: 0
		};

	}
	TIME_ENTRIES.count = Object.keys(TIME_ENTRIES.docs).length;

	localTimers("save");	

	document.querySelectorAll(".timer").forEach(t => {
		if(t.dataset["idx"] === idx) {
			timer = t;
			timeContainer = t.querySelector(".time");
		}
	});

	// if we can find the timer on the page, show the time elapsed
	if(timer !== undefined) {
		showTimerTime(timeContainer, idx);

	}
}

function updateTitle(idx, title) {
	TIMERS.docs[idx].title = title;
	localTimers('save');

	if(TIME_ENTRIES.docs[idx]) {
		TIME_ENTRIES.docs[idx].title = title;

		localTimeEntries("save");
	}
}

function buildTimer(idx) {
	if(idx !== undefined) {
		let template = document.querySelector("#timerTemplate");
		let timer = template.content.cloneNode(true);
		timer.querySelector(".timer").dataset["idx"] = idx;

		let footer = timer.querySelector(".time-container");
		let footerContent = timer.querySelector(".time-container").innerHTML;
		footer.innerHTML = footerContent.replace("${uuid}", idx);

		let title = `timer-${idx.substring(0,5)}`;

		let form = timer.querySelector(".form");
		let formContent = timer.querySelector(".form").innerHTML;
		form.innerHTML = formContent.replace("${title}", title);

		const playPauseBtn = timer.querySelector(".play-pause > i");
		const removeTimerBtn = timer.querySelector(".remove-timer > i");
		const refreshTimerBtn = timer.querySelector(".refresh-timer");

		let clearTimeBtn = timer.querySelector(".clear-time");
		let saveTimeBtn = timer.querySelector(".save-time");

		let timeContainer = timer.querySelector(".time");

		storedTimeEntries = localTimeEntries("get");
		let timeEntry = storedTimeEntries.docs[idx];

		storedTimers = localTimers('get');

		// if there's a stored timer with the same ID, "merge" the data
		if(storedTimers.docs[idx]) {
			TIMERS.docs[idx] = {
				...storedTimers.docs[idx],
				interval: null
			};

			title = storedTimers.docs[idx].title !== `timer-${idx.substring(0,5)}` ? storedTimers.docs[idx].title : TIMERS.docs[idx].title;
		}

		// update title in input field if it doesn't match the var value
		if(timer.querySelector("[name='title']").value !== title) {
			timer.querySelector("[name='title']").value = title;
		}
		// enable save/clear buttons if time elapsed is greater than 0
		if(TIMERS.docs[idx] && TIMERS.docs[idx].secondsElapsed > 0) {
			clearTimeBtn.classList.remove("disabled");
			saveTimeBtn.classList.remove("disabled");
		}

		// SUBMIT: update title & blur input field
		form.addEventListener("submit", function(e) {
			e.preventDefault();
			form.querySelector("input").blur();
		});

		// BLUR: update title
		form.querySelector("input").addEventListener("blur", function(e) {
			updateTitle(idx, e.target.value);
		});

		// CLICK: starting/stopping timer
		playPauseBtn.addEventListener("click", function() {
			const playing = playPauseBtn.dataset.playing;

			// if playing is true, then we need to PAUSE
			if(playing === "true") {
				playPauseBtn.dataset.playing = "false";
				playPauseBtn.classList.add("fa-play-circle");
				playPauseBtn.classList.remove("fa-pause-circle");

				clearInterval(TIMERS.docs[idx].interval);

			} else {
				playPauseBtn.dataset.playing = "true";
				playPauseBtn.classList.remove("fa-play-circle");
				playPauseBtn.classList.add("fa-pause-circle");

				// reset "start" time for accurate counting after pause
				// subtracting secondsElapsed to continue count-up correctly
				TIMERS.docs[idx].start = TIMERS.docs[idx].secondsElapsed > 0 ? dayjs().subtract(TIMERS.docs[idx].secondsElapsed, 'seconds') : dayjs();

				TIMERS.docs[idx].interval = setInterval(function() {
						showTimerTime(timeContainer, idx, true);
					}, 500);

				clearTimeBtn.classList.remove("disabled");
				saveTimeBtn.classList.remove("disabled");
			}
		});

		// CLICK: remove timer
		removeTimerBtn.addEventListener("click", function() {
			let timer;
			document.querySelectorAll(".timer").forEach(t => {
				if(t.dataset["idx"] === idx) {
					timer = t;
				}
			});

			if(timer) {
				timer.remove();
			}

			delete(TIMERS.docs[idx]);
			TIMERS.count = TIMERS.count > 0 ? TIMERS.count - 1 : 0;
			localTimers("save");
		});

		// CLICK: clear timer time display
		clearTimeBtn.addEventListener("click", function() {
			if(!clearTimeBtn.classList.contains("disabled")) {
				playPauseBtn.dataset.playing = false;
				playPauseBtn.classList.remove("fa-pause-circle");
				playPauseBtn.classList.add("fa-play-circle");

				clearInterval(TIMERS.docs[idx].interval);

				TIMERS.docs[idx] = {
					...TIMERS.docs[idx],
					interval: null,
					end: dayjs(),
					secondsElapsed: 0
				};
				timeContainer.innerText = "00:00:00";

				localTimers('save');

				clearTimeBtn.classList.add("disabled");
				saveTimeBtn.classList.add("disabled");
			}
		});

		// CLICK: save timer data as a time entry
		saveTimeBtn.addEventListener("click", function() {
			if(!saveTimeBtn.classList.contains("disabled")) {
				storedTimers = localTimers("get");
				storedTimeEntries = localTimeEntries("get");

				playPauseBtn.dataset.playing = false;
				playPauseBtn.classList.remove("fa-pause-circle");
				playPauseBtn.classList.add("fa-play-circle");

				clearInterval(TIMERS.docs[idx].interval);

				TIMERS.docs[idx] = {
					...TIMERS.docs[idx],
					lastSaved: dayjs(),
					interval: null
				};
				localTimers('save');
				storedTimers = localTimers("get");

				if(timeEntry) {
					TIME_ENTRIES.docs[idx] = {
						...timeEntry,
						title:  TIMERS.docs[idx].title,
						updated: dayjs(),
						secondsElapsed: TIMERS.docs[idx].secondsElapsed
					}

					if(timeEntry.title !== title) {
						TIME_ENTRIES.docs[idx].title = title;
					}
				} else {
					TIME_ENTRIES.docs[idx] = {
						title:  TIMERS.docs[idx].title,
						created: dayjs(),
						updated: dayjs(),
						secondsElapsed: TIMERS.docs[idx].secondsElapsed
					}
				}
				TIME_ENTRIES.count = Object.keys(TIME_ENTRIES.docs).length;
				localTimeEntries('save');
				storedTimeEntries = localTimeEntries("get");
			}
		});

		// TODO: set up refresh action (& unhide icon in HTML!)
		// CLICK: refresh timer UUID
		// this is so we can re-use the same timer for multiple entries
		// without having to create a new timer & delete the old one
		refreshTimerBtn.addEventListener("click", function() {
			let newId = uuidv4();
			TIMERS.docs[newId] = {
				...TIMERS.docs[idx],
				interval: null,
				title: `timer-${newId.substring(0,5)}`
			}

			delete(TIMERS.docs[idx]);

			document.querySelectorAll(".timer").forEach(timer => {
				if(timer.dataset["idx"] === idx) {
					timer.setAttribute("data-idx", newId);

					timer.querySelector(".title-input").value = `timer-${newId.substring(0,5)}`;
					timer.querySelector(".time-container > span:first-child").setAttribute("data-tooltip", newId);
				}
			});

			localTimers("save");
			idx = newId;

			showToast({
				position: "bl",
				type: "success",
				title: "Timer UUID refreshed!",
				message: `New UUID (<span class='font-mono'>${idx}</span>) assigned to timer.`,
				fadeDelay: 3000
			});
		});

		timersContainer.append(timer);
		TIMERS.count += 1;

		updateData(idx);

	}
}

const addTimerBtn = document.querySelector(".add-timer");
addTimerBtn.addEventListener("click", function() {
	let newTimerIndex = uuidv4();
	buildTimer(newTimerIndex);
});
/**
 * CLOCK FUNCTIONS
 */
updateOptions();
addDots();
setCircle();
updateClockDisplay();

function updateClockSize() {
	clockSize = {
		width: clockContainer.clientWidth,
		height: clockContainer.clientWidth,
		circle: clockContainer.clientWidth - 40,
		radius: (clockContainer.clientWidth / 4) - 40
	}
}

// http://jsfiddle.net/ThiefMaster/LPh33/4/
// for arranging dots in a circle
function addDots() {
	while(DOTS_CONTAINER.firstChild) {
		DOTS_CONTAINER.removeChild(DOTS_CONTAINER.firstChild);
	}

	var radius = clockSize.radius / 3;

  var width = clockSize.width,
      height = width,
      angle = 0,
      step = (2*Math.PI) / 59;

	for(var i = 1; i <= 59; i++) {
		let dot = document.createElement('i');
		dot.classList.add("dot", `dot-${i}`, "far", "fa-circle", "text-xxs", "md:text-xs", "m-0.5", "text-accent-500", "absolute");
		dot.setAttribute("data-idx", i);

		var dotWidth = window.innerWidth < 640 ? 8 : 12, dotHeight = dotWidth;
    var x = Math.round((radius * 2) * Math.cos(angle) - dotWidth/2);
    var y = Math.round((radius * 2) * Math.sin(angle) - dotHeight/2);

    dot.style.top = `${y}px`;
    dot.style.left = `${x}px`;

    angle += step;

		DOTS_CONTAINER.appendChild(dot);
	}
}

function setCircle() {
	var size = clockSize.circle,
			containerWidth = clockSize.width,
			containerHeight = clockSize.height,
			circleRadius = clockSize.radius / 1.5,
			loadingSize = 0,
			strokeWidth = size * 0.05;

	CIRCLE_CONTAINER.style.width = `${containerWidth}px`;
	CIRCLE_CONTAINER.style.height = `${containerHeight}px`;

	document.querySelectorAll(".circle").forEach(circle => {
		circle.setAttribute('cy', containerHeight / 2);
		circle.setAttribute('cx', containerWidth / 2);
		circle.setAttribute('r', circleRadius);

		circle.style.strokeWidth = strokeWidth;
	});

	FILL_CIRCLE.style.strokeDasharray = size * 3;
	FILL_CIRCLE.style.strokeDashoffset = size * 3;

	updateCircle();
}

function updateCircle(sec=null) {
	if(sec === null) {
		let dt = new Date();
		sec = dt.getSeconds();
	}

	var offset = clockSize.circle * 3;

	FILL_CIRCLE.style.strokeDashoffset = offset - (offset * (sec / 85));
}

function updateOptions() {
	let storedOptions = localStorage.getItem('sktt_timer_options') !== undefined ? JSON.parse(localStorage.getItem('sktt_timer_options')) : null;
	
	let secondsAnims = document.querySelectorAll(".seconds-anim");
	
	const currentOptions = {
		show_seconds: document.querySelector("[name='show_seconds']").checked,
		sec_numbers: document.querySelector("[name='sec_numbers']").checked,
		seconds_display: document.querySelector("[name='seconds_display']").value,
		hr24: document.querySelector("[name='hr24']").checked,
		clock_right: document.querySelector("[name='clock_right']").checked
	};

	if(OPTIONS.show_seconds === undefined && storedOptions !== null) {
		OPTIONS = storedOptions;

	} else {
		OPTIONS = currentOptions;
	}

	localStorage.setItem('sktt_timer_options', JSON.stringify(OPTIONS));

	Object.keys(OPTIONS).forEach(key => {
		if(key !== 'seconds_display') {
			document.querySelector(`[name="${key}"]`).checked = OPTIONS[key];

		} else {
			document.querySelector("[name='seconds_display']").value = OPTIONS["seconds_display"];

		}
	});

	if(OPTIONS['show_seconds']) {
		document.querySelector("[for='sec_numbers']").style.display = 'block';
		document.querySelector("[name='seconds_display']").style.display = 'block';
		
	} else {
		document.querySelector("[name='seconds_display']").style.display = 'none';
		
		document.querySelector("[name='sec_numbers']").checked = false;
		document.querySelector("[for='sec_numbers']").style.display = 'none';

	}

	updateLayout();
	updateClockDisplay();
}

function updateClockDisplay() {
	document.querySelector("#seconds_display").classList.add("hidden");

	DOTS_CONTAINER.classList.add('hidden');
	LINE_CONTAINER.classList.add('hidden');
	CIRCLE_CONTAINER.classList.add('hidden');

	if(OPTIONS.show_seconds) {
		document.querySelector("#seconds_display").classList.remove("hidden");

		const type = OPTIONS.seconds_display;

		if(type === 'dots') {
			DOTS_CONTAINER.classList.remove('hidden');

			LINE_CONTAINER.classList.add('hidden');
			CIRCLE_CONTAINER.classList.add('hidden');

		} else if(type === 'line') {
			LINE_CONTAINER.classList.remove('hidden');

			DOTS_CONTAINER.classList.add('hidden');
			CIRCLE_CONTAINER.classList.add('hidden');

		} else if(type === 'circle') {
			LINE_CONTAINER.classList.add('hidden');
			DOTS_CONTAINER.classList.add('hidden');

			CIRCLE_CONTAINER.classList.remove('hidden');
			setCircle();

		} else {
			DOTS_CONTAINER.classList.add('hidden');
			LINE_CONTAINER.classList.add('hidden');
			CIRCLE_CONTAINER.classList.add('hidden');

		}

	}
}

function showClockTime() {
	let time = new Date();

	let hour = time.getHours();
	let min = time.getMinutes();
	let sec = time.getSeconds();

	let am_pm = hour > 12 ? "PM" : "AM";
	if(hour > 12 && !OPTIONS.hr24) hour -= 12;

	var h = hour < 10 ? "0" + hour : hour,
			m = min < 10 ? "0" + min : min;
			s = sec < 10 ? "0" + sec : sec;

	let currentTime = `${h}:${m}`;
	if(OPTIONS.show_seconds && OPTIONS.sec_numbers) {
		currentTime += `:${s}`;

	}
	if(!OPTIONS.hr24) currentTime += ` ${am_pm}`;

	if(OPTIONS.show_seconds && OPTIONS.seconds_display === 'dots') {
		// DOTS_CONTAINER.innerHTML = Array(sec < 59 ? sec + 1 : 1).fill(dot).join("");

		DOTS_CONTAINER.querySelectorAll('.dot').forEach(dot => {
			if(sec === 0) {
				dot.classList.add('far');
				dot.classList.remove('fas');

			} else if(parseInt(dot.dataset.idx) <= sec) {
				dot.classList.remove('far');
				dot.classList.add('fas');

			}

			
		});

	}

	if(OPTIONS.show_seconds && OPTIONS.seconds_display === 'line') {
		let width = (sec / 59) * 100;
		LINE.style.width = `${width}%`;
	}

	if(OPTIONS.show_seconds && OPTIONS.seconds_display === 'circle') {
		updateCircle(sec);
	}

	CLOCK.innerText = currentTime;
	if(clockSize.width !== clockContainer.clientWidth) {
		updateSecondsDisplay();
	}
}

function updateSecondsDisplay() {
	updateClockSize();

	if(OPTIONS.seconds_display === 'dots') {
		addDots();

	} else if(OPTIONS.seconds_display === 'circle') {
		setCircle();

	}
}

/**
 * CLICK HANDLERS
 */
// handle restarting the clock when changing inputs
document.querySelectorAll("input.opt-input").forEach(item => {
		item.addEventListener('click', function() {
			updateOptions();
			
			if(item.name === 'clock_right') {
				updateLayout(item.value);

			} else {
				updateClockDisplay();

				clearInterval(CLOCK_INTERVAL);
				CLOCK_INTERVAL = setInterval(showClockTime, 1000);
			}

		});
});

document.querySelector("#seconds_display").addEventListener('change', (e) => {
	updateOptions();
});

let optionsTitle = document.querySelector(".options-title");
optionsTitle.addEventListener("click", (e) => {
	if(optionsTitle.dataset.open == 'true') {
		optionsTitle.dataset.open = false;

		optionsTitle.querySelector(".fad").classList.remove("fa-angle-up");
		optionsTitle.querySelector(".fad").classList.add("fa-angle-down");

		document.querySelector(".options_container").classList.add("scale-y-0");
	} else {
		optionsTitle.dataset.open = true;

		optionsTitle.querySelector(".fad").classList.remove("fa-angle-down");
		optionsTitle.querySelector(".fad").classList.add("fa-angle-up");

		document.querySelector(".options_container").classList.remove("scale-y-0");
	}
});
/**
 * LAYOUT FUNCTIONS
 */
updateLayout();

function updateLayout() {
	const main = document.querySelector("#main");

	// clock_right == place-bottom on mobile (< 768)
	if(OPTIONS.clock_right) {
		clockContainer.classList.remove("place-top", "md:place-left");
		clockContainer.classList.add("place-bottom", "md:place-right");

		tabbedContentContainer.classList.remove("place-bottom", "md:place-right");
		tabbedContentContainer.classList.add("place-top", "md:place-left");

		main.classList.remove("clock_left");
		main.classList.add("clock_right");

	} else {
		clockContainer.classList.remove("place-bottom", "md:place-right");
		clockContainer.classList.add("place-top", "md:place-left");

		tabbedContentContainer.classList.remove("place-top", "md:place-left");
		tabbedContentContainer.classList.add("place-bottom", "md:place-right");

		main.classList.remove("clock_right");
		main.classList.add("clock_left");
	}
}
/**
 * TABS
 */
const tabsNav = document.querySelector("#tabs");

let tabTarget = "timers_container";
if(localStorage.getItem('sktt_tab')) {
	tabTarget = localStorage.getItem('sktt_tab');
}

handleTabs(tabTarget);

function handleTabs(t) {
	let tab = document.querySelectorAll(".tab")[0];
	document.querySelectorAll(".tab").forEach(thisTab => {
		if(thisTab.dataset["content"] === t) {
			tab = thisTab;
			return;
		}
	});
	const target = tab.dataset["content"];

	tab.classList.add("active");

	let siblings = getSiblings(tab);
	siblings.forEach(sib => {
		sib.classList.remove("active");
	});

	document.querySelectorAll(".tab-content").forEach(tabContent => {
		if(tabContent.getAttribute("id") !== target && !tabContent.classList.contains("hidden")) {
			tabContent.classList.add("hidden");
		}

		if(tabContent.getAttribute("id") === target && tabContent.classList.contains("hidden")) {
			tabContent.classList.remove("hidden");
		}
	});

	localStorage.setItem("sktt_tab", target);
}

document.querySelectorAll(".tab").forEach(tab => {
	tab.addEventListener('click', function() {
		handleTabs(tab.dataset["content"]);
	});
});
/**
 * TIME ENTRIES
 */
let timeEntries = document.querySelector("#time_entries tbody");

function localTimeEntries(action) {
	let res;

	if(action === "get") {
		res = localStorage.getItem('sktt_time_entries') !== undefined ? JSON.parse(localStorage.getItem('sktt_time_entries')) : { message: 'no time_entries found' };
	}

	if(action === "set" || action === "save") {
		Object.keys(TIME_ENTRIES.docs).forEach(key => {
			if(!TIME_ENTRIES.docs[key].title) delete TIME_ENTRIES.docs[key];
		});

		localStorage.setItem('sktt_time_entries', JSON.stringify(TIME_ENTRIES));
		res = { message: 'saved time entries' };
	}

	if(action === "clear") {
		localStorage.removeItem('sktt_time_entries');
		res = { message: 'timers removed' };
	}

	return res;
}

function updateTimeEntries() {
	storedTimeEntries = localTimeEntries("get");

	if(storedTimeEntries.count > 0) {
		TIME_ENTRIES = storedTimeEntries;

		timeEntries.innerHTML = "";
		
		Object.keys(storedTimeEntries.docs).forEach(key => {
			const storedEntry = storedTimeEntries.docs[key];
			const t = getTimeObject(storedEntry.secondsElapsed);

			let row = document.createElement("tr");
			row.setAttribute("id", `te-${key}`);

			const entry = {
				title: storedEntry.title,
				time: `${padTime(t.h)}:${padTime(t.m)}:${padTime(t.s)}`,
				created: dayjs(storedEntry.created).format("YYYY-MM-DD HH:mm:ss"),
				updated: dayjs(storedEntry.updated).format("YYYY-MM-DD HH:mm:ss")
			}

			Object.keys(entry).forEach(k => {
				let td = document.createElement("td");
				td.innerText = entry[k];
				row.append(td);
			});

			let loadTd = document.createElement("td");
			let loadBtn = document.createElement("i");
			loadBtn.classList.add("load-time-entry", "fas", "fa-recycle");

			loadBtn.addEventListener("click", function() {
				let r = document.querySelector(`#te-${key}`);
				let rowId = r.getAttribute("id").substring(3);

				if(!TIMERS.docs[rowId]) {
					TIMERS.docs[rowId] = {
						...TIME_ENTRIES.docs[rowId]
					};

					TIMERS.count = TIMERS.count + 1;
					
					localTimers("save");
					buildTimer(rowId);
					handleTabs('timers');

				} else {
					showToast({
						position: "mm",
						title: "Timer Already Exists!",
						message: `A timer with the UUID <span class='font-mono'>${rowId}</span> already exists! If that timer should be for a different entry, please refresh the UUID for the timer and save it as a new time entry.`,
						type: "error"
					});

				}

			});

			loadTd.append(loadBtn);
			row.append(loadTd);

			let removeTd = document.createElement("td");
			let removeBtn = document.createElement("i");
			removeBtn.classList.add("remove-time-entry", "fad", "fa-minus-square", "fa-swap-opacity");

			removeBtn.addEventListener("click", function() {
				let r = document.querySelector(`#te-${key}`);
				r.remove();

				delete TIME_ENTRIES.docs[key];
				TIME_ENTRIES.count = TIME_ENTRIES.count > 0 ? TIME_ENTRIES.count - 1 : 0;
				localTimeEntries("save");
			});

			removeTd.append(removeBtn);
			row.append(removeTd);

			// clear table and re-add rows to avoid duplicates
			timeEntries.append(row);
		});
	}
}
updateTimeEntries();

document.querySelectorAll(".tab").forEach(tab => {
	if(tab.dataset["content"] === "time_entries") {
		tab.addEventListener("click", updateTimeEntries);
	}
});

document.querySelectorAll(".timer").forEach(timer => {
	timer.querySelector(".form").addEventListener("submit", updateTimeEntries);

	timer.querySelector(".title-input").addEventListener("blur", updateTimeEntries);
});