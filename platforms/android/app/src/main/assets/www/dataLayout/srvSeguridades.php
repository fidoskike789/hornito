<?php
    include "connection.php";
    include "utilities.php";

    $dbConn =  connect($db);
    $methodName = $_GET["MethodName"];
    $response = $methodName();

    function validarUsuario(){
		global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			
			//Registro de GUID
			$guid = getGUID();
			$sql = $dbConn->prepare("UPDATE ft_usuario set guid=:guid where usuario=:u and password=:p and estado=1");
			
			$sql->bindValue(':guid', $guid);
			$sql->bindValue(':u', $data->{'u'});
			$sql->bindValue(':p', utf8_decode($data->{'p'}));

			$sql->execute();

			//consultar usuario
			$consulta = "SELECT u.idUsuario, u.usuario, u.nombres, u.apellidos, u.telefono, u.email, u.guid, pu.idPerfil
			            from ft_usuario u
			            join ft_perfilusuario pu
			            on u.idUsuario = pu.idUsuario
			            where u.usuario=:u and u.password=:p and u.estado=1";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':u', $data->{'u'});
			$sql->bindValue(':p', $data->{'p'});
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
    }

    function menuPerfilUsuario(){
    	global $dbConn;

    	$empresa = 1;//cOdigo quemado
    	$app = 1;//cOdigo quemado

		if (isset($_GET["data"]))
		{
    		$data = json_decode ($_GET["data"]);
    		$consulta = "SELECT distinct m.icono, m.idMenu, m.idMenuPadre, m.nivel, m.nombre, m.orden, m.url
						from ft_menu m
						inner join ft_perfilmenu pm on m.idMenu = pm.idMenu
						inner join ft_perfil p on pm.idPerfil = p.idPerfil
						inner join ft_perfilusuario pu on p.idPerfil = pu.idPerfil
						where pu.idUsuario = :idU
						and m.idModulo = :app
						and pm.Estado = 1
						and m.Estado = 1
						and p.idEmpresa = :empresa
						order by m.nivel asc, m.idMenuPadre, m.orden asc";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idU', $data->{'idU'});
			$sql->bindValue(':app', $app);
			$sql->bindValue(':empresa', $empresa);
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
    	}
    }

    function listarPerfiles(){
    	global $dbConn;

    	$empresa = 1;//cOdigo quemado

		$consulta = "SELECT idPerfil, nombre
					 from ft_perfil
					 where idEmpresa=:empresa and estado=1
					 order by nombre asc";

		$sql = $dbConn->prepare($consulta);
		$sql->bindValue(':empresa', $empresa);
		$sql->execute();
        $sql->setFetchMode(PDO::FETCH_ASSOC);
        header("HTTP/1.1 200 OK");
        echo json_encode(utf8ize( $sql->fetchAll()  ));
        exit();
    }

    function listarCatalogo(){
    	global $dbConn;

    	if (isset($_GET["data"]))
    	{
    		$data = json_decode ($_GET["data"]);
    		$consulta = "SELECT codigo, detalle
    					 from ft_vCatalogos
    					 where catalogo=:c and estado=1
    					 order by detalle asc";
    		$sql = $dbConn->prepare($consulta);
    		$sql->bindValue(':c', $data->{'c'});
    		$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
    	}
    }

    function listarUsuarios(){
    	global $dbConn;

    	if (isset($_GET["data"]))
    	{
    		$data = json_decode ($_GET["data"]);
			$consulta = "SELECT u.idUsuario, u.usuario, u.nombres, u.apellidos, u.telefono, u.email
						from ft_usuario u
						inner join ft_perfilusuario pu
						on u.idUsuario = pu.idUsuario
						where pu.idPerfil = :p and pu.estado = 1 and u.estado=1";
			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':p', $data->{'p'});
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
    	}
    	else
    	{
			$consulta = "SELECT u.idUsuario, u.usuario, u.nombres, u.apellidos, u.telefono,
								u.email, p.nombre as perfil
						from ft_usuario u
						inner join ft_perfilusuario pu
						on u.idUsuario = pu.idUsuario
						inner join ft_perfil p
						on p.idPerfil = pu.idPerfil
						where pu.estado = 1 and u.estado=1";
			$sql = $dbConn->prepare($consulta);
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
    	}
    }

    function actualizarPass(){
    	global $dbConn;

    	if (isset($_GET["data"]))
    	{
    		$data = json_decode ($_GET["data"]);
			$sql = $dbConn->prepare("UPDATE ft_usuario set password	= :p
									 where idUsuario = :idU");
			$sql->bindValue(':p', utf8_decode($data->{'p'}));
			$sql->bindValue(':idU', $data->{'idU'});
			$sql->execute();
	        
	        header("HTTP/1.1 200 OK");
          	exit();
    	}
    }

    function verificarGuidUsuario(){
    	global $dbConn;

    	if (isset($_GET["data"]))
    	{			
    		$data = json_decode ($_GET["data"]);
			$consulta = "SELECT guid
						from ft_usuario
						where idUsuario=:idU and guid=:g and estado=1";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idU', $data->{'idU'});
			$sql->bindValue(':g', $data->{'g'});
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
    	}
    }
?>