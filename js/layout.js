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