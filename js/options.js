window.addEventListener('load', () => {
    chrome.storage.sync.get(['nickname', 'voteLink', 'email'], (data) => {
        if (data.nickname) {
            document.getElementById('nickname').value = data.nickname;
        }
        if (data.voteLink) {
            document.getElementById('voteLink').value = data.voteLink;
        }
        if (data.email) {
            document.getElementById('email').value = data.email;
        }
    });

    showCurrentData();
});

document.getElementById("settingsForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const nickname = document.getElementById('nickname').value;
    const voteLink = document.getElementById('voteLink').value;
    const email = document.getElementById('email').value;

    if (!voteLink.startsWith('https://minecraft-servers.ru/server/')) {
        const status = document.getElementById('status');
        status.textContent = 'Vote link must start with "https://minecraft-servers.ru/server/".';
        setTimeout(() => {
            status.textContent = ''
        }, 4000);
        return;
    }

    chrome.storage.sync.set({ nickname, voteLink, email}, () => {
        const status = document.getElementById('status');
        status.textContent = 'Settings saved.'
        showCurrentData();
        setTimeout(() => {
            status.textContent = ''
        }, 2000);
    });
});

document.getElementById("clearData").addEventListener("click", (e) => {
    e.preventDefault();

    chrome.storage.sync.clear(() => {
        document.getElementById('nickname').value = '';
        document.getElementById('voteLink').value = '';
        document.getElementById('email').value = '';

        const status = document.getElementById('status');
        status.textContent = 'Data cleared.'
        showCurrentData();
        setTimeout(() => {
            status.textContent = ''
        }, 2000);
    });
});

function showCurrentData() {
    chrome.storage.sync.get(['nickname', 'voteLink', 'email', ], (data) => {
        const display = document.getElementById('currentData');
        display.textContent = `
            Nickname: ${data.nickname || 'not set'}
            Vote link: ${data.voteLink || 'not set'}
            Email: ${data.email || 'not set'}`;
        document.getElementById('clearData').disabled = false;
        if (!data.nickname && !data.voteLink && !data.email) {
            display.textContent = 'No data set.';
            document.getElementById('clearData').disabled = true;
        }
    });
}


