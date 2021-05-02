<?php

require __DIR__ . '/../vendor/autoload.php';

error_reporting(E_ERROR | E_PARSE);

$client = new Google_Client();
$client->setScopes([Google_Service_Sheets::SPREADSHEETS_READONLY]);
$client->setAuthConfig(__DIR__ . '/../credentials.json');
$service = new Google_Service_Sheets($client);

try {
    $response = $service->spreadsheets_values->get($_GET['sheet'], $_GET['range']);
    echo json_encode($response->getValues());
} catch (Exception $e) {
    echo $e->getMessage();
}
