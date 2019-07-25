<?php
	include "connection.php";
    include "utilities.php";

    $dbConn =  connect($db);
    $methodName = $_GET["MethodName"];
    $response = $methodName();

    function consultarOrdenesMantenimiento(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$filtros = "";

			if($data->{'o'} != "")//Orden
				$filtros = $filtros." and om.idOrdenMantenimiento = ".$data->{'o'};
			if($data->{'t'} != 0)//TEcnico
				$filtros = $filtros." and oma.idTecnico = ".$data->{'t'};
			if($data->{'fd'} != "")//Fecha Desde
				$filtros = $filtros." and om.fechaRegistro >= '".$data->{'fd'}." 00:00:00'";
			if($data->{'fh'} != "")//Fecha Hasta
				$filtros = $filtros." and om.fechaRegistro <= '".$data->{'fh'}." 23:59:59'";

			$consulta = "SELECT om.idOrdenMantenimiento, om.cliente, om.producto, om.fechaEmision, om.fechaRegistro,
							IFNULL(u.nombres,'') as nombres,
							IFNULL(u.apellidos,'') as apellidos,
							oma.fechaAsignacion, om.usuarioRegistro,
							IFNULL(om.observaciones,'') as observaciones,
							(
							    select c.detalle
							    from ft_vCatalogos c
							    where c.catalogo = 'catFlujos' and c.codigo = om.idflujo
							    limit 1
							) as estadoDetalle,
							(
							    select bom.fechaRegistro from ft_bitacoraordenmantenimiento bom 
							    where om.idOrdenMantenimiento = bom.idOrdenMantenimiento and idFlujo = 3
							    order by bom.idBitacora desc
							    limit 1
							) fechaInicio,
							(
							    select bom.fechaRegistro from ft_bitacoraordenmantenimiento bom 
							    where om.idOrdenMantenimiento = bom.idOrdenMantenimiento and idFlujo = 4
							    order by bom.idBitacora desc
							    limit 1
							) fechaFin,
							om.idflujo, om.fechaVenta, om.garantia, om.telefono, om.direccion, om.tecnicoUltimoMantenimiento,
							om.tecnicoQuienReporta, om.descripcionMantenimiento
						FROM
						ft_ordenmantenimiento om
						left join ft_asignacionordenmantenimiento oma
						on om.idOrdenMantenimiento = oma.idOrdenMantenimiento
						left join ft_usuario u
						on oma.idTecnico = u.idUsuario
						where (oma.estado = 1 or oma.estado is null) and om.estado = 1 ".$filtros." 
						order by om.idOrdenMantenimiento asc";
			$sql = $dbConn->prepare($consulta);
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
    }

    function consultarOrdenMantenimientoDetalle(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

			$sql = $dbConn->prepare("SELECT om.fechaRegistro, om.usuarioRegistro, aom.fechaAsignacion, om.observaciones,
									(
									    select bom.usuario from ft_bitacoraordenmantenimiento bom 
									    where om.idOrdenMantenimiento = bom.idOrdenMantenimiento and idFlujo = 2
									    order by bom.idBitacora desc
									    limit 1
									) usuarioAsignacion,
									u.usuario as tecnicoAsignado,
									(
									    select bom.fechaRegistro from ft_bitacoraordenmantenimiento bom 
									    where om.idOrdenMantenimiento = bom.idOrdenMantenimiento and idFlujo = 3
									    order by bom.idBitacora desc
									    limit 1
									) fechaInicio,
									(
									    select bom.fechaRegistro from ft_bitacoraordenmantenimiento bom 
									    where om.idOrdenMantenimiento = bom.idOrdenMantenimiento and idFlujo = 4
									    order by bom.idBitacora desc
									    limit 1
									) fechaFin,
									om.codigoBarras,
									(
										select c.detalle
									    from ft_vCatalogos c
									    where c.catalogo = 'catFlujos' and c.codigo = om.idflujo
									    limit 1
									) as estadoDetalle,
									vT.foto
									from ft_ordenmantenimiento om
									left join ft_asignacionordenmantenimiento aom
									on aom.idOrdenMantenimiento = om.idOrdenMantenimiento
									left join ft_usuario u
									on aom.idTecnico = u.idUsuario
									left join ft_visitatecnica vT
									on vT.idOrdenMantenimiento = om.idOrdenMantenimiento
									where (aom.estado = 1 or aom.estado is null) and om.idOrdenMantenimiento = :idOM");


			$sql->bindValue(':idOM', $data->{'idOM'});

			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
    }

    function consultarReporte(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$filtros = "";

			if($data->{'fd'} != "")//Fecha Desde
				$filtros = $filtros." and om.fechaRegistro >= '".$data->{'fd'}." 00:00:00'";
			if($data->{'fh'} != "")//Fecha Hasta
				$filtros = $filtros." and om.fechaRegistro <= '".$data->{'fh'}." 23:59:59'";

  			$consulta = "SELECT codigoBarras, producto, cliente, direccion, telefono, serie, modelo
						from (
							SELECT om.codigoBarras,
                                GROUP_CONCAT(distinct om.producto) as producto,
                                GROUP_CONCAT(distinct om.cliente) as cliente,
                                GROUP_CONCAT(distinct om.direccion) as direccion,
                                GROUP_CONCAT(distinct om.telefono) as telefono,
                          		GROUP_CONCAT(distinct vT.serie) as serie,
                          		GROUP_CONCAT(distinct vT.modelo) as modelo
                        	from ft_ordenmantenimiento om
                          	join ft_visitatecnica vT
                          	on om.idOrdenMantenimiento = vT.idOrdenMantenimiento
                        	where om.codigoBarras in (SELECT DISTINCT omT.codigoBarras
                                                  	  from ft_ordenmantenimiento omT
                                                  	  where omT.codigoBarras is not null
                                                  	  and omT.estado = 1 ".$filtros.")
                          	and vT.estado = 1
							group by om.codigoBarras
  						) as resultado where codigoBarras is not null";
			
			$sql = $dbConn->prepare($consulta);
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
    }

    function consultarReporteDetalle(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

			$consulta = "SELECT (
						    select bom.fechaRegistro from ft_bitacoraordenmantenimiento bom 
						    where om.idOrdenMantenimiento = bom.idOrdenMantenimiento and idFlujo = 4
						    order by bom.idBitacora desc
						    limit 1
						) as fecha,
						vi.inconveniente,vtn.idTipoActividad, vtn.descripcion, om.idOrdenMantenimiento,
						vt.estadocodigo, om.observaciones,
						CONCAT(u.nombres,' ', u.apellidos) as tecnico,
						vt.costoMantenimiento
						FROM ft_ordenmantenimiento om
						join ft_visitatecnica vt
						on om.idOrdenMantenimiento = vt.idOrdenMantenimiento
						join ft_inconveniente vi
						on vt.idVisitaTecnica = vi.idVisitaTecnica
						join ft_trabajosnovedades vtn
						on vi.idInconveniente = vtn.idInconveniente
						join ft_asignacionordenmantenimiento aom
						on aom.idOrdenMantenimiento = om.idOrdenMantenimiento
						join ft_usuario u
						on u.idUsuario = aom.idTecnico
						where om.codigoBarras=:cb
						and om.estado = 1 and vt.estado = 1
						and vi.estado = 1
						and vtn.estado = 1
						and (aom.estado = 1 or aom.estado is null)";
						
			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':cb', $data->{'cb'});
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
    }

    function consultarVisitaTecnica(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

	    	$consulta = "SELECT oM.idOrdenMantenimiento, vT.fechaRegistro, vT.maquina, vT.serie, vT.modelo,
	    				CONCAT(u.nombres,' ', u.apellidos) as tecnico, vT.costoMantenimiento,
						fI.inconveniente
						from ft_inconveniente fI
						join ft_visitatecnica vT
						on fI.idVisitaTecnica = vT.idVisitaTecnica
						join ft_ordenmantenimiento oM
						on oM.idOrdenMantenimiento = vT.idOrdenMantenimiento
						join ft_asignacionordenmantenimiento aom
						on aom.idOrdenMantenimiento = oM.idOrdenMantenimiento
						join ft_usuario u
						on u.idUsuario = aom.idTecnico
						where fI.estado = 1
						and vT.estado = 1
						and oM.estado = 1
						and aom.estado = 1
						and oM.idOrdenMantenimiento = :idOM
						order by fI.idInconveniente asc";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idOM', $data->{'idOM'});
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
    }

    function consultarVisitaTecnicaTrabajosNovedades(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

			$consulta = "SELECT om.idOrdenMantenimiento, vTN.idTipoActividad, vTN.descripcion
						from ft_trabajosnovedades vTN
						join ft_inconveniente fI
						on vTN.idInconveniente = fI.idInconveniente
						join ft_visitatecnica vT
						on vT.idVisitaTecnica = fI.idVisitaTecnica
						join ft_ordenmantenimiento om
						on om.idOrdenMantenimiento = vT.idOrdenMantenimiento
						where vTN.estado = 1
						and fI.estado = 1
						and vT.estado = 1
						and om.estado = 1
						and om.idOrdenMantenimiento = :idOM
						order by vTN.idTipoActividad asc, vTN.idTrabajosNovedades asc";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idOM', $data->{'idOM'});
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()));
	        exit();
		}
    }
?>