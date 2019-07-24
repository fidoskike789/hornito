<?php
    ini_set('date.timezone','America/Bogota');

    //Se abre la conexiOn a la BD
    function connect($db)
    {
        try {
            $conn = new PDO("mysql:host={$db['host']};dbname={$db['db']}", $db['username'], $db['password']);
            //Seteamos el PDO error mode a exception
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;
        } catch (PDOException $exception) {
            exit($exception->getMessage());
        }
    }

    //Obtenemos los parAmetros para actualizaciones
    function getParams($input)
    {
        $filterParams = [];
        foreach($input as $param => $value)
        {
            $filterParams[] = "$param=:$param";
        }
        return implode(", ", $filterParams);
    }

    //Asociamos todos los parametros a un sql
    function bindAllValues($statement, $params)
    {
    	foreach($params as $param => $value)
        {
    		$statement->bindValue(':'.$param, $value);
    	}
    	return $statement;
    }

    //convertimos a tamaño de cadena UTF8
    function utf8ize($d) {
        if (is_array($d)) {
            foreach ($d as $k => $v) {
                $d[$k] = utf8ize($v);
            }
        } else if (is_string ($d)) {
            return utf8_encode($d);
        }
        return $d;
    }

    function getGUID(){
        if (function_exists('com_create_guid')){
            return com_create_guid();
        }else{
            mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
            $charid = strtoupper(md5(uniqid(rand(), true)));
            $hyphen = chr(45);// "-"
            $uuid = chr(123)// "{"
                .substr($charid, 0, 8).$hyphen
                .substr($charid, 8, 4).$hyphen
                .substr($charid,12, 4).$hyphen
                .substr($charid,16, 4).$hyphen
                .substr($charid,20,12)
                .chr(125);// "}"
            return $uuid;
        }
    }
?>