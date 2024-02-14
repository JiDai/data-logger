function handleShown() {
	console.log("panel is being shown");
}

function handleHidden() {
	console.log("panel is being hidden");
}

browser.devtools.panels
	.create(
		"Data logger", // title
		"../../icons/icon.png", // icon
		"./app/index.html", // content
	)
	.then((newPanel) => {
		newPanel.onShown.addListener(handleShown);
		newPanel.onHidden.addListener(handleHidden);
	});
