<?php
	//Allow Headers
	header('Access-Control-Allow-Origin: *');
	//print_r(json_encode($_FILES));
	$new_image_name = urldecode($_FILES["file"]["name"]);
	//Move your files into upload folder
	move_uploaded_file($_FILES["file"]["tmp_name"], "fotos/".$new_image_name);
?>