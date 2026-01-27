<?php
$serverID = "LKWorldServer-RE-IT-6";
$fileDatabase = 'mondo327.json';

// --- MODIFICA 1: CARICAMENTO DATI ESISTENTI ---
if (file_exists($fileDatabase)) {
    $currentData = json_decode(file_get_contents($fileDatabase), true);
} else {
    $currentData = [];
}

// Creiamo una mappa temporanea usando le coordinate come chiave per evitare duplicati
$tempMap = [];
foreach ($currentData as $entry) {
    $key = $entry['x'] . "_" . $entry['y'];
    $tempMap[$key] = $entry;
}
// ----------------------------------------------

$centerX = 500;
$centerY = 500;
$raggioMax = 250; 
$contatoreVuoti = 0;
$limiteVuoti = 5; 

echo "Inizio scansione incrementale (Dati pre-esistenti: " . count($tempMap) . ")...\n";

for ($r = 0; $r <= $raggioMax; $r++) {
    $trovatoInQuestoGiro = false;
    
    $xMin = $centerX - $r;
    $xMax = $centerX + $r;
    $yMin = $centerY - $r;
    $yMax = $centerY + $r;

    for ($i = $xMin; $i <= $xMax; $i++) {
        foreach ([$yMin, $yMax] as $j) {
            if (processTile($i, $j, $serverID, $tempMap)) $trovatoInQuestoGiro = true;
        }
    }
    for ($j = $yMin + 1; $j < $yMax; $j++) {
        foreach ([$xMin, $xMax] as $i) {
            if (processTile($i, $j, $serverID, $tempMap)) $trovatoInQuestoGiro = true;
        }
    }

    if ($trovatoInQuestoGiro) {
        echo "Raggio $r: Trovati castelli. (Database totale: " . count($tempMap) . ")\n";
        $contatoreVuoti = 0;
    } else {
        $contatoreVuoti++;
        echo "Raggio $r: Vuoto ($contatoreVuoti/$limiteVuoti)\n";
    }

    if ($contatoreVuoti >= $limiteVuoti) {
        echo "Raggiunto limite di giri vuoti. Fine scansione.\n";
        break;
    }
}

// --- MODIFICA 2: AGGIORNATA FUNZIONE PROCESS ---
function processTile($x, $y, $serverID, &$tempMap) {
    $url = "http://backend3.lordsandknights.com/maps/{$serverID}/{$x}_{$y}.jtile";
    $content = @file_get_contents($url);
    $found = false;

    if ($content && preg_match('/\((.*)\)/s', $content, $matches)) {
        $json = json_decode($matches[1], true);
        if (isset($json['habitatArray']) && count($json['habitatArray']) > 0) {
            foreach ($json['habitatArray'] as $h) {
                $key = $h['mapx'] . "_" . $h['mapy'];
                // Aggiorna o aggiunge il castello
               $tempMap[$key] = [
    'p' => $h['playerid'],
    'n' => $h['name'],
    'x' => $h['mapx'],
    'y' => $h['mapy'],
    't' => $h['type'],
    'd' => time() // Registra il momento esatto in cui lo scanner lo vede
];
            }
            $found = true;
        }
    }
    return $found;
}

// --- MODIFICA 3: SALVATAGGIO FINALE ---
$finalDatabase = array_values($tempMap); // Trasforma la mappa in lista semplice
// --- PULIZIA AUTOMATICA (72 ore) ---
$limiteTempo = time() - (72 * 3600); // 72 ore fa
$mappaPulita = [];

foreach ($tempMap as $key => $entry) {
    // Se il castello ha una data ed è più recente di 72 ore, lo teniamo.
    // Se non ha data (dati vecchi), al primo giro lo teniamo ma gli diamo tempo.
    if (!isset($entry['d']) || $entry['d'] > $limiteTempo) {
        $mappaPulita[] = $entry;
    }
}

$finalDatabase = $mappaPulita;
// ----------------------------------
echo "Database salvato correttamente. Totale: " . count($finalDatabase) . " castelli.\n";
