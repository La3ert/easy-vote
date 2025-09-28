window.addEventListener('load', () => {
    waitForVoteButton()
});

function waitForVoteButton() {
    const button = document.querySelector('button.app_btn.px-10.h-12');
    if (button) {
        button.click();
        waitForNickInput();
    } else {
        setTimeout(waitForVoteButton, 1000);
    }
}

function waitForNickInput() {
    const input = document.getElementById('username');
    if (input) {
        chrome.storage.sync.get(['nickname'], (data) => {
            input.value = data.nickname;
            waitForGoogleButton();
        });
    } else {
        setTimeout(waitForNickInput, 1000);
    }
}

function waitForGoogleButton() {
    const googleButton = document.querySelector('button img[alt="google"]')
    if (googleButton) {
        googleButton.click();

    } else {
        setTimeout(waitForGoogleButton, 1000);
    }
}


chrome.runtime.sendMessage({ voteSuccess: true });
