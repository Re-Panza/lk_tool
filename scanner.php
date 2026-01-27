<?php
$serverID = "world-it-re-6";
$fileDatabase = 'mondo327.json';

// --- 1. CARICAMENTO DATI ESISTENTI ---
$tempMap = [];
if (file_exists($fileDatabase)) {
    $content = file_get_contents($fileDatabase);
    $currentData = json_decode($content, true);
    if (is_array($currentData)) {
        foreach ($currentData as $entry) {
            // Usiamo le coordinate come chiave per evitare duplicati
            $key = $entry['x'] . "_" . $entry['y'];
            $tempMap[$key] = $entry;
        }
    }
}

$centerX = 16380;
$centerY = 16375;
$raggioMax = 250; 
$contatoreVuoti = 0;
$limiteVuoti = 10; // Alzato a 10 per essere più sicuri durante i caricamenti lenti
echo "--- TEST DI CONNESSIONE ---\n";
$puntiTest = [
    [16383, 16375], // La tua Piazzaforte
    [16250, 16250], // Dove avevi trovato dati prima
    [16500, 16500], // Altra zona
    [500, 500]      // Centro vecchio
];

foreach ($puntiTest as $pt) {
    echo "Provando zona {$pt[0]},{$pt[1]}... ";
    // Usiamo una variabile temporanea per non sporcare la mappa principale durante il test
    $testMap = [];
    if (processTile($pt[0], $pt[1], $serverID, $testMap)) {
        echo " [OK] TROVATI CASTELLI QUI!\n";
    } else {
        echo " [VUOTO]\n";
    }
}
echo "---------------------------\n\n";
// --- FINE TEST ---
echo "Inizio scansione... (Dati in memoria: " . count($tempMap) . ")\n";

for ($r = 0; $r <= $raggioMax; $r++) {
    $trovatoInQuestoGiro = false;
    
    $xMin = $centerX - $r;
    $xMax = $centerX + $r;
    $yMin = $centerY - $r;
    $yMax = $centerY + $r;

    // Ciclo X
    for ($i = $xMin; $i <= $xMax; $i++) {
        foreach ([$yMin, $yMax] as $j) {
            if (processTile($i, $j, $serverID, $tempMap)) $trovatoInQuestoGiro = true;
        }
    }
    // Ciclo Y
    for ($j = $yMin + 1; $j < $yMax; $j++) {
        foreach ([$xMin, $xMax] as $i) {
            if (processTile($i, $j, $serverID, $tempMap)) $trovatoInQuestoGiro = true;
        }
    }

    if ($trovatoInQuestoGiro) {
        echo "Raggio $r: TROVATO! (Totale database: " . count($tempMap) . ")\n";
        $contatoreVuoti = 0;
    } else {
        $contatoreVuoti++;
        echo "Raggio $r: vuoto ($contatoreVuoti/$limiteVuoti)\n";
    }

    if ($contatoreVuoti >= $limiteVuoti) {
        echo "Fine mappa raggiunta.\n";
        break;
    }
}

// --- 2. PULIZIA DATI VECCHI (72 ORE) ---
$limiteTempo = time() - (72 * 3600);
$mappaPulita = [];
foreach ($tempMap as $entry) {
    // Teniamo il dato se è stato visto nelle ultime 72 ore o se non ha ancora il timestamp
    if (!isset($entry['d']) || $entry['d'] > $limiteTempo) {
        $mappaPulita[] = $entry;
    }
}

// --- 3. SALVATAGGIO SICURO ---
if (count($mappaPulita) > 0) {
    file_put_contents($fileDatabase, json_encode($mappaPulita));
    echo "SCANSIONE COMPLETATA. Salva: " . count($mappaPulita) . " castelli.\n";
} else {
    echo "ERRORE: Nessun dato trovato. File non sovrascritto per sicurezza.\n";
}

// --- FUNZIONE DI PROCESSO ---
function processTile($x, $y, $serverID, &$tempMap) {
    $url = "http://backend3.lordsandknights.com/maps/{$serverID}/{$x}_{$y}.jtile";
    
    // Test di connessione grezzo
    $headers = @get_headers($url);
    if($headers && strpos($headers[0], '200') === false) {
        echo " Errore Server: " . $headers[0] . " su coordinata $x,$y \n";
        return false;
    }

    $content = @file_get_contents($url);
    if (!$content) return false;

    $found = false;
    if (preg_match('/\((.*)\)/s', $content, $matches)) {
        $json = json_decode($matches[1], true);
        if (isset($json['habitatArray']) && count($json['habitatArray']) > 0) {
            foreach ($json['habitatArray'] as $h) {
                $key = $h['mapx'] . "_" . $h['mapy'];
                $tempMap[$key] = [
                    'p' => (int)$h['playerid'],
                    'n' => $h['name'],
                    'x' => (int)$h['mapx'],
                    'y' => (int)$h['mapy'],
                    'd' => time()
                ];
            }
            $found = true;
        }
    }
    return $found;
}
