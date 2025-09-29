chrome.runtime.sendMessage({ getTabId: true }, (response) => {
    window.tabId = response.tabId;
});

window.addEventListener('load', () => {
    chrome.storage.local.get(['isVoteInProcess', 'isWaitForVoteSuccess', 'isWaitForCloseTab'], (result) => {
        if (!result.isVoteInProcess) return;

        if (location.hostname.includes("minecraft-servers.ru") && !result.isWaitForCloseTab) {
            setTimeout(waitForVoteButton, 2000);
        }

        if (location.href.includes("oauthchooseaccount")) {
            setTimeout(waitForGoogleEmail, 2000);
        }

        if (result.isWaitForVoteSuccess && location.href.includes("signin/oauth/id" )) {
            setTimeout(waitForVoteSuccess, 2000);
        }

        if (result.isWaitForCloseTab) {
            setTimeout(closeTab, 2000);
        }
    });
});




function waitForVoteButton() {
    const button = document.querySelector('button.app_btn.px-10.h-12');
    chrome.storage.local.get(['isVoteInProcess'], (result) => {
        if (result.isVoteInProcess) {
            if (button) {
                button.click();
                waitForNickInput();
            } else {
                setTimeout(waitForVoteButton, 1000);
            }
        }
    });
}

function waitForNickInput() {

    const input = document.getElementById('username');

    const inputEvent = new Event('input', { bubbles: true });
    const changeEvent = new Event('change', { bubbles: true });

    if (input) {
        input.focus();
        input.select();

        chrome.storage.sync.get(['nickname'], (data) => {
            input.value = data.nickname;
            input.dispatchEvent(inputEvent);
            input.dispatchEvent(changeEvent);
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
        waitForGoogleEmail();
    } else {
        setTimeout(waitForGoogleButton, 1000);
    }
}

function waitForGoogleEmail() {
    chrome.storage.sync.get(['email'], (data) => {
        if (!data.email) {
            return;
        }
        const userEmail = data.email;
        const emailDiv = document.querySelector(`div[data-email="${userEmail}"]`);
        if (emailDiv) {
            emailDiv.click();
            chrome.storage.local.set({ isWaitForVoteSuccess: true });
        } else {
            setTimeout(waitForGoogleEmail, 1000);
        }
    });
}

function waitForVoteSuccess() {
    if (location.href.startsWith("https://accounts.google.com/signin/oauth/id")) {

        const buttons = document.querySelectorAll('button[type="button"]');
        const possibleTexts = ['Продолжить', 'Continue', 'Продовжити', 'Далей'];

        const button = Array.from(buttons).find(btn => {
            const span = btn.querySelector('span');
            return span && possibleTexts.includes(span.textContent.trim());
        });
        if (button) {
            button.click();
            chrome.storage.local.set({ isWaitForCloseTab: true });
        }
    } else {
        chrome.storage.local.set({ isWaitForCloseTab: true });
    }
}

function closeTab() {
    chrome.storage.local.set({ isVoteInProcess: false, isWaitForVoteSuccess: false, isWaitForCloseTab: false }, () => {
        chrome.runtime.sendMessage({ voteSuccess: true }, () => {
            chrome.runtime.sendMessage({ closeTab: true, tabId: window.tabId });
        });
    });
}
