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