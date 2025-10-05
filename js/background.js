chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.closeMe) {
        const tabId = message.tabId || (sender.tab && sender.tab.id);
        if (tabId) {
            chrome.tabs.remove(tabId, () => {
                console.log("Closed tab:", tabId);
                chrome.storage.local.set({ isVoteInProcess: false });
            });
        }
    }

    if (message.voteSuccess) {
        const today = new Date().toISOString().split('T')[0];
        chrome.storage.sync.set({ lastVoteDate: today }, () => {
            console.log("Vote success recorded:", today);
            sendResponse({ success: true });
        });
        return true;
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
            chrome.storage.local.set({
                isVoteInProcess: true,
                isWaitForVoteSuccess: false,
                isWaitForCloseTab: false,
                isSignComplete: false
            }, () => {
                chrome.tabs.create({ url: data.voteLink });
            });
        }
    });
}


init()