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
		document.querySelector("[name='seconds_display']").style.display = 'block';
		document.querySelector("[for='sec_numbers']").style.display = 'block';

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