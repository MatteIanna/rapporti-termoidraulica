document.addEventListener('DOMContentLoaded', () => {
    const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwrZwQf90neLrxEbbxio4ANtZhwHDbbCBoHfJbFFaJcTTKWANA09RTdTJpCnra942Ac/exec"; 
    
    const form = document.getElementById('formIntervento');
    const btnInvia = document.getElementById('btnInvia');
    const messaggioStato = document.getElementById('messaggioStato');
    
    // Configurazione Area Firma Canvas
    const canvas = document.getElementById('canvasFirma');
    const btnCancellaFirma = document.getElementById('btnCancellaFirma');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let haFirmato = false; // Flag per verificare se il riquadro è vuoto

    // Regola la risoluzione interna del canvas in base alle dimensioni dello schermo
    function adattaCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = 150;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        haFirmato = false;
    }
    adattaCanvas();
    window.addEventListener('resize', adattaCanvas);

    // Funzioni per catturare le coordinate corrette (Mouse e Touch)
    function ottieniPosizione(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function iniziaDisegno(e) {
        drawing = true;
        const pos = ottieniPosizione(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    function disegna(e) {
        if (!drawing) return;
        haFirmato = true;
        const pos = ottieniPosizione(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    function fermaDisegno() {
        drawing = false;
    }

    // Eventi Mouse
    canvas.addEventListener('mousedown', iniziaDisegno);
    canvas.addEventListener('mousemove', disegna);
    canvas.addEventListener('mouseup', fermaDisegno);
    canvas.addEventListener('mouseleave', fermaDisegno);

    // Eventi Touch per Smartphone (impediscono lo scroll della pagina mentre si firma)
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); iniziaDisegno(e); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); disegna(e); }, { passive: false });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); fermaDisegno(); }, { passive: false });

    // Bottone cancella firma
    btnCancellaFirma.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        haFirmato = false;
    });

    // Invio Modulo
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        btnInvia.disabled = true;
        btnInvia.innerText = "Generazione PDF e Invio...";
        messaggioStato.className = "hidden";

        // Converte il canvas in stringa d'immagine Base64 solo se l'utente ha tracciato qualcosa
        const stringaFirma = haFirmato ? canvas.toDataURL('image/png') : "";

        const datiForm = {
            firmaTecnico: document.getElementById('firmaTecnico').value,
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            indirizzo: document.getElementById('indirizzo').value,
            tipoGuasto: document.getElementById('tipoGuasto').value,
            lavoriEseguiti: document.getElementById('lavoriEseguiti').value,
            materiali: document.getElementById('materiali').value,
            oreLavoro: document.getElementById('oreLavoro').value,
            note: document.getElementById('note').value,
            firmaCliente: stringaFirma
        };

        fetch(URL_SCRIPT, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(datiForm)
        })
        .then(() => {
            messaggioStato.innerText = "Rapporto salvato con successo! Archivio PDF generato.";
            messaggioStato.className = "success";
            form.reset();
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Svuota il canvas
            haFirmato = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(error => {
            messaggioStato.innerText = "Errore di connessione. Controlla il segnale e riprova.";
            messaggioStato.className = "error";
            console.error('Errore:', error);
        })
        .finally(() => {
            btnInvia.disabled = false;
            btnInvia.innerText = "Salva e Invia PDF";
        });
    });
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('PWA attiva correttamente!'))
        .catch(err => console.error('Errore PWA:', err));
}
