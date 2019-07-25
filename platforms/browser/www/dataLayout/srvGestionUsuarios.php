<?php
	include "connection.php";
    include "utilities.php";

    $dbConn =  connect($db);
    $methodName = $_GET["MethodName"];
    $response = $methodName();

    function listarUsuarios(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);

			$consulta = "SELECT u.idUsuario, u.usuario, u.nombres, u.apellidos, u.telefono, u.email, u.estado, p.idPerfil, p.nombre,
							(
							case
								when u.estado = 1 then 'ACTIVO'
							  	else 'BLOQUEADO'
							end
							) as estadoDetalle
						from ft_usuario u
			            inner join ft_perfilusuario pU
			            on u.idUsuario = pU.idUsuario
			            inner join ft_perfil p
			            on pU.idPerfil = p.idPerfil
			            where u.idUsuario=:idU and pU.estado = 1
						order by u.apellidos asc, u.nombres asc";

			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':idU', $data->{'idU'});
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
		else
		{
			$consulta = "SELECT u.idUsuario, u.usuario, u.nombres, u.apellidos, u.telefono, u.email, u.estado, p.idPerfil, p.nombre as perfil,
							(
							case
								when u.estado = 1 then 'ACTIVO'
							  	else 'BLOQUEADO'
							end
							) as estadoDetalle
						from ft_usuario u
			            inner join ft_perfilusuario pU
			            on u.idUsuario = pU.idUsuario
			            inner join ft_perfil p
			            on pU.idPerfil = p.idPerfil
			            where pU.estado = 1 and u.idUsuario > 1
						order by u.apellidos asc, u.nombres asc";

			$sql = $dbConn->prepare($consulta);
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
    }

    function verificarUsuarioRegistrado(){ 
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			$consulta = "SELECT idUsuario
						 from ft_usuario where usuario=:u";
			$sql = $dbConn->prepare($consulta);
			$sql->bindValue(':u', $data->{'u'});
			$sql->execute();
	        $sql->setFetchMode(PDO::FETCH_ASSOC);
	        header("HTTP/1.1 200 OK");
	        echo json_encode(utf8ize( $sql->fetchAll()  ));
	        exit();
		}
    }

    function insertarUsuario(){
    	global $dbConn;

    	$empresa = 1;//cOdigo quemado

		if (isset($_GET["data"])) //Listar informacion usuario especifico
		{
			$data = json_decode ($_GET["data"]);
			
			$sql = $dbConn->prepare("INSERT INTO ft_usuario (idEmpresa, usuario, nombres, apellidos, telefono, email, password, estado) 
									 VALUES (:empresa, :u, :n, :a, :t, :e, :p, 1)");
        	$sql->bindValue(':empresa', $empresa);
        	$sql->bindValue(':u', $data->{'u'});
        	$sql->bindValue(':n', utf8_decode($data->{'n'}));
        	$sql->bindValue(':a', utf8_decode($data->{'a'}));
        	$sql->bindValue(':t', utf8_decode($data->{'t'}));
        	$sql->bindValue(':e', utf8_decode($data->{'e'}));
        	$sql->bindValue(':p', utf8_decode($data->{'p'}));
			$sql->execute();
	        $postId = $dbConn->lastInsertId();

	        if($postId)
	        {
	        	$sql = $dbConn->prepare("INSERT INTO ft_perfilusuario (idPerfil, idUsuario, estado) 
										 VALUES (:r, :idU, 1)");
	        	$sql->bindValue(':r', $data->{'r'});
	        	$sql->bindValue(':idU', $postId);
	        	$sql->execute();
	          	header("HTTP/1.1 200 OK");
	          	echo json_encode($postId);
	        }
		}
    }

    function bloquearActivarUsuario(){
    	global $dbConn;	
    	if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			
			$sql = $dbConn->prepare("UPDATE ft_usuario set estado = :e, guid = null
									 where idUsuario = :idU");
			$sql->bindValue(':idU', $data->{'idU'});
			$sql->bindValue(':e', $data->{'e'});
        	$sql->execute();
        	header("HTTP/1.1 200 OK");
        	exit();
		}
    }

    function actualizarUsuario(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			
			//Actualizo la informaciOn del Usuario
			$sql = $dbConn->prepare("UPDATE ft_usuario
									 set nombres = :n, apellidos = :a, telefono = :t, email = :e
									 where idUsuario = :idU");
        	
        	$sql->bindValue(':n', utf8_decode($data->{'n'}));
        	$sql->bindValue(':a', utf8_decode($data->{'a'}));
        	$sql->bindValue(':t', utf8_decode($data->{'t'}));
        	$sql->bindValue(':e', utf8_decode($data->{'e'}));
        	$sql->bindValue(':idU', $data->{'idU'});
			$sql->execute();

			//Actualizo a estado 0 el perfil actual
        	$sql = $dbConn->prepare("UPDATE ft_perfilusuario
        							 set estado = 0
        							 where idUsuario = :idU");
        	$sql->bindValue(':idU', $data->{'idU'});
        	$sql->execute();
          	
          	//Inserto el nuevo perfil seleccionado
          	$sql = $dbConn->prepare("INSERT INTO ft_perfilusuario (idPerfil, idUsuario, estado) 
									 VALUES (:r, :idU, 1)");
        	$sql->bindValue(':r', $data->{'r'});
        	$sql->bindValue(':idU', $data->{'idU'});
        	$sql->execute();
          	header("HTTP/1.1 200 OK");
          	exit();
		}
    }

    function resetearPass(){
    	global $dbConn;

		if (isset($_GET["data"]))
		{
			$data = json_decode ($_GET["data"]);
			
			$sql = $dbConn->prepare("UPDATE ft_usuario
									 set password = usuario
									 where idUsuario = :idU");

        	$sql->bindValue(':idU', $data->{'idU'});
			$sql->execute();

          	header("HTTP/1.1 200 OK");
          	exit();
		}
    }
?>