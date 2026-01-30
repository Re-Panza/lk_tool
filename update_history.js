const fs = require('fs');

// Configurazione nomi file (ADATTA QUESTI AI TUOI NOMI FILE)
const FILE_SCAN_ATTUALE = 'data_327.json'; 
const FILE_STORICO = 'db_storico.json';

try {
    if (!fs.existsSync(FILE_SCAN_ATTUALE)) {
        console.log("File scansione non trovato. Salto aggiornamento storico.");
        process.exit(0);
    }

    const scanData = JSON.parse(fs.readFileSync(FILE_SCAN_ATTUALE, 'utf8'));
    let historyDB = fs.existsSync(FILE_STORICO) ? JSON.parse(fs.readFileSync(FILE_STORICO, 'utf8')) : {};

    const oraInCuiGira = new Date().toISOString();
    let modificati = 0;

    // Assumiamo che scanData sia un array di giocatori
    scanData.forEach(player => {
        const id = player.id;
        // Creiamo una "firma" del giocatore: se cambiano punti o numero castelli, è attivo
        const currentData = {
            punti: player.points || 0,
            castelli: player.castles ? player.castles.length : 0
        };

        if (!historyDB[id]) {
            // Primo inserimento assoluto per questo giocatore
            historyDB[id] = {
                nome: player.name,
                ultima_modifica: oraInCuiGira,
                dati: currentData
            };
            modificati++;
        } else {
            // Confronto: i punti o i castelli sono diversi dall'ultima volta?
            const vecchio = historyDB[id].dati;
            const eCambiato = vecchio.punti !== currentData.punti || vecchio.castelli !== currentData.castelli;

            if (eCambiato) {
                // IL GIOCATORE È ATTIVO: aggiorniamo la data e i nuovi dati
                historyDB[id].ultima_modifica = oraInCuiGira;
                historyDB[id].dati = currentData;
                historyDB[id].nome = player.name;
                modificati++;
            }
            // Se NON è cambiato, NON aggiorniamo 'ultima_modifica'. 
            // Il tempo inizierà a scorrere da solo.
        }
    });

    fs.writeFileSync(FILE_STORICO, JSON.stringify(historyDB, null, 2));
    console.log(`Storico aggiornato: ${modificati} giocatori attivi rilevati.`);
} catch (err) {
    console.error("Errore script storico:", err);
}
