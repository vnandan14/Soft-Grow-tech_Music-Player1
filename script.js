{
    const audio = document.getElementById('main-audio');
    const musicInput = document.getElementById('music-input');
    const trackListElement = document.getElementById('track-list');
    const playBtn = document.getElementById('play-btn');
    const themeBtn = document.getElementById('theme-btn');
    const volSlider = document.getElementById('vol-slider');

    let library = [];
    let recents = [];
    let currentMode = 'home'; 

    // --- Theme Logic ---
    themeBtn.addEventListener('click', () => {
        const root = document.documentElement;
        const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', newTheme);
        themeBtn.innerText = newTheme === 'dark' ? '🌙 Night' : '☀️ Day';
    });

    // --- Navigation Logic ---
    document.getElementById('nav-home').onclick = () => {
        currentMode = 'home';
        updateNavUI('nav-home');
        renderTracks(library);
    };
    document.getElementById('nav-recent').onclick = () => {
        currentMode = 'recent';
        updateNavUI('nav-recent');
        renderTracks(recents);
    };
    function updateNavUI(id) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    // --- Volume Logic ---
    volSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
        document.getElementById('vol-icon').innerText = audio.volume == 0 ? '🔇' : '🔊';
    });

    // --- File Loading ---
    musicInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            library.push({ title: file.name.replace(/\.[^/.]+$/, ""), url: URL.createObjectURL(file) });
        });
        renderTracks(library);
        if (!audio.src && library.length > 0) playSpecific(0);
    });

    function renderTracks(list) {
        trackListElement.innerHTML = list.map((song, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${song.title}</td>
                <td><button onclick="playSpecific(${i})">▶</button></td>
            </tr>
        `).join('');
    }

    window.playSpecific = function(i) {
        const list = currentMode === 'home' ? library : recents;
        const song = list[i];
        audio.src = song.url;
        audio.play();
        playBtn.innerText = "⏸";
        document.getElementById('current-title').innerText = song.title;
        document.getElementById('mini-title').innerText = song.title;

        if (!recents.includes(song)) {
            recents.unshift(song);
            if (recents.length > 8) recents.pop();
        }
    };

    playBtn.onclick = () => {
        if (audio.paused) { audio.play(); playBtn.innerText = "⏸"; }
        else { audio.pause(); playBtn.innerText = "▶"; }
    };

    audio.ontimeupdate = () => {
        const prog = (audio.currentTime / audio.duration) * 100 || 0;
        document.getElementById('bar-fill').style.width = prog + "%";
        const m = Math.floor(audio.currentTime / 60), s = Math.floor(audio.currentTime % 60);
        document.getElementById('time-cur').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    document.getElementById('bar-click').onclick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    };
}