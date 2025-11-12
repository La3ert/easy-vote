let voteLock = false;
let voteTimeout = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.closeMe) {
        const tabId = message.tabId || (sender.tab && sender.tab.id);
        if (tabId) {
            chrome.tabs.remove(tabId, () => {
                resetVoteState();
            });
        }
    }

    if (message.voteSuccess) {
        const today = new Date().toISOString().split('T')[0];
        chrome.storage.sync.set({ lastVoteDate: today }, () => {
            resetVoteState();
            sendResponse({ success: true });
        });
        return true;
    }
});

function resetVoteState() {
    chrome.storage.local.set({
        isVoteInProcess: false,
        isWaitForVoteSuccess: false,
        isWaitForCloseTab: false,
        isSignComplete: false
    });
    voteLock = false;
    if (voteTimeout) {
        clearTimeout(voteTimeout);
        voteTimeout = null;
    }
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'voteCheck') {
        checkAndVote();
        console.log("Vote check");
    }
});

function init() {
    chrome.storage.sync.get(['nickname', 'voteLink', 'email'], (data) => {
        if (data.voteLink) checkAndVote();
    });

    chrome.alarms.create('voteCheck', { periodInMinutes: 10 });
}

async function checkAndVote() {

    console.log("checkAndVote started");

    if (voteLock) {
        console.log("voteLock lock");
        return;
    }
    voteLock = true;

    const data = await chrome.storage.sync.get(['lastVoteDate', 'nickname', 'voteLink', 'email']);
    const today = new Date().toISOString().split('T')[0];

    if (data.lastVoteDate === today) {
        voteLock = false;
        return;
    }

    if (data.voteLink) {
        await chrome.storage.local.set({
            isVoteInProcess: true,
            isWaitForVoteSuccess: false,
            isWaitForCloseTab: false,
            isSignComplete: false
        });

        voteTimeout = setTimeout(() => {
            resetVoteState();
        }, 10 * 60 * 1000);
        chrome.tabs.create({ url: data.voteLink });
    } else {
        voteLock = false;
    }
}

chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);
