document.addEventListener('DOMContentLoaded', () => {
    // URL ufficiale di Google Apps Script integrato
    const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwrZwQf90neLrxEbbxio4ANtZhwHDbbCBoHfJbFFaJcTTKWANA09RTdTJpCnra942Ac/exec"; 
    
    const form = document.getElementById('formIntervento');
    const btnInvia = document.getElementById('btnInvia');
    const messaggioStato = document.getElementById('messaggioStato');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Disabilita il tasto per evitare doppi invii
        btnInvia.disabled = true;
        btnInvia.innerText = "Generazione PDF e Invio...";
        messaggioStato.className = "hidden";

        // Raccoglie tutti i dati dal form
        const datiForm = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            indirizzo: document.getElementById('indirizzo').value,
            tipoGuasto: document.getElementById('tipoGuasto').value,
            lavoriEseguiti: document.getElementById('lavoriEseguiti').value,
            materiali: document.getElementById('materiali').value,
            oreLavoro: document.getElementById('oreLavoro').value,
            note: document.getElementById('note').value
        };

        // Invia i dati a Google
        fetch(URL_SCRIPT, {
            method: 'POST',
            mode: 'no-cors', // Fondamentale per comunicare con Google Apps Script
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(datiForm)
        })
        .then(() => {
            messaggioStato.innerText = "Rapporto salvato! PDF registrato e inviato.";
            messaggioStato.className = "success";
            form.reset();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(error => {
            messaggioStato.innerText = "Errore di connessione. Riprova.";
            messaggioStato.className = "error";
            console.error('Errore:', error);
        })
        .finally(() => {
            // Riattiva il tasto a fine operazione
            btnInvia.disabled = false;
            btnInvia.innerText = "Salva e Invia PDF";
        });
    });
});

// Registrazione del Service Worker per il funzionamento offline e l'installazione PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('PWA configurata correttamente!'))
        .catch(err => console.error('Errore registrazione PWA:', err));
}
