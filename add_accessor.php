<?php
 = file_get_contents('c:/Users/MH/Desktop/Lavoiejob/LavoieJobV2/app/Models/Client.php');
if (strpos(, 'getDomicareDataAttribute') === false) {
     = "
    public function getDomicareDataAttribute() {
        \ = json_decode(\->attributes['criteres'] ?? '{}', true);
        return \['domicare_data'] ?? null;
    }
";
     = str_replace("public function getAttendingPhysicianAttribute() {",  . "    public function getAttendingPhysicianAttribute() {", );
    file_put_contents('c:/Users/MH/Desktop/Lavoiejob/LavoieJobV2/app/Models/Client.php', );
    echo "Added accessor";
}
