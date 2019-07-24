<?php
	//include "connection.php";
    //include "utilities.php";

    //$dbConn =  connect($db);

    function insertarBitacora($bitacora){
    	try {
    		global $dbConn;

	    	$fechaActual = date("Y-m-d H:i:s");

			$consulta = "INSERT into ft_bitacoraordenmantenimiento (idOrdenMantenimiento, idFlujo, accion, fechaRegistro, usuario, estado)
						 values (:idOM, :fl, :a, :fr, :u, 1)";

			$sql = $dbConn->prepare($consulta);

			$sql->bindValue(':idOM', $bitacora['idOrdenMantenimiento']);
			$sql->bindValue(':fl', $bitacora['idFlujo']);
			$sql->bindValue(':a', utf8_decode($bitacora['accion']));
			$sql->bindValue(':u', $bitacora['usuario']);
			$sql->bindValue(':fr', $fechaActual);
			$sql->execute();
			
    	} catch (Exception $e) {
    		
    	}
    }
?>