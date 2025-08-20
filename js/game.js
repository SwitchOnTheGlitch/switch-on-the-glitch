// Questo evento assicura che il nostro codice venga eseguito solo dopo
// che tutta la pagina HTML è stata caricata e resa pronta dal browser.
document.addEventListener('DOMContentLoaded', () => {

    // 1. SELEZIONIAMO GLI ELEMENTI HTML
    // Prendiamo i riferimenti agli elementi della pagina con cui dobbiamo interagire,
    // usando i loro ID.
    const startButton = document.getElementById('startButton');
    const questionContainer = document.getElementById('question-container');
    const controlsContainer = document.getElementById('controls-container');
    const videoContainer = document.getElementById('video-container');

    // 2. AGGIUNGIAMO UN "ASCOLTATORE" DI EVENTI
    // Diciamo al pulsante "Inizia" di rimanere in ascolto per un click.
    // Quando l'utente clicca, verrà eseguita la funzione "startGame".
    startButton.addEventListener('click', startGame);

    // 3. DEFINIAMO LA FUNZIONE CHE FA PARTIRE IL GIOCO
    function startGame() {
        console.log("Il gioco è iniziato!"); // Un messaggio per noi nella console del browser

        // Nascondiamo il contenitore del video e quello dei controlli iniziali
        videoContainer.style.display = 'none';
        controlsContainer.style.display = 'none';

        // Modifichiamo l'HTML all'interno del "question-container"
        // per mostrare la nuova schermata.
        questionContainer.innerHTML = `
            <div id="timer">Tempo Rimanente: 60</div>
            <div id="password-section">
                <label for="passwordInput">Inserisci la Password:</label>
                <input type="password" id="passwordInput" placeholder="Scrivi qui...">
                <button id="verifyButton">Verifica Password</button>
            </div>
        `;
    }

}); // Fine dell'evento DOMContentLoaded
