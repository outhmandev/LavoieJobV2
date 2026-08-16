<?php

$cpanel_host = 'cpanel.lavoiejob.ma';
$cpanel_user = 'lavoiejo';
$cpanel_token = 'NDWOUBBAT8X572ME3WO200WPQOFWY4UK';

$query = 'https://' . $cpanel_host . ':2083/execute/Fileman/list_files?dir=/home/lavoiejo';

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $query);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array(
    'Authorization: cpanel ' . $cpanel_user . ':' . $cpanel_token
));

$result = curl_exec($curl);
if ($result == false) {
    echo "Curl error: " . curl_error($curl);
} else {
    $decoded = json_decode($result, true);
    if(isset($decoded['data'])) {
        foreach($decoded['data'] as $item) {
            if($item['type'] === 'dir') {
                echo "DIR: " . $item['path'] . "\n";
            }
        }
    } else {
        echo "Response: " . $result;
    }
}
curl_close($curl);
