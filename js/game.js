document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABILI GLOBALI DEL GIOCO ---
    let timerInterval; // Variabile per memorizzare il nostro timer
    let timeLeft = 60; // Tempo iniziale in secondi
    const CORRECT_PASSWORD = "test"; // La password corretta (per ora)

    // --- RIFERIMENTI AGLI ELEMENTI HTML ---
    const startButton = document.getElementById('startButton');
    const questionContainer = document.getElementById('question-container');
    const controlsContainer = document.getElementById('controls-container');
    const videoContainer = document.getElementById('video-container');

    // --- EVENT LISTENER ---
    startButton.addEventListener('click', startGame);

    // --- FUNZIONI PRINCIPALI ---
    function startGame() {
        // Nascondiamo gli elementi iniziali
        videoContainer.style.display = 'none';
        controlsContainer.style.display = 'none';

        // Creiamo la nuova schermata di gioco
        questionContainer.innerHTML = `
            <div id="timer">Tempo Rimanente: ${timeLeft}</div>
            <div id="password-section">
                <label for="passwordInput">Inserisci la Password:</label>
                <input type="password" id="passwordInput" placeholder="Scrivi qui...">
                <button id="verifyButton">Verifica</button>
            </div>
            <div id="feedback-message"></div>
        `;
        
        // Colleghiamo la funzione di verifica al nuovo pulsante
        const verifyButton = document.getElementById('verifyButton');
        verifyButton.addEventListener('click', checkPassword);

        // Facciamo partire il timer
        startTimer();
    }

    function startTimer() {
        const timerElement = document.getElementById('timer');
        // Usiamo setInterval per eseguire una funzione ogni 1000ms (1 secondo)
        timerInterval = setInterval(() => {
            timeLeft--; // Decrementiamo il tempo
            timerElement.textContent = `Tempo Rimanente: ${timeLeft}`;

            // Se il tempo scade
            if (timeLeft <= 0) {
                clearInterval(timerInterval); // Stoppiamo il timer
                endGame(false); // Chiamiamo la funzione di fine gioco (sconfitta)
            }
        }, 1000);
    }
    
    function checkPassword() {
        const passwordInput = document.getElementById('passwordInput');
        const feedbackMessage = document.getElementById('feedback-message');
        
        if (passwordInput.value === CORRECT_PASSWORD) {
            clearInterval(timerInterval); // Stoppiamo il timer
            endGame(true); // Chiamiamo la funzione di fine gioco (vittoria)
        } else {
            feedbackMessage.textContent = "Password errata. Riprova!";
            feedbackMessage.style.color = "red";
        }
    }

    function endGame(isVictory) {
        if (isVictory) {
            questionContainer.innerHTML = `<h1>VITTORIA!</h1><p>Password corretta!</p>`;
        } else {
            questionContainer.innerHTML = `<h1>SCONFITTA!</h1><p>Tempo scaduto!</p>`;
        }
    }

});
