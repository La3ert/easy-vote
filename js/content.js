chrome.runtime.sendMessage({ getTabId: true }, (response) => {
    window.tabId = response?.tabId || null;
});

window.addEventListener('load', () => {

    chrome.storage.local.get([
        'isVoteInProcess',
        'isWaitForVoteSuccess',
        'isWaitForCloseTab',
        'isSignComplete'
    ], (result) => {

        if (!result.isVoteInProcess) return;

        if (result.isWaitForCloseTab) {
            setTimeout(closeTab, 1000);
            return;
        }

        if (result.isWaitForVoteSuccess && result.isSignComplete) {
            setTimeout(waitForVoteSuccess, 1000);
            return;
        }

        if (location.hostname.includes("minecraft-servers.ru") && !result.isSignComplete) {
            setTimeout(waitForVoteButton, 1000);
            return;
        }

        if (location.href.includes("accountchooser")) {
            setTimeout(waitForGoogleEmail, 1000);
        }
    });
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.isWaitForVoteSuccess?.newValue && changes.isSignComplete?.newValue) {
        setTimeout(waitForVoteSuccess, 1000);
    }

    if (changes.isWaitForCloseTab?.newValue) {
        setTimeout(closeTab, 1000);
    }
});

function waitForVoteButton() {
    const button = document.querySelector('button.app_btn.px-10.h-12');
    if (button) {
        button.click();
        setTimeout(waitForNickInput, 1000);
    } else {
        setTimeout(waitForVoteButton, 1000);
    }
}

function waitForNickInput() {
    const input = document.getElementById('username');
    if (input) {
        chrome.storage.sync.get(['nickname'], (data) => {
            const inputEvent = new Event('input', { bubbles: true });
            const changeEvent = new Event('change', { bubbles: true });

            input.focus();
            input.value = data.nickname || '';
            input.dispatchEvent(inputEvent);
            input.dispatchEvent(changeEvent);

            setTimeout(waitForGoogleButton, 1000);
        });
    } else {
        setTimeout(waitForNickInput, 1000);
    }
}

function waitForGoogleButton() {
    const googleButton = document.querySelector('button img[alt="google"]');
    if (googleButton) {
        googleButton.click();
        setTimeout(waitForGoogleEmail, 2000);
    } else {
        setTimeout(waitForGoogleButton, 1000);
    }
}

function waitForGoogleEmail() {
    chrome.storage.sync.get(['email'], (data) => {
        if (!data.email) return;

        const userEmail = data.email;
        const emailDiv = document.querySelector(`div[data-email="${userEmail}"]`);
        if (emailDiv) {
            chrome.storage.local.set({ isWaitForVoteSuccess: true, isSignComplete: true });
            emailDiv.click();
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
    chrome.storage.local.set({
        isVoteInProcess: false,
        isWaitForVoteSuccess: false,
        isWaitForCloseTab: false,
        isSignComplete: false
    }, () => {
        chrome.runtime.sendMessage({ voteSuccess: true }, () => {
            chrome.runtime.sendMessage({ closeMe: true });
        });
    });
}
