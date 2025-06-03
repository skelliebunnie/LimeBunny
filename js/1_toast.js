function showToast(opts) {
	options = {
		type: 'info',
		fadeDelay: 5000,
		position: 'bl', // bl: bottom-left, br: bottom-right, etc.
		title: "Toast Title",
		message: "This is a toast notification",
		...opts
	}
	let toastId = uuid_gen();

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