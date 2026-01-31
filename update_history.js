const fs = require('fs');

const inputFile = process.argv[2]; 
const mondoMatch = inputFile ? inputFile.match(/\d+/) : null;
const mondoNum = mondoMatch ? mondoMatch[0] : 'unknown';
const FILE_DB = `db_${mondoNum}.json`;
const FILE_INATTIVI = `inattivi_${mondoNum}.json`;

try {
    const scanData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    let db = {};
    if (fs.existsSync(FILE_DB)) {
        db = JSON.parse(fs.readFileSync(FILE_DB, 'utf8'));
    }

    const now = new Date();
    const currentStatus = {};

    // 1. Mappiamo i dati attuali usando l'ID giocatore 'p'
    scanData.forEach(h => {
        const pid = h.p; 
        if (!pid || pid === 0) return;
        if (!currentStatus[pid]) currentStatus[pid] = { nome: h.n, castelli: {} };
        
        // Usiamo le coordinate x_y come chiave per identificare il singolo castello
        // Salviamo la firma (nome e punti) di quel castello specifico
        currentStatus[pid].castelli[`${h.x}_${h.y}`] = `${h.n}|${h.pt}`;
    });

    Object.keys(currentStatus).forEach(pid => {
        const player = currentStatus[pid];
        
        if (!db[pid]) {
            db[pid] = {
                nome: player.nome,
                ultima_modifica: now.toISOString(),
                inattivo: false,
                firme_castelli: player.castelli // Salviamo l'elenco delle firme per coordinata
            };
        } else {
            let haCambiatoQualcosa = false;
            
            // CONTROLLO ATTIVITÀ: Verifichiamo solo i castelli che il player possiede ANCORA
            for (const [coord, firmaAttuale] of Object.entries(player.castelli)) {
                const firmaPrecedente = db[pid].firme_castelli[coord];
                
                // Se il castello esisteva già e ha cambiato nome o punti -> ATTIVO
                if (firmaPrecedente && firmaPrecedente !== firmaAttuale) {
                    haCambiatoQualcosa = true;
                    break;
                }
                // Se è un castello NUOVO (conquista fatta dal player) -> ATTIVO
                if (!firmaPrecedente) {
                    haCambiatoQualcosa = true;
                    break;
                }
            }

            if (haCambiatoQualcosa) {
                db[pid].ultima_modifica = now.toISOString();
                db[pid].inattivo = false;
                db[pid].firme_castelli = player.castelli;
                db[pid].nome = player.nome;
            } else {
                // Se non ha fatto conquiste e i suoi castelli rimasti sono identici...
                const orePassate = (now - new Date(db[pid].ultima_modifica)) / (1000 * 60 * 60);
                if (orePassate >= 24) db[pid].inattivo = true;
                
                // AGGIORNAMENTO SILENZIOSO: Aggiorniamo la lista castelli (se ne ha persi alcuni)
                // senza resettare il timer di inattività
                db[pid].firme_castelli = player.castelli;
            }
        }
    });

    // 2. Generazione Lista Inattivi Dinamica
    const listaInattivi = Object.keys(db)
        .filter(pid => db[pid].inattivo === true)
        .map(pid => ({ id: pid, nome: db[pid].nome, dal: db[pid].ultima_modifica }));

    fs.writeFileSync(FILE_DB, JSON.stringify(db, null, 2));
    fs.writeFileSync(FILE_INATTIVI, JSON.stringify(listaInattivi, null, 2));
    
    console.log(`✅ Elaborazione completata. Inattivi: ${listaInattivi.length}`);
} catch (e) {
    console.error("Errore:", e.message);
}
