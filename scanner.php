<?php
$serverID = "LKWorldServer-RE-IT-6";
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

$centerX = 500;
$centerY = 500;
$raggioMax = 250; 
$contatoreVuoti = 0;
$limiteVuoti = 10; // Alzato a 10 per essere più sicuri durante i caricamenti lenti

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
        echo "Raggio $r: TROVATO! (Totale : " . count($tempMap) . ")\n";
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
    // Il flag JSON_UNESCAPED_UNICODE è fondamentale per le emoji
file_put_contents($fileDatabase, json_encode(array_values($tempMap), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "SCANSIONE COMPLETATA. Salva: " . count($mappaPulita) . " castelli.\n";
} else {
    echo "ERRORE: Nessun dato trovato. File non sovrascritto per sicurezza.\n";
}

// --- FUNZIONE DI PROCESSO ---
// --- FUNZIONE DI PROCESSO AGGIORNATA ---
function processTile($x, $y, $serverID, &$tempMap) {
    $url = "http://backend3.lordsandknights.com/maps/{$serverID}/{$x}_{$y}.jtile";
    $content = @file_get_contents($url);
    $found = false;

    if ($content && preg_match('/\((.*)\)/s', $content, $matches)) {
        $json = json_decode($matches[1], true);
        if (isset($json['habitatArray']) && count($json['habitatArray']) > 0) {
            foreach ($json['habitatArray'] as $h) {
                $key = $h['mapx'] . "_" . $h['mapy'];
                
                $tempMap[$key] = [
    'p' => (int)$h['playerid'],
    'a' => (int)$h['allianceid'],
    'n' => isset($h['name']) ? $h['name'] : "",
    'x' => (int)$h['mapx'],
    'y' => (int)$h['mapy'],
    'pt' => (int)$h['points'],
    't' => (int)$h['habitattype'], // Salviamo direttamente il numero
    'd' => time()
                ];
            }
            $found = true;
        }
    }
    return $found;
}
