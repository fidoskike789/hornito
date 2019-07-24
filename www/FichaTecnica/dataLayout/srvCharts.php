<?php
	include "connection.php";
    include "utilities.php";

    $dbConn =  connect($db);
    $methodName = $_GET["MethodName"];
    $response = $methodName();

    function chartPendientesTecnico(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

			$sql = $dbConn->prepare("SELECT (
											SELECT count(om.idOrdenMantenimiento)
											from ft_ordenmantenimiento om
											join ft_asignacionordenmantenimiento aom
											on om.idOrdenMantenimiento = aom.idOrdenMantenimiento
											where aom.idTecnico = :idU
											and om.idFlujo = 2
											and om.estado = 1
											and aom.estado = 1
										) as asignadas,
										(
											SELECT count(om.idOrdenMantenimiento)
											from ft_ordenmantenimiento om
											join ft_asignacionordenmantenimiento aom
											on om.idOrdenMantenimiento = aom.idOrdenMantenimiento
											where aom.idTecnico = :idU
											and om.idFlujo = 3
											and om.estado = 1
											and aom.estado = 1
										) as procesando,
										(
											SELECT count(om.idOrdenMantenimiento)
											from ft_ordenmantenimiento om
											join ft_asignacionordenmantenimiento aom
											on om.idOrdenMantenimiento = aom.idOrdenMantenimiento
											where aom.idTecnico = :idU
											and om.idFlujo = 4
											and om.estado = 1
											and aom.estado = 1
										) as enobservaciones"
									);

			$sql->bindValue(':idU', $data->{'idU'});
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
	}

	function chartHistorialOrdenesMantenimiento(){
		global $dbConn;

		$sql = $dbConn->prepare("SELECT (
										SELECT count(om.idOrdenMantenimiento)
										from ft_ordenmantenimiento om
										where om.estado = 1
									) as total,
									(
										SELECT count(om.idOrdenMantenimiento)
										from ft_ordenmantenimiento om
										where om.estado = 1
										and om.idFlujo = 1
									) as pendientes,
									(
										SELECT count(om.idOrdenMantenimiento)
										from ft_ordenmantenimiento om
										where om.estado = 1
										and om.idFlujo in (2,3,4)
									) as procesando,
									(
										SELECT count(om.idOrdenMantenimiento)
										from ft_ordenmantenimiento om
										where om.estado = 1
										and om.idFlujo = 6
									) as finalizadas"
								);

		$sql->execute();
        $sql->setFetchMode(PDO::FETCH_ASSOC);
        header("HTTP/1.1 200 OK");
        echo json_encode(utf8ize( $sql->fetchAll()  ));
        exit();
	}
?>