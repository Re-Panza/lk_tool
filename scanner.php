<?php
$serverID = "LKWorldServer-RE-IT-6";
$fileDatabase = 'mondo327.json';


// --- 1. CARICAMENTO DATI E "MEMORIA" ---
$tempMap = [];
$puntiCaldi = []; // Qui salviamo i file .jtile che sappiamo essere popolati

if (file_exists($fileDatabase)) {
    $content = file_get_contents($fileDatabase);
    $currentData = json_decode($content, true);
    if (is_array($currentData)) {
        foreach ($currentData as $entry) {
            $key = $entry['x'] . "_" . $entry['y'];
            $tempMap[$key] = $entry;
            
            // Calcoliamo la coordinata del file jtile (che nel tuo mondo è x/y diviso 32 o simile)
            // Ma dato che usiamo direttamente le coordinate jtile dal log, salviamo quelle.
            // Se nel log vedi 503_503.jtile, salviamo 503 e 503.
            $jtileX = floor($entry['x'] / 32); // Calcolo standard per trasformare coord gioco in jtile
            $jtileY = floor($entry['y'] / 32);
            $puntiCaldi[$jtileX . "_" . $jtileY] = ['x' => $jtileX, 'y' => $jtileY];
        }
    }
}

echo "Dati caricati. Analisi di " . count($puntiCaldi) . " quadranti conosciuti...\n";

// --- 2. FASE 1: CONTROLLO IMMEDIATO ZONE POPOLATE ---
foreach ($puntiCaldi as $zona) {
    processTile($zona['x'], $zona['y'], $serverID, $tempMap, $backendURL);
}

// --- 3. FASE 2: ESPANSIONE (CERCA NUOVI GIOCATORI) ---
// Troviamo il centro attuale dei giocatori per non ripartire da 500|500 se non serve
$centerX = 503; $centerY = 503;
if (count($tempMap) > 0) {
    $sumX = 0; $sumY = 0;
    foreach ($tempMap as $h) { $sumX += floor($h['x']/32); $sumY += floor($h['y']/32); }
    $centerX = round($sumX / count($tempMap));
    $centerY = round($sumY / count($tempMap));
}

$raggioMax = 150; 
$limiteVuoti = 10; 
$contatoreVuoti = 0;

echo "Inizio espansione dal centro: $centerX | $centerY\n";

for ($r = 0; $r <= $raggioMax; $r++) {
    $trovatoNuovo = false;
    $xMin = $centerX - $r; $xMax = $centerX + $r;
    $yMin = $centerY - $r; $yMax = $centerY + $r;

    // Scansione perimetrale
    $puntiDaControllare = [];
    for ($i = $xMin; $i <= $xMax; $i++) { $puntiDaControllare[] = [$i, $yMin]; $puntiDaControllare[] = [$i, $yMax]; }
    for ($j = $yMin + 1; $j < $yMax; $j++) { $puntiDaControllare[] = [$xMin, $j]; $puntiDaControllare[] = [$xMax, $j]; }

    foreach ($puntiDaControllare as $p) {
        // Se abbiamo già scansionato questa zona nella Fase 1, saltiamo per risparmiare tempo
        if (isset($puntiCaldi[$p[0] . "_" . $p[1]])) continue;
        
        if (processTile($p[0], $p[1], $serverID, $tempMap, $backendURL)) {
            $trovatoNuovo = true;
        }
    }

    if ($trovatoNuovo) {
        $contatoreVuoti = 0;
        echo "Raggio $r: Nuovi habitat trovati!\n";
    } else {
        $contatoreVuoti++;
        if ($r % 5 == 0) echo "Raggio $r: nessun nuovo insediamento ($contatoreVuoti/$limiteVuoti)\n";
    }

    if ($contatoreVuoti >= $limiteVuoti) {
        echo "Espansione terminata: confine mappa raggiunto.\n";
        break;
    }
}

// --- 4. PULIZIA (72h) E SALVATAGGIO ---
$limiteTempo = time() - (72 * 3600);
$mappaPulita = array_filter($tempMap, function($entry) use ($limiteTempo) {
    return !isset($entry['d']) || $entry['d'] > $limiteTempo;
});

file_put_contents($fileDatabase, json_encode(array_values($mappaPulita), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Fine. Database aggiornato con " . count($mappaPulita) . " habitat.\n";

// --- FUNZIONE CORE ---
function processTile($x, $y, $serverID, &$tempMap, $backend) {
    $url = "{$backend}/maps/{$serverID}/{$x}_{$y}.jtile";
    $content = @file_get_contents($url);
    
    // 1. SCORCIATOIA: Se il file è vuoto o è la risposta standard vuota, esci subito
    if (!$content || $content === 'callback_politicalmap({})') {
        return false; 
    }

    // 2. Se c'è contenuto, lo elaboriamo con la Regex
    if (preg_match('/\((.*)\)/s', $content, $matches)) {
        $json = json_decode($matches[1], true);
        
        if (isset($json['habitatArray']) && count($json['habitatArray']) > 0) {
            foreach ($json['habitatArray'] as $h) {
                $key = $h['mapx'] . "_" . $h['mapy'];
                $tempMap[$key] = [
                    'p'  => (int)$h['playerid'],
                    'a'  => (int)$h['allianceid'],
                    'n'  => $h['name'] ?? "",
                    'x'  => (int)$h['mapx'],
                    'y'  => (int)$h['mapy'],
                    'pt' => (int)$h['points'],
                    't'  => (int)$h['habitattype'],
                    'd'  => time()
                ];
            }
            return true;
        }
    }
    return false;
}
