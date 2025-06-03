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
	let idx = uuid_gen();
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
			let newId = uuid_gen();
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
	let newTimerIndex = uuid_gen();
	buildTimer(newTimerIndex);
});