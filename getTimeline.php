<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// print_r( $_POST);

//if (isset($_POST['submit'])) {

    if (isset($_POST['username'])){
        $username = $_POST['username'];
        $targetDir = "uploads/" . $username . '/saves/';
    } else {
        die("Upload failed with no username");
    }
    
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }
    

    $fileName = $targetDir . $_POST['filename'] . '.timeline';

    $fileData = file_get_contents($fileName);

    //file_put_contents("phpDebug.txt", $fileData);

    echo json_encode(["result" => $fileData]);

    exit;
?>