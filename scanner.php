<?php
$serverID = "LKWorldServer-RE-IT-6";
$fileDatabase = 'mondo327.json';
$database = [];

$centerX = 500;
$centerY = 500;
$raggioMax = 250; 
$contatoreVuoti = 0;
$limiteVuoti = 5; // Si ferma dopo 5 giri consecutivi senza castelli

echo "Inizio scansione intelligente (Tolleranza: $limiteVuoti giri vuoti)...\n";

for ($r = 0; $r <= $raggioMax; $r++) {
    $trovatoInQuestoGiro = false;
    
    $xMin = $centerX - $r;
    $xMax = $centerX + $r;
    $yMin = $centerY - $r;
    $yMax = $centerY + $r;

    // Scansione dei bordi del quadrato
    for ($i = $xMin; $i <= $xMax; $i++) {
        foreach ([$yMin, $yMax] as $j) {
            if (processTile($i, $j, $serverID, $database)) $trovatoInQuestoGiro = true;
        }
    }
    for ($j = $yMin + 1; $j < $yMax; $j++) {
        foreach ([$xMin, $xMax] as $i) {
            if (processTile($i, $j, $serverID, $database)) $trovatoInQuestoGiro = true;
        }
    }

    if ($trovatoInQuestoGiro) {
        echo "Raggio $r: Trovati castelli. (Totale: " . count($database) . ")\n";
        $contatoreVuoti = 0; // Reset del contatore se troviamo qualcosa
    } else {
        $contatoreVuoti++;
        echo "Raggio $r: Vuoto ($contatoreVuoti/$limiteVuoti)\n";
    }

    if ($contatoreVuoti >= $limiteVuoti) {
        echo "Raggiunto limite di giri vuoti. Fine scansione per confine mappa.\n";
        break;
    }
}

function processTile($x, $y, $serverID, &$database) {
    $url = "http://backend3.lordsandknights.com/maps/{$serverID}/{$x}_{$y}.jtile";
    $content = @file_get_contents($url);
    $found = false;

    if ($content && preg_match('/\((.*)\)/s', $content, $matches)) {
        $json = json_decode($matches[1], true);
        if (isset($json['habitatArray']) && count($json['habitatArray']) > 0) {
            foreach ($json['habitatArray'] as $h) {
                $database[] = [
                    'p' => $h['playerid'],
                    'n' => $h['name'],
                    'x' => $h['mapx'],
                    'y' => $h['mapy']
                ];
            }
            $found = true;
        }
    }
    return $found;
}

file_put_contents($fileDatabase, json_encode($database));
echo "Database salvato correttamente.\n";
