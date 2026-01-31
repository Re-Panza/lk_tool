const fs = require('fs');

const inputFile = process.argv[2]; 
if (!inputFile) {
    console.error("ERRORE: Specifica il file di input (es: mondo327.json)");
    process.exit(1);
}

const mondoMatch = inputFile.match(/\d+/);
const mondoNum = mondoMatch ? mondoMatch[0] : 'unknown';
const FILE_DB = `db_${mondoNum}.json`;
const FILE_INATTIVI = `inattivi_${mondoNum}.json`;

try {
    if (!fs.existsSync(inputFile)) {
        console.error(`ERRORE: Il file ${inputFile} non esiste.`);
        process.exit(1);
    }
    const scanData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    let db = {};
    if (fs.existsSync(FILE_DB)) {
        try {
            db = JSON.parse(fs.readFileSync(FILE_DB, 'utf8'));
        } catch(e) { db = {}; }
    }

    const now = new Date();
    const currentStatus = {};

    // 1. Raggruppa i dati per ID Giocatore (campo 'p')
    scanData.forEach(h => {
        const pid = h.p; 
        if (!pid || pid === 0) return;

        if (!currentStatus[pid]) {
            currentStatus[pid] = { id: pid, nome: h.n, castelli: [] };
        }
        // Firma basata su Nome (n) e Punti (pt) del castello
        currentStatus[pid].castelli.push(`${h.n}|${h.pt}`);
    });

    // 2. Confronto Reattivo
    Object.keys(currentStatus).forEach(pid => {
        const player = currentStatus[pid];
        const stateString = player.castelli.sort().join(';');

        if (!db[pid]) {
            db[pid] = {
                nome: player.nome,
                ultima_modifica: now.toISOString(),
                inattivo: false,
                stato_precedente: stateString
            };
        } else {
            const lastMod = new Date(db[pid].ultima_modifica);
            const orePassate = (now - lastMod) / (1000 * 60 * 60);

            if (db[pid].stato_precedente !== stateString) {
                // Se c'è una variazione, torna attivo e resetta il timer
                db[pid].ultima_modifica = now.toISOString();
                db[pid].stato_precedente = stateString;
                db[pid].inattivo = false;
                db[pid].nome = player.nome;
            } else if (orePassate >= 24) {
                // Se identico da 24 ore, diventa inattivo
                db[pid].inattivo = true;
            }
        }
    });

    // 3. Generazione Lista Inattivi Dinamica
    const listaInattivi = Object.keys(db)
        .filter(pid => db[pid].inattivo === true)
        .map(pid => ({
            id: pid,
            nome: db[pid].nome,
            ultimo_cambio: db[pid].ultima_modifica
        }));

    fs.writeFileSync(FILE_DB, JSON.stringify(db, null, 2));
    fs.writeFileSync(FILE_INATTIVI, JSON.stringify(listaInattivi, null, 2));
    
    console.log(`✅ Storico e Lista Inattivi (${listaInattivi.length}) aggiornati.`);

} catch (e) {
    console.error("❌ Errore:", e.message);
}
