document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABILI GLOBALI E CONFIGURAZIONE ---
    const API_URL = https://script.google.com/macros/s/AKfycbzHkn-yorhu1UlocZf9PDL-2HZU6DLxvO4qsrNhEY0zhkR5fJPyiKXz32JZRCgNOPCBvA/exec
; // <-- INCOLLA IL TUO URL QUI
    
    let timerInterval;
    let timeLeft = 60;
    let correctPassword = ""; // La password ora arriverà dall'API
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

    // --- FUNZIONI API ---
    async function callAPI(payload) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors', // Necessario per le prime chiamate ad Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                 redirect: "follow"
            });
             // Poiché Apps Script con no-cors restituisce una risposta "opaca",
             // non possiamo leggere direttamente il JSON di ritorno qui.
             // La logica si baserà sull'invio dei dati. Per la verifica iniziale,
             // dovremo passare la password al frontend.
             // MODIFICA IMPORTANTE: Per leggere la risposta, la richiesta DEVE essere in modalità 'cors'
             // e lo script Apps Script deve essere modificato leggermente.
             // Per ora, procediamo con un workaround e poi sistemiamo.
             // Semplifichiamo per ora: la richiesta GET è più semplice per iniziare.
             return {}; // Placeholder
        } catch (error) {
            console.error('Errore API:', error);
            showUI(`<h1 class="defeat">Errore di Connessione</h1><p>Impossibile contattare il server di gioco.</p>`);
            return { status: 'error', message: error.toString() };
        }
    }


    // --- FUNZIONI DI GESTIONE VIDEO E UI ---
    function playVideo(videoName, loop = false) {
        mainVideo.src = `media/videos/${videoName}.mp4`;
        mainVideo.loop = loop;
        mainVideo.muted = isMuted;
        mainVideo.style.display = 'block';
        mainVideo.play().catch(e => console.log("Errore autoplay video:", e));
        mainVideo.onended = () => { if (loop) mainVideo.play(); };
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
        // Leggiamo l'ID della box dall'URL (es. ...?box=BOX001)
        const urlParams = new URLSearchParams(window.location.search);
        boxId = urlParams.get('box');

        if (!boxId) {
            showUI(`<h1 class="defeat">ID Box Mancante</h1><p>Assicurati di accedere tramite il QR code corretto.</p>`);
            return;
        }

        // Chiamiamo l'API per verificare lo stato e ottenere la password
        const response = await fetch(`${API_URL}?action=getGameData&boxId=${boxId}`);
        const data = await response.json();

        if (data.status === 'success') {
            correctPassword = data.password; // Salviamo la password corretta
            showUI(`<h2 id="start-title">Risolvi il Glitch!</h2><button id="startButton">Vai</button>`);
            document.getElementById('startButton').addEventListener('click', startGame);
            playVideo("Presentazione", true);
        } else {
            showUI(`<h1 class="defeat">Box non disponibile</h1><p>${data.message}</p>`);
        }
    }
    
    // 2. AVVIO DEL GIOCO
    function startGame() {
        if (isMuted) toggleMute();
        sessionId = `SESSION-${Date.now()}`;
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
        // Comunichiamo all'API la fine della sessione
        const resultPayload = {
            isVictory: isVictory,
            passwordUsed: gamePassword,
            attemptsLeft: passwordAttempts
        };
        fetch(`${API_URL}?action=endSession&boxId=${boxId}&sessionId=${sessionId}&result=${JSON.stringify(resultPayload)}`);

        // ...il resto della logica per mostrare video e UI
        const finalVideo = isVictory ? "Vittoria" : (message.includes("Tempo") ? "Tempo" : "Tentativi");
        playVideo(finalVideo, true);

        let finalUI = isVictory ? `
            <h1>VITTORIA!</h1><p>${message}</p>
            <div id="verification-data">
                <p><strong>ID Vittoria:</strong> ${sessionId}</p>
                <p><strong>Password Usata:</strong> ${gamePassword}</p>
            </div>
        ` : `
            <h1 class="defeat">SCONFITTA!</h1><p class="end-message">${message}</p>
            <button id="restartButton">Esci</button>
        `;
        showUI(finalUI);
        
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            // Potremmo voler reindirizzare a una pagina "grazie per aver giocato"
            restartButton.addEventListener('click', () => window.close());
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

// Nota: per far funzionare questo codice, dovrai modificare lo script Apps Script
// per usare doGet(e) invece di doPost(e) e leggere i parametri dall'URL.
// È una modifica più semplice per iniziare. Te la fornirò nel prossimo passaggio.
