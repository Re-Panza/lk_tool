const fs = require('fs');

// Legge il file passato come argomento (es: node update_history.js data_327.json)
const inputFile = process.argv[2]; 

if (!inputFile) {
    console.error("ERRORE: Devi specificare il file di input (es. data_327.json)");
    process.exit(1);
}

// Estrae il numero del mondo (es. 327) dal nome del file per creare il DB corretto
const mondoMatch = inputFile.match(/\d+/);
if (!mondoMatch) {
    console.error("ERRORE: Il nome del file deve contenere il numero del mondo.");
    process.exit(1);
}
const mondoNum = mondoMatch[0];
const FILE_DB = `db_${mondoNum}.json`;

try {
    // 1. Carica i dati appena scansionati
    if (!fs.existsSync(inputFile)) {
        console.error(`ERRORE: Il file ${inputFile} non esiste.`);
        process.exit(1);
    }
    const scanData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    // 2. Carica il database storico esistente (o ne crea uno vuoto)
    let db = {};
    if (fs.existsSync(FILE_DB)) {
        db = JSON.parse(fs.readFileSync(FILE_DB, 'utf8'));
    }

    const now = new Date().toISOString();
    let counter = 0;

    // 3. Confronta i dati
    scanData.forEach(p => {
        const id = p.id;
        const current = { 
            pts: p.points || 0, 
            cst: p.castles ? p.castles.length : 0 
        };

        if (!db[id]) {
            // Nuovo giocatore mai visto
            db[id] = { 
                nome: p.name, 
                ultima_modifica: now, 
                dati: current 
            };
            counter++;
        } else if (db[id].dati.pts !== current.pts || db[id].dati.cst !== current.cst) {
            // Giocatore esistente che ha cambiato punteggio o castelli
            db[id].ultima_modifica = now;
            db[id].dati = current;
            db[id].nome = p.name;
            counter++;
        }
    });

    // 4. Salva il database aggiornato
    fs.writeFileSync(FILE_DB, JSON.stringify(db, null, 2));
    
    console.log(`✅ Storico aggiornato con successo!`);
    console.log(`📁 File: ${FILE_DB}`);
    console.log(`📊 Modifiche rilevate: ${counter}`);

} catch (e) {
    console.error("❌ Errore durante l'aggiornamento dello storico:");
    console.error(e.message);
    process.exit(1);
}
