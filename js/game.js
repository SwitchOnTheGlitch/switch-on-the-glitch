document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABILI GLOBALI ---
    let timerInterval;
    let timeLeft = 60;
    const CORRECT_PASSWORD = "test";
    let passwordAttempts = 5;
    let gamePassword = "";
    let boxId = "";
    let isMuted = true;

    // --- RIFERIMENTI AGLI ELEMENTI HTML ---
    const gameContainer = document.getElementById('game-container');
    const mainVideo = document.getElementById('main-video');
    const uiLayer = document.getElementById('ui-layer');
    const muteButton = document.getElementById('mute-button');

    // --- FUNZIONI DI GESTIONE VIDEO E UI ---
    function playVideo(videoName, loop = false, onEndedCallback = null) {
        mainVideo.src = `media/videos/${videoName}.mp4`;
        mainVideo.loop = loop;
        mainVideo.muted = isMuted;
        mainVideo.style.display = 'block';
        
        let playPromise = mainVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay bloccato, attendo interazione utente.");
            });
        }
        
        mainVideo.onended = onEndedCallback;
    }

    function showUI(content) {
        gameContainer.innerHTML = content;
        uiLayer.style.display = 'flex';
    }

    function hideUI() {
        uiLayer.style.display = 'none';
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
    function initializeGame() {
        // ## ECCO LA MODIFICA! ##
        // Inseriamo gli elementi direttamente nel game-container, senza un div intermedio.
        gameContainer.innerHTML = `
            <h2 id="start-title">Risolvi il Glitch!</h2>
            <button id="startButton">Vai</button>
        `;
        uiLayer.style.display = 'flex'; // Assicuriamoci che l'UI sia visibile
        
        document.getElementById('startButton').addEventListener('click', startGame);
        playVideo("Presentazione", true);
    }
    
    // 2. AVVIO DEL GIOCO
    function startGame() {
        boxId = `BOX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        playVideo("Gioco", true);
        
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

    // ... (Il resto del file rimane invariato) ...

    function checkPassword() {
        const passwordInput = document.getElementById('passwordInput');
        gamePassword = passwordInput.value;

        if (gamePassword.toLowerCase() === CORRECT_PASSWORD) {
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

    function endGame(isVictory, message) {
        hideUI();
        let finalVideo;
        let onEndCallback;

        if (isVictory) {
            finalVideo = "Vittoria";
            onEndCallback = () => {
                mainVideo.style.display = 'none';
                showUI(`
                    <h1>VITTORIA!</h1>
                    <p>${message}</p>
                    <div id="verification-data">
                        <p><strong>ID Box:</strong> ${boxId}</p>
                        <p><strong>Password Usata:</strong> ${gamePassword}</p>
                    </div>
                `);
            };
        } else {
            finalVideo = message.includes("Tempo") ? "Tempo" : "Tentativi";
            onEndCallback = () => {
                mainVideo.style.display = 'none';
                showUI(`<h1 class="defeat">SCONFITTA!</h1><p>${message}</p>`);
            };
        }
        playVideo(finalVideo, false, onEndCallback);
    }

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
