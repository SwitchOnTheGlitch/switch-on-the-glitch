document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAZIONE ---
    const API_URL = "https://script.google.com/macros/s/AKfycbzHkn-yorhu1UlocZf9PDL-2HZU6DLxvO4qsrNhEY0zhkR5fJPyiKXz32JZRCgNOPCBvA/exec";
    
    // --- VARIABILI GLOBALI ---
    let timerInterval;
    let timeLeft = 60;
    let correctPassword = "";
    let passwordAttempts = 5;
    let gamePassword = "";
    let boxId = "";
    let sessionId = "";
    let isMuted = true;

    // --- RIFERIMENTI AGLI ELEMENTI HTML ---
    const gameContainer = document.getElementById('game-container');
    const mainVideo = document.getElementById('main-video');
    const uiLayer = document.getElementById('ui-layer');
    const muteButton = document.getElementById('mute-button');
    
    // --- FUNZIONI DI GESTIONE VIDEO E UI ---
    function playVideo(videoName, loop = false) {
        mainVideo.src = `media/videos/${videoName}.mp4`;
        mainVideo.loop = loop;
        mainVideo.muted = isMuted;
        mainVideo.style.display = 'block';
        mainVideo.onended = () => { if (loop) mainVideo.play(); };
        mainVideo.play().catch(e => console.error("Errore autoplay video:", e));
    }

    function showUI(content) {
        gameContainer.innerHTML = content;
        uiLayer.style.display = 'flex';
    }
    
    // --- GESTIONE AUDIO ---
    function toggleMute() {
        isMuted = !isMuted;
        mainVideo.muted = isMuted;
        muteButton.textContent = isMuted ? '🔇' : '🔊';
    }
    muteButton.addEventListener('click', toggleMute);

    // --- FLUSSO DEL GIOCO ---

    // 1. STATO INIZIALE
    async function initializeGame() {
        const urlParams = new URLSearchParams(window.location.search);
        boxId = urlParams.get('box');

        if (!boxId) {
            showUI(`<h1 class="defeat">ID Box Mancante</h1><p>Scansiona il QR code corretto per iniziare.</p>`);
            return;
        }

        try {
            const response = await fetch(`${API_URL}?action=getGameData&boxId=${boxId}`);
            const data = await response.json();

            if (data.status === 'success') {
                correctPassword = data.password;
                showUI(`
                    <h2 id="start-title">Risolvi il Glitch!</h2>
                    <button id="startButton">Vai</button>
                `);
                document.getElementById('startButton').addEventListener('click', startGame);
                playVideo("presentazione", true);
            } else {
                showUI(`<h1 class="defeat">Box non disponibile</h1><p>${data.message}</p>`);
            }
        } catch (error) {
            console.error("Errore di comunicazione con l'API:", error);
            showUI(`<h1 class="defeat">Errore di Connessione</h1><p>Impossibile contattare i server di gioco.</p>`);
        }
    }
    
    // 2. AVVIO DEL GIOCO
    function startGame() {
        if (isMuted) toggleMute();
        sessionId = `SESSION-${Date.now()}`;
        playVideo("gioco", true);
        
        showUI(`
            <div id="timer">Tempo Rimanente: ${timeLeft}</div>
            <div id="attempts-counter">Tentativi Rimasti: ${passwordAttempts}</div>
            <div id="password-section">
                <input type="text" id="passwordInput" placeholder="Password...">
                <button id="verifyButton">Verifica</button>
            </div>
            <div id="feedback-message" style="min-height: 24px;"></div>
        `);
        
        document.getElementById('verifyButton').addEventListener('click', checkPassword);
        startTimer();
    }

    // 3. CONTROLLO PASSWORD
    function checkPassword() {
        const passwordInput = document.getElementById('passwordInput');
        gamePassword = passwordInput.value;

        if (gamePassword.toLowerCase() === correctPassword.toLowerCase()) {
            clearInterval(timerInterval);
            endGame(true, "Password corretta!");
        } else {
            passwordAttempts--;
            document.getElementById('attempts-counter').textContent = `Tentativi Rimasti: ${passwordAttempts}`;
            document.getElementById('feedback-message').textContent = "Password errata!";
            passwordInput.value = "";
            if (passwordAttempts <= 0) {
                clearInterval(timerInterval);
                endGame(false, "Hai esaurito i tentativi!");
            }
        }
    }

    // 4. FINE DEL GIOCO
    function endGame(isVictory, message) {
        const resultPayload = {
            isVictory: isVictory,
            passwordUsed: gamePassword,
            attemptsLeft: passwordAttempts
        };
        fetch(`${API_URL}?action=endSession&boxId=${boxId}&sessionId=${sessionId}&result=${JSON.stringify(resultPayload)}`);

        const finalVideo = isVictory ? "vittoria" : (message.includes("Tempo") ? "tempo" : "tentativi");
        playVideo(finalVideo, true);

        const finalUI = isVictory ? `
            <h1>VITTORIA!</h1><p>${message}</p>
            <div id="verification-data">
                <p><strong>ID Vittoria:</strong> ${sessionId}</p>
                <p><strong>Password Usata:</strong> ${gamePassword}</p>
            </div>
        ` : `
            <h1 class="defeat">SCONFITTA!</h1><p class="end-message">${message}</p>
            <button id="restartButton">Riprova</button>
        `;
        showUI(finalUI);
        
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => location.reload());
        }
    }

    // 5. TIMER
    function startTimer() {
        const timerElement = document.getElementById('timer');
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `Tempo Rimanente: ${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame(false, "Tempo scaduto!");
            }
        }, 1000);
    }
    
    initializeGame();
});
