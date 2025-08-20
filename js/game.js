document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABILI GLOBALI ---
    let timerInterval;
    let timeLeft = 60;
    const CORRECT_PASSWORD = "test";
    let passwordAttempts = 5;
    let gamePassword = "";
    let boxId = "";

    // --- RIFERIMENTI AGLI ELEMENTI HTML ---
    const gameContainer = document.getElementById('game-container');
    const mainVideo = document.getElementById('main-video');
    const uiLayer = document.getElementById('ui-layer');

    // --- FUNZIONI DI GESTIONE VIDEO E UI ---
    function playVideo(videoName, loop = false, onEndedCallback = null) {
        mainVideo.src = `media/videos/${videoName}.mp4`;
        mainVideo.loop = loop;
        mainVideo.style.display = 'block'; // Mostra il video
        mainVideo.play();
        
        // Se c'è una funzione da eseguire alla fine del video, la impostiamo
        mainVideo.onended = onEndedCallback;
    }

    function showUI(content) {
        gameContainer.innerHTML = content;
        uiLayer.style.display = 'flex'; // Mostra l'interfaccia
    }

    function hideUI() {
        uiLayer.style.display = 'none'; // Nasconde l'interfaccia
    }

    // --- FLUSSO DEL GIOCO ---

    // 1. STATO INIZIALE: Video di presentazione
    function initializeGame() {
        // Mostra il pulsante "Inizia" sopra il video
        showUI(`<button id="startButton">Inizia Gioco</button>`);
        document.getElementById('startButton').addEventListener('click', startGame);
        playVideo("Presentazione", true);
    }
    
    // 2. AVVIO DEL GIOCO: Click su "Inizia"
    function startGame() {
        boxId = `BOX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        playVideo("Gioco", true); // Video di gioco in background
        
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
        hideUI(); // Nascondiamo l'interfaccia per goderci il video finale
        
        let finalVideo;
        let onEndCallback;

        if (isVictory) {
            finalVideo = "Vittoria";
            onEndCallback = () => {
                // Finito il video, mostriamo i dati di verifica
                mainVideo.style.display = 'none'; // Nascondiamo anche il video
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

    // --- TIMER ---
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
    
    // Avviamo il tutto
    initializeGame();
});
