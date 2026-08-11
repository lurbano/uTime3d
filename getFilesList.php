<?php
    if (isset($_POST['username'])){
        $username = $_POST['username'];
        $targetDir = "uploads/" . $username . '/';
    } else {
        die("Upload failed with no username");
    }

    // $files = glob($targetDir . '*.*');

    // foreach (glob($targetDir) as $filename) {
    //     if (is_file($filename)) {
    //         echo basename($filename) . PHP_EOL;
    //     }
    // }

    $dir = "/path/to/directory/*";
    // Returns array of filenames without the directory path
    $files = array_map('basename', glob($targetDir . "*"));

    $data = ["files" => $files];

    echo json_encode($data);
    exit();


?>