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
    const gameVideo = document.getElementById('game-video'); // Nuovo elemento video

    // --- EVENT LISTENER ---
    startButton.addEventListener('click', startGame);

    // --- FUNZIONI PRINCIPALI ---
    function startGame() {
        controlsContainer.style.display = 'none'; // Nascondiamo solo il pulsante di avvio
        videoContainer.style.display = 'none'; // Nascondiamo il video all'inizio

        // Mostriamo subito la schermata della password
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
            clearInterval(timerInterval); // Fermiamo il timer
            // Invece di finire il gioco, facciamo partire il video-enigma
            playVideoEnigma(); 
        } else {
            const feedbackMessage = document.getElementById('feedback-message');
            feedbackMessage.textContent = "Password errata. Riprova!";
            feedbackMessage.style.color = "red";
        }
    }

    function playVideoEnigma() {
        questionContainer.style.display = 'none'; // Nascondiamo la sezione domande
        videoContainer.style.display = 'flex'; // Mostriamo quella del video

        // Impostiamo la fonte del video. Useremo un video di prova gratuito.
        gameVideo.src = "https://videos.pexels.com/video-files/2099391/2099391-hd_1280_720_25fps.mp4";
        
        // Quando il video finisce, mostriamo la domanda
        gameVideo.addEventListener('ended', showFirstQuestion);
        
        gameVideo.play();
    }

    function showFirstQuestion() {
        videoContainer.style.display = 'none'; // Nascondiamo di nuovo il video
        questionContainer.style.display = 'block'; // E mostriamo le domande

        questionContainer.innerHTML = `
            <div id="question-text">Qual era il colore della macchina nel video?</div>
            <button class="choice-btn">Rossa</button>
            <button class="choice-btn">Blu</button>
            <button class="choice-btn">Gialla</button>
        `;

        // Aggiungeremo la logica per i pulsanti di risposta nel prossimo step
    }

    function endGame(isVictory, message) {
        if (isVictory) {
            questionContainer.innerHTML = `<h1>VITTORIA!</h1><p>${message}</p>`;
        } else {
            questionContainer.innerHTML = `<h1>SCONFITTA!</h1><p>${message}</p>`;
        }
        questionContainer.style.display = 'block'; // Assicuriamoci che sia visibile
    }

});
