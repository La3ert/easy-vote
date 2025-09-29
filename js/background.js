chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.getTabId && sender.tab && sender.tab.id) {
        sendResponse({ tabId: sender.tab.id });
        return; // Не забывайте завершать обработку
    }
    if (message.voteSuccess) {
        const today = new Date().toISOString().split('T')[0];
        chrome.storage.sync.set({ lastVoteDate: today }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    if (message.closeTab && message.tabId) {
        chrome.tabs.remove(message.tabId, () => {
            chrome.storage.local.set({ isVoteInProcess: false });
        });
    }
});
function init () {
    chrome.storage.sync.get(['nickname', 'voteLink', 'email'], (data) => {
        if (data.voteLink) checkAndVote();
    });

    chrome.alarms.create('voteCheck', {periodInMinutes: 30 });

    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'voteCheck') {
            checkAndVote();
        }
    })
}

function checkAndVote() {
    chrome.storage.sync.get(['lastVoteDate', 'nickname', 'voteLink', 'email'], (data) => {

        const today = new Date().toISOString().split('T')[0];

        if (data.lastVoteDate === today) {
            console.log('Already voted today.');
            return;
        }

        if (data.voteLink) {
            chrome.storage.local.set({ isVoteInProcess: true });
            chrome.tabs.create({url: data.voteLink});
        }
    })
}

init()