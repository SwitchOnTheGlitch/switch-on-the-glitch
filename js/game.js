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
    function playVideo(videoName, loop = false) {
        mainVideo.src = `media/videos/${videoName}.mp4`;
        mainVideo.loop = loop;
        mainVideo.muted = isMuted;
        mainVideo.style.display = 'block';
        mainVideo.play().catch(e => console.log("Errore autoplay video:", e));
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
    function initializeGame() {
        showUI(`<button id="startButton">Vai</button>`);
        document.getElementById('startButton').addEventListener('click', startGame);
        playVideo("Presentazione", true);
    }
    
    // 2. AVVIO DEL GIOCO
    function startGame() {
        // ## MODIFICA ##: Attiviamo l'audio automaticamente
        if (isMuted) {
            toggleMute();
        }
        
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

    // 3. CONTROLLO PASSWORD
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

    // 4. FINE DEL GIOCO
    function endGame(isVictory, message) {
        let finalVideo;
        let finalUI;

        if (isVictory) {
            finalVideo = "Vittoria";
            finalUI = `
                <h1>VITTORIA!</h1>
                <p>${message}</p>
                <div id="verification-data">
                    <p><strong>ID Box:</strong> ${boxId}</p>
                    <p><strong>Password Usata:</strong> ${gamePassword}</p>
                </div>
            `;
        } else {
            finalVideo = message.includes("Tempo") ? "Tempo" : "Tentativi";
            finalUI = `
                <h1 class="defeat">SCONFITTA!</h1>
                <p>${message}</p>
                <button id="restartButton">Riprova</button>
            `;
        }
        
        // ## MODIFICA ##: Mostriamo video e UI contemporaneamente
        playVideo(finalVideo, true); // Tutti i video ora girano in loop
        showUI(finalUI);
        
        // Se c'è il pulsante riprova, gli diamo la sua funzione
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                location.reload(); // Ricarica la pagina per ricominciare
            });
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
