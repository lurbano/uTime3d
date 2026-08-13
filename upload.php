<?php

// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// print("Hello");
// flush();

// var_dump($_POST);

// print_r($_POST);



//if (isset($_POST['submit'])) {

    if (isset($_POST['username'])){
        $username = $_POST['username'];
        $targetDir = "uploads/" . $username . '/';
    } else {
        die("Upload failed with no username");
    }
    
    // Extract base filename and complete target path
    $fileName = basename($_FILES["uploaded_file"]["name"]);
    $targetFilePath = $targetDir ; //. $fileName;
    if (!is_dir($targetFilePath)) {
        mkdir($targetFilePath, 0755, true);
    }
    //print("Target file path: ". $targetFilePath);
    
    // Get file extension for validation (optional but recommended)
    $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

    // Check if there was an upload error
    if ($_FILES["uploaded_file"]["error"] !== UPLOAD_ERR_OK) {
        die("Upload failed with error code " . $_FILES["myFile"]["error"]);
    }

    // Move the file from temporary storage to the target folder
    if (move_uploaded_file($_FILES['uploaded_file']['tmp_name'], $targetFilePath . $fileName)) {
        echo "The file " . htmlspecialchars($fileName) . " has been successfully uploaded.";
    } else {
        echo "Sorry, there was an error uploading your file.";
    }
// } else {
//     echo "Invalid request method.";
// }
?>