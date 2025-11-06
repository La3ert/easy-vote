document.getElementById("openOptions").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "html/options.html" });
});

document.getElementById("howToUse").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "#" });
});

document.getElementById("moreInformation").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "#" });
})