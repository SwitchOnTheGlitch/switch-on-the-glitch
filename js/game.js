document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABILI GLOBALI DEL GIOCO ---
    let timerInterval;
    let timeLeft = 60;
    const CORRECT_PASSWORD = "test";

    // --- RIFERIMENTI AGLI ELEMENTI HTML ---
    const startButton = document.getElementById('startButton');
    const questionContainer = document.getElementById('question-container');
    const controlsContainer = document.getElementById('controls-container');
    const videoContainer = document.getElementById('video-container');
    const gameVideo = document.getElementById('game-video'); 

    // --- EVENT LISTENER ---
    startButton.addEventListener('click', startGame);

    // --- FUNZIONI PRINCIPALI ---
    function startGame() {
        controlsContainer.style.display = 'none'; 
        videoContainer.style.display = 'none'; 

        questionContainer.innerHTML = `
            <div id="timer">Tempo Rimanente: ${timeLeft}</div>
            <div id="password-section">
                <label for="passwordInput">Inserisci la Password:</label>
                <input type="text" id="passwordInput" placeholder="Scrivi qui...">
                <button id="verifyButton">Verifica</button>
            </div>
            <div id="feedback-message"></div>
        `;
        
        document.getElementById('verifyButton').addEventListener('click', checkPassword);
        startTimer();
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
    
    function checkPassword() {
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput.value.toLowerCase() === CORRECT_PASSWORD) {
            clearInterval(timerInterval);
            playVideoEnigma(); 
        } else {
            const feedbackMessage = document.getElementById('feedback-message');
            feedbackMessage.textContent = "Password errata. Riprova!";
            feedbackMessage.style.color = "red";
        }
    }

    function playVideoEnigma() {
        questionContainer.style.display = 'none'; 
        videoContainer.style.display = 'flex'; 

        // ## ECCO LA MODIFICA! ##
        // Il percorso ora punta al tuo video.
        // Assicurati che il tuo file si chiami 'Vittoria.mp4' o modifica il nome qui.
        gameVideo.src = "media/videos/Vittoria.mp4";
        
        gameVideo.addEventListener('ended', showFirstQuestion);
        
        gameVideo.muted = true;
        gameVideo.play();
    }

    function showFirstQuestion() {
        videoContainer.style.display = 'none'; 
        questionContainer.style.display = 'block'; 

        questionContainer.innerHTML = `
            <div id="question-text">Qual era il colore della macchina nel video?</div>
            <button class="choice-btn" data-correct="false">Rossa</button>
            <button class="choice-btn" data-correct="true">Blu</button>
            <button class="choice-btn" data-correct="false">Gialla</button>
        `;

        const choiceButtons = document.querySelectorAll('.choice-btn');
        choiceButtons.forEach(button => {
            button.addEventListener('click', checkAnswer);
        });
    }

    function checkAnswer(event) {
        const selectedButton = event.target;
        const isCorrect = selectedButton.dataset.correct === 'true';

        if (isCorrect) {
            endGame(true, "Risposta esatta!");
        } else {
            endGame(false, "Risposta sbagliata!");
        }
    }

    function endGame(isVictory, message) {
        if (isVictory) {
            questionContainer.innerHTML = `<h1>VITTORIA!</h1><p>${message}</p>`;
        } else {
            questionContainer.innerHTML = `<h1>SCONFITTA!</h1><p>${message}</p>`;
        }
        questionContainer.style.display = 'block';
    }

});
