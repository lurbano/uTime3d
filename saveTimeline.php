<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

print_r( $_POST);

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
    
    
    // Get file extension for validation (optional but recommended)
    $fileType = strtolower(pathinfo($targetDir, PATHINFO_EXTENSION));

    $fileName = $targetDir . $_POST['filename'] . '.timeline';

    file_put_contents($fileName, $_POST['data']);
?>