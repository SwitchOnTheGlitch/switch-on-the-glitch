document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABILI GLOBALI DEL GIOCO ---
    let timerInterval;
    let timeLeft = 60;
    const CORRECT_PASSWORD = "test";
    let passwordAttempts = 5;
    let gamePassword = "";
    let boxId = "";

    // --- RIFERIMENTI AGLI ELEMENTI HTML ---
    const startButton = document.getElementById('startButton');
    const questionContainer = document.getElementById('question-container');
    const controlsContainer = document.getElementById('controls-container');
    const videoContainer = document.getElementById('video-container');
    const mainVideo = document.getElementById('main-video');

    // --- FUNZIONI DI INIZIALIZZAZIONE ---
    
    // Funzione per riprodurre un video specifico
    function playVideo(videoName, loop = false) {
        mainVideo.src = `media/videos/${videoName}.mp4`;
        mainVideo.loop = loop;
        mainVideo.play();
    }
    
    // All'avvio della pagina, parte il video di presentazione in loop
    playVideo("Presentazione", true);

    // --- EVENT LISTENER ---
    startButton.addEventListener('click', startGame);

    // --- FUNZIONI PRINCIPALI ---
    function startGame() {
        mainVideo.loop = false; // Interrompiamo il loop del video di presentazione
        videoContainer.style.display = 'none'; // Nascondiamo il video
        controlsContainer.style.display = 'none'; // Nascondiamo il pulsante
        questionContainer.style.display = 'block'; // Mostriamo l'area delle domande
        
        boxId = `BOX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        questionContainer.innerHTML = `
            <div id="timer">Tempo Rimanente: ${timeLeft}</div>
            <div id="attempts-counter">Tentativi Rimasti: ${passwordAttempts}</div>
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
        gamePassword = passwordInput.value;

        if (gamePassword.toLowerCase() === CORRECT_PASSWORD) {
            clearInterval(timerInterval);
            endGame(true, "Password corretta!");
        } else {
            passwordAttempts--;
            const attemptsCounter = document.getElementById('attempts-counter');
            const feedbackMessage = document.getElementById('feedback-message');
            
            attemptsCounter.textContent = `Tentativi Rimasti: ${passwordAttempts}`;
            feedbackMessage.textContent = "Password errata. Riprova!";
            feedbackMessage.style.color = "red";

            if (passwordAttempts <= 0) {
                clearInterval(timerInterval);
                endGame(false, "Hai esaurito i tentativi!");
            }
        }
    }

    function endGame(isVictory, message) {
        questionContainer.style.display = 'none'; // Nascondiamo l'area domande
        videoContainer.style.display = 'flex'; // Mostriamo quella video

        if (isVictory) {
            playVideo("Vittoria");
            // Quando il video di vittoria finisce, mostriamo i dati
            mainVideo.onended = () => {
                videoContainer.style.display = 'none';
                questionContainer.style.display = 'block';
                questionContainer.innerHTML = `
                    <h1>VITTORIA!</h1>
                    <p>${message}</p>
                    <div id="verification-data">
                        <p><strong>ID Box:</strong> ${boxId}</p>
                        <p><strong>Password Usata:</strong> ${gamePassword}</p>
                    </div>
                `;
            };
        } else {
            // Scegliamo il video di sconfitta corretto
            const defeatVideo = message.includes("Tempo") ? "Tempo" : "Tentativi";
            playVideo(defeatVideo);
            // Alla fine del video di sconfitta, mostriamo il messaggio
            mainVideo.onended = () => {
                videoContainer.style.display = 'none';
                questionContainer.style.display = 'block';
                questionContainer.innerHTML = `<h1 class="defeat">SCONFITTA!</h1><p>${message}</p>`;
            };
        }
    }

});
