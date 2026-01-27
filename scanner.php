<?php
$serverID = "LKWorldServer-RE-IT-6";
$fileDatabase = 'mondo327.json';
$database = [];

// Definiamo i confini della scansione (X e Y)
$minX = 500; $maxX = 530;
$minY = 500; $maxY = 530;

echo "Inizio scansione mondo 327...\n";

for ($x = $minX; $x <= $maxX; $x++) {
    for ($y = $minY; $y <= $maxY; $y++) {
        $url = "http://backend3.lordsandknights.com/maps/{$serverID}/{$x}_{$y}.jtile";
        
        // Usiamo un trucco per leggere il file senza caricare troppa memoria
        $content = @file_get_contents($url);

        if ($content && preg_match('/\((.*)\)/s', $content, $matches)) {
            $json = json_decode($matches[1], true);
            if (isset($json['habitatArray'])) {
                foreach ($json['habitatArray'] as $h) {
                    $database[] = [
                        'p' => $h['playerid'], // ID Giocatore
                        'n' => $h['name'],     // Nome Castello
                        'x' => $h['mapx'],     // Coordinata X
                        'y' => $h['mapy']      // Coordinata Y
                    ];
                }
            }
        }
    }
    echo "Riga X: $x completata.\n";
}

// Salva tutto nel file JSON
file_put_contents($fileDatabase, json_encode($database));
echo "\nScansione terminata! Trovati " . count($database) . " castelli.\n";
