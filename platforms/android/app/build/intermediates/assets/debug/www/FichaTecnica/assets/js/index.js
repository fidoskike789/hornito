$(document).on("ready", iniciar);

document.addEventListener('deviceready', function () {
	/*var notificationOpenedCallback = function(jsonData) {
		$.gritter.add({
			title: 'Tiene una orden de mantenimiento pendiente!',
			text: 'Tiene una .',
			time: 4000
		});

		console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
	};

	window.plugins.OneSignal
		.startInit(OneSignalAppId)
		.handleNotificationOpened(notificationOpenedCallback)
		.endInit();*/
}, false);

var sessionTmp = null;

function iniciar(){
	sessionTmp = JSON.parse(localStorage.getItem("session"));
	bloquearPagina();
	
	if(localStorage.getItem("session") != null){
		if($("#btnCerrarSesion").length == 0){
			setTimeout(function(){
				if (sessionTmp._datosUsuario.passactualizada == 1){
					$.unblockUI();
					//verificar guid
					$.ajax({
					    url: dominio + "/dataLayout/srvSeguridades.php",
					    method: 'GET',
					    data: {MethodName: "verificarGuidUsuario", data: '{"idU": "' + sessionTmp._datosUsuario.idUsuario + '", "g": "' + sessionTmp._datosUsuario.guid + '"}'},
					    success: function(result) {
					    	var res = JSON.parse(result);
					    	if(res.length > 0)
					    		location.href = "dashboard.html";
					    },
					    error: function(request,msg,error) {
					        console.log(msg);
					    }
					})
				}
				else
					$.unblockUI();
			}, 1500);
		}
		else
			$.unblockUI();
	}
	else
		$.unblockUI();

	$("#btnLogin").on("click", login);
	$("#btnCambiarPassword").on("click", cambiarContrasena);
	$("#btnCancelarCambio").on("click", cerrarSesion);
}

function cambiarContrasena(){
	var validacion = false;
	var formulario = $("#frmCambioPassword");
	var reglasLogin = {
		"txtNuevoPassword": {
			required: true,
			notEqualUserPass: sessionTmp._datosUsuario.usuario
		},
		"txtNuevoPasswordRepeat": {
			required: true,
			equalTo: "#txtNuevoPassword"
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
		    data: {MethodName: "verificarGuidUsuario", data: '{"idU": "' + sessionTmp._datosUsuario.idUsuario + '", "g": "' + sessionTmp._datosUsuario.guid + '"}'},
		    success: function(verificacion) {
		        var ver = JSON.parse(verificacion);
		        if(ver.length == 0){
		            cerrarSesion();
		            return false;
		        }

		        $.ajax({
				    url: dominio + "/dataLayout/srvSeguridades.php",
				    method: 'GET',
				    data: {MethodName: "actualizarPass", data: '{"idU": "' + sessionTmp._datosUsuario.idUsuario + '", "p": "' + $("#txtNuevoPassword").val() + '"}'},
				    success: function(result) {
				    	sessionTmp._datosUsuario.passactualizada = 1;
				    	localStorage.setItem("session",JSON.stringify(sessionTmp));
				        location.href = "dashboard.html";
				    },
				    error: function(request,msg,error) {
				    	$.gritter.add({
							title: 'Error!',
							text: 'No se pudo actualizar la contraseña.',
							time: 4000
						});
				        console.log(msg);
				    }
				})
		    },
		    error: function(request,msg,error) {
		        cerrarSesion();
		        console.log(msg);
		    }
		})
	}
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
					    	var passActualizada = 0; //No actualizada

					    	if($("#txtUsuario").val() != $("#txtPassword").val()) //Contraseña actualizada
				        		passActualizada	= 1;

					    	var sessionData = {
				        		"_auntenticado" : true,
				        		"_datosUsuario" : {
				        			"idUsuario": json[0].idUsuario,
				        			"nombres": json[0].nombres,
				        			"apellidos": json[0].apellidos,
				        			"email": json[0].email,
				        			"telefono": json[0].telefono,
				        			"usuario": json[0].usuario,
				        			"passactualizada": passActualizada,
				        			"guid": json[0].guid,
				        			"idperfil":  json[0].idPerfil
				        		},
				        		"_menu": menuSession
				        	}

				        	localStorage.setItem("session",JSON.stringify(sessionData));

				        	if(passActualizada == 0)
				        		location.href = "actualizarContrasena.html";
				        	else
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