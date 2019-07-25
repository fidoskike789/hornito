<?php
	include "connection.php";
    include "utilities.php";
    include "srvBitacoraOM.php";

    $dbConn =  connect($db);
    $methodName = $_GET["MethodName"];
    $response = $methodName();

    function listarOrdenesMantenimiento(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

			$consulta = "SELECT om.idOrdenMantenimiento, om.idFlujo, om.cliente, om.telefono,
								om.direccion, om.fechaEmision, om.seccion, om.fechaHoraMantenimiento,
								om.producto, om.fechaVenta, om.tecnicoUltimoMantenimiento,
								om.tecnicoQuienReporta, om.descripcionMantenimiento, om.observaciones,
								om.fechaRegistro, om.usuarioRegistro, om.estado,
								(
									select c.detalle
									from ft_vCatalogos c
									where c.catalogo = 'catFlujos' and c.codigo = om.idflujo
									limit 1
								) as estadoDetalle,
								aom.idTecnico
						from ft_ordenmantenimiento om
						left join ft_asignacionordenmantenimiento aom
						on om.idOrdenMantenimiento = aom.idOrdenMantenimiento
						where om.estado = 1 and (aom.estado = 1 or aom.estado is null) and om.idFlujo in (".$data->{'fl'}.") order by om.idFlujo asc, om.idOrdenMantenimiento desc";

			$sql = $dbConn->prepare($consulta);
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
    }

    function listarOrdenesMantenimientoTecnico(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

			$consulta = "SELECT om.idOrdenMantenimiento, om.idFlujo, om.cliente, om.telefono,
								om.direccion, om.fechaEmision, om.seccion, om.fechaHoraMantenimiento,
								om.producto, om.fechaVenta, om.tecnicoUltimoMantenimiento,
								om.tecnicoQuienReporta, om.descripcionMantenimiento, om.observaciones,
								om.fechaRegistro, om.usuarioRegistro, om.estado,
								(
									select c.detalle
									from ft_vCatalogos c
									where c.catalogo = 'catFlujos' and c.codigo = om.idflujo
									limit 1
								) as estadoDetalle
						from ft_ordenmantenimiento om
						inner join ft_asignacionordenmantenimiento aom
						on om.idOrdenMantenimiento = aom.idOrdenMantenimiento
						where om.estado = 1 and aom.estado = 1
						and aom.idTecnico = :u 
						and om.idFlujo in (".$data->{'fl'}.") order by om.idFlujo desc, aom.idAsignacionOrden asc";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':u', $data->{'u'});
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
    }

    function insertarOrdenMantenimiento(){
    	global $dbConn;

    	$fechaActual = date("Y-m-d H:i:s");

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			
			$sql = $dbConn->prepare("INSERT into ft_ordenmantenimiento (idflujo, cliente, telefono,
												 direccion, fechaEmision, seccion, fechaHoraMantenimiento,
												 producto, fechaVenta, tecnicoUltimoMantenimiento,
												 tecnicoQuienReporta, descripcionMantenimiento,
												 observaciones, fechaRegistro, usuarioRegistro, estado)
									 VALUES (:f, :c, :t, :d, :fe, :s, :fm, :p, :fv, :tm, :tr, :dsc, :o, :fa, :u, 1)");

			$sql->bindValue(':f', $data->{'f'});
			$sql->bindValue(':c', utf8_decode($data->{'c'}));
			$sql->bindValue(':t', utf8_decode($data->{'t'}));
			$sql->bindValue(':d', utf8_decode($data->{'d'}));
			$sql->bindValue(':fe', $data->{'fe'});
			$sql->bindValue(':s', utf8_decode($data->{'s'}));
			$sql->bindValue(':fm', $data->{'fm'});
			$sql->bindValue(':p', utf8_decode($data->{'p'}));
			$sql->bindValue(':fv', $data->{'fv'});
			$sql->bindValue(':tm', utf8_decode($data->{'tm'}));
			$sql->bindValue(':tr', utf8_decode($data->{'tr'}));
			$sql->bindValue(':dsc', utf8_decode($data->{'dsc'}));
			$sql->bindValue(':o', utf8_decode($data->{'o'}));
			$sql->bindValue(':u', $data->{'u'});
			$sql->bindValue(':fa', $fechaActual);

			$sql->execute();
	        $postId = $dbConn->lastInsertId();

	        if($postId)
	        {
	        	//bitAcora
				$bitacora = [
				    'idOrdenMantenimiento' => $postId,
				    'idFlujo' => 1,
				    'accion' => 'Registro de Orden de Mantenimiento Nº: '.$postId,
				    'usuario' => $data->{'u'}
				]; insertarBitacora($bitacora);

	          	header("HTTP/1.1 200 OK");
	          	echo json_encode($postId);
	        }
		}
    }

    function anularOrdenMantenimiento(){
    	global $dbConn;

    	if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

			$sql = $dbConn->prepare("UPDATE ft_ordenmantenimiento set idflujo=5 where idOrdenMantenimiento=:idOM");
			$sql->bindValue(':idOM', $data->{'idOM'});

			$sql->execute();

			//bitAcora
			$bitacora = [
			    'idOrdenMantenimiento' => $data->{'idOM'},
			    'idFlujo' => 5,
			    'accion' => 'Anulación de Orden de Mantenimiento Nº: '.$data->{'idOM'},
			    'usuario' => $data->{'u'}
			]; insertarBitacora($bitacora);

			header("HTTP/1.1 200 OK");
			exit();
		}
    }

    function eliminarOrdenMantenimiento(){
    	global $dbConn;

    	if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$sql = $dbConn->prepare("UPDATE ft_ordenmantenimiento set estado=0 where idOrdenMantenimiento=:idOM");
			$sql->bindValue(':idOM', $data->{'idOM'});

			$sql->execute();

			//bitAcora
			$bitacora = [
			    'idOrdenMantenimiento' => $data->{'idOM'},
			    'idFlujo' => 0,
			    'accion' => 'Eliminación de Orden de Mantenimiento Nº: '.$data->{'idOM'},
			    'usuario' => $data->{'u'}
			]; insertarBitacora($bitacora);

			header("HTTP/1.1 200 OK");
			exit();
		}
    }

    function finalizarOrdenMantenimiento(){
    	global $dbConn;

    	if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$sql = $dbConn->prepare("UPDATE ft_ordenmantenimiento set idflujo=4 where idOrdenMantenimiento=:idOM");
			$sql->bindValue(':idOM', $data->{'idOM'});

			$sql->execute();

			$sql = $dbConn->prepare("UPDATE ft_visitatecnica set foto = :f where idOrdenMantenimiento = :idOM and estado = 1");
			$sql->bindValue(':idOM', $data->{'idOM'});
			$sql->bindValue(':f', $data->{'f'});

			$sql->execute();

			//bitAcora
			$bitacora = [
			    'idOrdenMantenimiento' => $data->{'idOM'},
			    'idFlujo' => 4,
			    'accion' => 'Finalización de Visitas Tecnicas OM Nº: '.$data->{'idOM'}.'. Pendiente Observaciones',
			    'usuario' => $data->{'u'}
			]; insertarBitacora($bitacora);

			header("HTTP/1.1 200 OK");
			exit();
		}
    }

    function actualizarOrdenMantenimiento(){
    	global $dbConn;

    	$fechaActual = date("Y-m-d H:i:s");

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

			$sql = $dbConn->prepare("UPDATE ft_ordenmantenimiento set cliente = :c, telefono = :t,
										 direccion = :d, fechaEmision = :fe, seccion = :s, fechaHoraMantenimiento = :fm,
										 producto = :p, fechaVenta = :fv, tecnicoUltimoMantenimiento = :tm,
										 tecnicoQuienReporta = :tr, descripcionMantenimiento = :dsc,
										 observaciones = :o
									where idOrdenMantenimiento = :idO");

			$sql->bindValue(':c', utf8_decode($data->{'c'}));
			$sql->bindValue(':t', utf8_decode($data->{'t'}));
			$sql->bindValue(':d', utf8_decode($data->{'d'}));
			$sql->bindValue(':fe', $data->{'fe'});
			$sql->bindValue(':s', utf8_decode($data->{'s'}));
			$sql->bindValue(':fm', $data->{'fm'});
			$sql->bindValue(':p', utf8_decode($data->{'p'}));
			$sql->bindValue(':fv', $data->{'fv'});
			$sql->bindValue(':tm', utf8_decode($data->{'tm'}));
			$sql->bindValue(':tr', utf8_decode($data->{'tr'}));
			$sql->bindValue(':dsc', utf8_decode($data->{'dsc'}));
			$sql->bindValue(':o', utf8_decode($data->{'o'}));
			$sql->bindValue(':idO', $data->{'idO'});

			$sql->execute();

			//bitAcora
			$bitacora = [
			    'idOrdenMantenimiento' => $data->{'idO'},
			    'idFlujo' => 0,
			    'accion' => 'Actualización de Orden de Mantenimiento Nº: '.$data->{'idO'},
			    'usuario' => $data->{'u'}
			]; insertarBitacora($bitacora);

	        header("HTTP/1.1 200 OK");
	        echo json_encode($fechaActual);
	        exit();
		}
    }

    function asignarOrdenMantenimiento(){
		global $dbConn;

    	$fechaActual = date("Y-m-d H:i:s");

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

			$sql = $dbConn->prepare("UPDATE ft_asignacionordenmantenimiento set estado = 0 where idOrdenMantenimiento = :idO and estado = 1");
			$sql->bindValue(':idO', $data->{'idO'});
			$sql->execute();

			$sql = $dbConn->prepare("INSERT into ft_asignacionordenmantenimiento (idOrdenMantenimiento, idTecnico,
												fechaAsignacion, estado)
									 VALUES (:idO, :idT, :f, 1)");

			$sql->bindValue(':idO', $data->{'idO'});
			$sql->bindValue(':idT', $data->{'idT'});
			$sql->bindValue(':f', $fechaActual);
			$sql->execute();

			$sql = $dbConn->prepare("UPDATE ft_ordenmantenimiento set idFlujo = 2 where idOrdenMantenimiento = :idO");
			$sql->bindValue(':idO', $data->{'idO'});
			$sql->execute();

			//bitAcora
			$bitacora = [
			    'idOrdenMantenimiento' => $data->{'idO'},
			    'idFlujo' => 2,
			    'accion' => 'Asignación de Orden de Mantenimiento Nº: '.$data->{'idO'}. ' al técnico '.$data->{'idT'},
			    'usuario' => $data->{'u'}
			]; insertarBitacora($bitacora);

	        header("HTTP/1.1 200 OK");
	        echo json_encode($fechaActual);
	        exit();
	    }
    }

    function iniciarMantenimiento(){
    	global $dbConn;

    	$fechaActual = date("Y-m-d H:i:s");

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$sql = $dbConn->prepare("UPDATE ft_ordenmantenimiento
										set idflujo=3, codigoBarras=:c
									where idOrdenMantenimiento=:idOM");
			$sql->bindValue(':idOM', $data->{'idOM'});
			$sql->bindValue(':c', $data->{'c'});

			$sql->execute();

			//bitAcora
			$bitacora = [
			    'idOrdenMantenimiento' => $data->{'idOM'},
			    'idFlujo' => 3,
			    'accion' => 'Inicio de Mantenimiento, orden Nº: '.$data->{'idOM'}.'. Código de Barras: '.$data->{'c'},
			    'usuario' => $data->{'u'}
			]; insertarBitacora($bitacora);

			header("HTTP/1.1 200 OK");
			exit();
		}
    }

    function buscarVisitaTecnica(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$consulta = "SELECT idVisitaTecnica, idOrdenMantenimiento, maquina, serie, modelo, costoMantenimiento, garantia, fechaRegistro, usuario
						 from ft_visitatecnica
						 where idOrdenMantenimiento = :idOM and estado = 1";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idOM', $data->{'idOM'});

			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
    }

    function insertarVisitaTecnica(){
    	global $dbConn;

    	$fechaActual = date("Y-m-d H:i:s");

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$consulta = "INSERT into ft_visitatecnica (idOrdenMantenimiento, maquina, serie, modelo, costoMantenimiento, garantia, fechaRegistro, usuario, estado)
						 values (:idOM, :m, :s, :md, :c, :g, :fr, :u, 1)";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idOM', $data->{'idOM'});
			$sql->bindValue(':m', utf8_decode($data->{'m'}));
			$sql->bindValue(':s', utf8_decode($data->{'s'}));
			$sql->bindValue(':md', utf8_decode($data->{'md'}));
			$sql->bindValue(':c', $data->{'c'});
			$sql->bindValue(':g', $data->{'g'});
			$sql->bindValue(':u', $data->{'u'});
			$sql->bindValue(':fr', $fechaActual);

			$sql->execute();
	        $postId = $dbConn->lastInsertId();

	        if($postId)
	        {
	        	//bitAcora
				$bitacora = [
				    'idOrdenMantenimiento' => $data->{'idOM'},
				    'idFlujo' => 0,
				    'accion' => 'Registro de Visita Técnica Nº: '.$postId.' para la Orden Nº: '.$data->{'idOM'},
				    'usuario' => $data->{'u'}
				]; insertarBitacora($bitacora);

	          	header("HTTP/1.1 200 OK");
	          	echo json_encode($postId);
	        }
		}
    }

    function actualizarVisitaTecnica(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$consulta = "UPDATE ft_visitatecnica set maquina = :m, serie = :s, modelo = :md, costoMantenimiento = :c, garantia = :g
						 where idOrdenMantenimiento = :idOM and estado = 1";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idOM', $data->{'idOM'});
			$sql->bindValue(':m', utf8_decode($data->{'m'}));
			$sql->bindValue(':s', utf8_decode($data->{'s'}));
			$sql->bindValue(':md', utf8_decode($data->{'md'}));
			$sql->bindValue(':c', $data->{'c'});
			$sql->bindValue(':g', $data->{'g'});

			$sql->execute();

			//bitAcora
			$bitacora = [
			    'idOrdenMantenimiento' => $data->{'idOM'},
			    'idFlujo' => 0,
			    'accion' => 'Actualización de Visita Técnica para la Orden de Mantenimiento Nº: '.$data->{'idOM'},
			    'usuario' => $data->{'u'}
			]; insertarBitacora($bitacora);

			header("HTTP/1.1 200 OK");
			exit();
		}
	}

	function buscarInconvenientes(){
		global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$consulta = "SELECT fI.idInconveniente, fI.idVisitaTecnica, fI.inconveniente,
							(
								select count(fTN.idTrabajosNovedades) from ft_trabajosnovedades fTN where fTN.idInconveniente = fI.idInconveniente and fTN.idTipoActividad = 1 and fTN.estado = 1
							) as trabajos,
							(
								select count(fTN.idTrabajosNovedades) from ft_trabajosnovedades fTN where fTN.idInconveniente = fI.idInconveniente and fTN.idTipoActividad = 2 and fTN.estado = 1
							) as novedades,
						 fI.fechaRegistro, fI.usuario
						 from ft_inconveniente fI
						 where fI.idVisitaTecnica = :idVT and fI.estado = 1";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idVT', $data->{'idVT'});

			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
	}

    function insertarInconveniente(){
    	global $dbConn;

    	$fechaActual = date("Y-m-d H:i:s");

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$consulta = "INSERT into ft_inconveniente (idVisitaTecnica, inconveniente, fechaRegistro, usuario, estado)
						 values (:idVT, :i, :fr, :u, 1)";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idVT', $data->{'idVT'});
			$sql->bindValue(':i', utf8_decode($data->{'i'}));
			$sql->bindValue(':u', $data->{'u'});
			$sql->bindValue(':fr', $fechaActual);

			$sql->execute();
	        $postId = $dbConn->lastInsertId();

	        if($postId)
	        {
	        	foreach($data->trabajosnovedades as $tn)
			    {		    
					$consulta = "INSERT into ft_trabajosnovedades (idInconveniente, idTipoActividad, descripcion, fechaRegistro, usuario, estado)
								 values (:idI, :idA, :d, :fr, :u, 1)";

					$sql = $dbConn->prepare($consulta);
					$sql->bindValue(':idI', $postId);
					$sql->bindValue(':idA', $tn->{'idA'});
					$sql->bindValue(':d', utf8_decode($tn->{'d'}));
					$sql->bindValue(':u', $data->{'u'});
					$sql->bindValue(':fr', $fechaActual);

					$sql->execute();
				}

				//bitAcora
				$bitacora = [
				    'idOrdenMantenimiento' => $data->{'idOM'},
				    'idFlujo' => 0,
				    'accion' => 'Registro de Inconveniente Nº: '.$postId.' para la Visita Técnica Nº: '.$data->{'idVT'}.'. Orden de Mantenimiento Nº: '.$data->{'idOM'},
				    'usuario' => $data->{'u'}
				]; insertarBitacora($bitacora);

	          	header("HTTP/1.1 200 OK");
	          	echo json_encode($postId);
	        }
		}
    }

    function eliminarInconveniente(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$consulta = "UPDATE ft_inconveniente set estado = 0
						 where idInconveniente = :idI";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idI', $data->{'idI'});

			$sql->execute();

			//bitAcora
			$bitacora = [
			    'idOrdenMantenimiento' => $data->{'idOM'},
			    'idFlujo' => 0,
			    'accion' => 'Eliminación del Inconveniente Nº: '.$data->{'idI'}.' para la Orden de Mantenimiento Nº: '.$data->{'idOM'},
			    'usuario' => $data->{'u'}
			]; insertarBitacora($bitacora);

			header("HTTP/1.1 200 OK");
	        exit();
		}
    }

    function actualizarInconveniente(){
    	global $dbConn;

    	$fechaActual = date("Y-m-d H:i:s");

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			//Se actualiza el inconveniente
			$consulta = "UPDATE ft_inconveniente set inconveniente = :i where idInconveniente = :idI";
			
			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':i', $data->{'i'});
			$sql->bindValue(':idI', $data->{'idI'});

			$sql->execute();

			//se setea el estado en cero de todos los trabajos y novedades
			$consulta = "UPDATE ft_trabajosnovedades set estado = 0 where idInconveniente = :idI";
			
			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idI', $data->{'idI'});

			$sql->execute();

        	foreach($data->trabajosnovedades as $tn)
		    {
		    	if($tn->{'idTN'} == 0){
		    		//Se insertan los nuevos trabajos / novedades ingresados
					$consulta = "INSERT into ft_trabajosnovedades (idInconveniente, idTipoActividad, descripcion, fechaRegistro, usuario, estado)
								 values (:idI, :idA, :d, :fr, :u, 1)";

					$sql = $dbConn->prepare($consulta);
					$sql->bindValue(':idI', $data->{'idI'});
					$sql->bindValue(':idA', $tn->{'idA'});
					$sql->bindValue(':u', $data->{'u'});
					$sql->bindValue(':fr', $fechaActual);
				}
				else{
					//Se actualiza la descripcion del trabajo / novedad y se vuelve a activar si ya existia el registro
			    	$consulta = "UPDATE ft_trabajosnovedades set descripcion = :d, estado = 1 where idTrabajosNovedades = :idTN";
			    	
			    	$sql = $dbConn->prepare($consulta);
					$sql->bindValue(':idTN', $tn->{'idTN'});
				}

				$sql->bindValue(':d', utf8_decode($tn->{'d'}));

				$sql->execute();
			}

			//bitAcora
			$bitacora = [
			    'idOrdenMantenimiento' => $data->{'idOM'},
			    'idFlujo' => 0,
			    'accion' => 'Actualización del Inconveniente Nº: '.$data->{'idI'}.' para la Orden de Mantenimiento Nº: '.$data->{'idOM'},
			    'usuario' => $data->{'u'}
			]; insertarBitacora($bitacora);

          	header("HTTP/1.1 200 OK");
          	exit();
		}
    }

    function buscarTrabajosNovedades(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$consulta = "SELECT idTrabajosNovedades, idInconveniente, idTipoActividad, descripcion, fechaRegistro, usuario
						 from ft_trabajosnovedades
						 where idInconveniente = :idI and estado = 1";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idI', $data->{'idI'});

			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()));
	        exit();
		}
    }

    function guardarObservaciones(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$sql = $dbConn->prepare("UPDATE ft_ordenmantenimiento
										set idflujo=6, observaciones=:o
									where idOrdenMantenimiento=:idOM");
			$sql->bindValue(':idOM', $data->{'idOM'});
			$sql->bindValue(':o', utf8_decode($data->{'o'}));

			$sql->execute();

			//bitAcora
			$bitacora = [
			    'idOrdenMantenimiento' => $data->{'idOM'},
			    'idFlujo' => 6,
			    'accion' => 'Observaciones registradas, orden Nº: '.$data->{'idOM'}.'. Observaciones: '.$data->{'o'},
			    'usuario' => $data->{'u'}
			]; insertarBitacora($bitacora);

			header("HTTP/1.1 200 OK");
			exit();
		}
    }

?>