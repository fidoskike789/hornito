<?php
	include "connection.php";
    include "utilities.php";

    $dbConn =  connect($db);
    $methodName = $_GET["MethodName"];
    $response = $methodName();
	
	function buscarConsecutivo(){
		global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$consulta = "SELECT IFNULL(max(numerico),0) as consecutivo
						FROM ft_codigosbarras
						WHERE idTecnico=:t";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':t', $data->{'t'});
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
	}

	function asignarCodigos(){
		global $dbConn;

		$fechaActual = date("Y-m-d H:i:s");

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

			foreach($data->data as $codigo)
		    {		    
				$consulta = "INSERT into ft_codigosbarras (idTecnico, numerico, codigo, fechaRegistro, usuarioGeneracion, estado)
							values (:t, :n, :c, :fr, :u, 1)";

				$sql = $dbConn->prepare($consulta);
				$sql->bindValue(':t', $codigo->{'t'});
				$sql->bindValue(':n', $codigo->{'n'});
				$sql->bindValue(':c', $codigo->{'c'});
				$sql->bindValue(':u', $codigo->{'u'});
				$sql->bindValue(':fr', $fechaActual);

				$sql->execute();
			}
          	header("HTTP/1.1 200 OK");
          	exit();
		}
	}

	function listarCodigosTecnico(){
		global $dbConn;

		$sql = $dbConn->prepare("SELECT codigo from ft_codigosbarras
		 						 where estado=1
		 						 order by idCodigoBarras asc");
		
		$sql->execute();
		$sql->setFetchMode(PDO::FETCH_ASSOC);
        header("HTTP/1.1 200 OK");
        echo json_encode(utf8ize( $sql->fetchAll()  ));
        exit();
	}
?>