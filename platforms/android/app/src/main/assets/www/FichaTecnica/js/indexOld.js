$(document).on("ready", iniciar);

function iniciar(){
	if(localStorage.getItem("session") != null){
		bloquearPagina();
		setTimeout(function(){
			location.href = "dashboard.html";
		}, 1500);
	}
	$("#btnLogin").on("click", login);
}

function login(){
	var validacion = false;
	var formulario = $("#frmLogin");
	var reglasLogin = {
		"txtUsuario": {
			required: true
		},
		"txtPassword": {
			required: true
		}
	}

	formulario.validate({
		ignore: '.ignore',
        focusInvalid: false,
        rules: reglasLogin
	})

	validacion = formulario.valid();

	if(validacion){
		$.ajax({
		    url: dominio + "/dataLayout/srvSeguridades.php",
		    method: 'GET',
		    data: {MethodName: "validarUsuario", data: '{"u": "' + $("#txtUsuario").val() + '", "p": "' + $("#txtPassword").val() + '"}'},
		    success: function(result) {
		        var json = JSON.parse(result);

				if(json.length != 0){
			        $.ajax({
					    url: dominio + "/dataLayout/srvSeguridades.php",
					    method: 'GET',
					    data: {MethodName: "menuPerfilUsuario", data: '{"idU": "' + json[0].idUsuario + '"}'},
					    success: function(menu) {
					    	var menuSession = JSON.parse(menu);
					    	var sessionData = {
				        		"_auntenticado" : true,
				        		"_datosUsuario" : {
				        			"idUsuario": json[0].idUsuario,
				        			"nombres":  json[0].nombres,
				        			"apellidos":  json[0].apellidos,
				        			"email":  json[0].email,
				        			"telefono":  json[0].telefono,
				        			"usuario":  json[0].usuario
				        		},
				        		"_menu": menuSession
				        	}

				        	localStorage.setItem("session",JSON.stringify(sessionData));
				        	location.href = "dashboard.html";
					    },
					    error: function(request,msg,error) {
					        $.gritter.add({
								title: 'Error!',
								text: 'No se pudo cargar el menú de opciones.',
								time: 5000
							});
					        console.log(msg);
					    }
					})
		        }
		        else {
		        	$.gritter.add({
						title: 'Sin Acceso!',
						text: 'Usuario no registrado o sin acceso.',
						time: 4000
					});

					$("#txtUsuario").val("");
					$("#txtPassword").val("");
		        }
		    },
		    error: function(request,msg,error) {
		    	$.gritter.add({
					title: 'Error!',
					text: 'No se pudo validar el usuario.',
					time: 4000
				});
		        console.log(msg);
		    }
		})
	}
}