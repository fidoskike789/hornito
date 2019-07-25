$.ajax({
    url: dominio + "/dataLayout/srvSeguridades.php",
    method: 'GET',
    data: {MethodName: "verificarGuidUsuario", data: '{"idU": "' + sessionTmp._datosUsuario.idUsuario + '", "g": "' + sessionTmp._datosUsuario.guid + '"}'},
    success: function(result) {
        var res = JSON.parse(result);
        if(res.length == 0){
            cerrarSesion();
            return false;
        }
    },
    error: function(request,msg,error) {
        cerrarSesion();
        console.log(msg);
    }
})