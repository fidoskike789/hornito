$(document).on("ready", iniciar);

var sessionTmp = null;
var idUsuarioBloqueoActivacion = 0;
var idUsuarioActualizacion = 0;
var estadoUsuario = 0;
var columnas = [
    {
    	"mData": "idUsuario",
        "title": "ID",
        "visible": false
    }, {
        "mData": "apellidos",
        "title": "Apellidos"
    }, {
        "mData": "nombres",
        "title": "Nombres"
    }, {
        "mData": "usuario",
        "title": "Usuario"
    }, {
        "mData": "perfil",
        "title": "Perfil",
        "sClass": "desktop"
    }, {
        "mData": "telefono",
        "title": "Teléfono",
        "sClass": "desktop"
    }, {
        "mData": "email",
        "title": "Email",
        "sClass": "desktop"
    }, {
        "mData": "estadoDetalle",
        "title": "Estado",
        "mRender": function (data, type, full) {

        	return "<span style='font-weight: bolder; color: " + ((full.estado == 0) ? "red" : "green") + "'>" + full.estadoDetalle + "</span>"
        }
    }, {
        "bSortable": false,
        "width": "80px",
        "mRender": function (data, type, full) {
        	if(full.usuario == $(".logged-user .name").html())
        		return "";
        	else
            	return "<div class='btn-group'>"
            				+ "<a id='btnE" + full.idUsuario + "' class='btn btn-xs btn-warning' onclick='editarUsuario(this)'><i class='fa fa-edit'></i></a>"
            	  	  		+ "<a id='btnBA" + full.idUsuario + "' data-id='" + full.idUsuario + "' data-usuario='" + full.usuario + "' data-estado='" + full.estado + "' class='btn btn-xs btn-" + ((full.estado == 0) ? "success" : "danger") + "' onclick='confirmarBloqueoActivacionUsuario(this)' data-toggle='modal' data-target='#mdConfirmacionBloqueoActivacion'><i class='fa " + ((full.estado == 0) ? "fa-check" : "fa-times") + "'></i></a>"
            	  	  + "</div>";
        }
    }
]

function iniciar(){
	sessionTmp = JSON.parse(localStorage.getItem("session"));
	addActiveMenu("Usuarios");

	$("#txtPassword").attr("disabled","disabled");
	$("#txtPasswordRepeat").attr("disabled","disabled");
	$("#txtPassword").parent().parent().parent().hide();
	$("#txtPasswordRepeat").parent().parent().parent().hide();

	$("#pnlNuevoUsuario").hide();
	$("#btnNuevoUsuario").on("click", nuevoUsuario);
	$("#btnCancelarUsuario").on("click", cancelarUsuario);
	$("#btnGuardarUsuario").on("click", guardarUsuario);
	$("#btnBloquearActivarUsuario").on("click", bloquearUsuario);
	$("#btnResetearPassword").on("click", resetearPass);

	$("#slcRol").on("change", function(){
		if($(this).val() != "0")
			$(this).css("color", "");
		else
			$(this).css("color", "#999999");
	})
	//listarCatalogo("catPerfiles", "slcRol");

	$.ajax({
	    url: dominio + "/dataLayout/srvSeguridades.php",
	    method: 'GET',
	    data: {MethodName: "listarPerfiles"},
	    success: function(resp) {
			var json = JSON.parse(resp);

			if(json.length > 0){
                $.each(json, function (i, rol) {
                    $("#slcRol").append('<option value="' + rol.idPerfil + '">' + rol.nombre + '</option>');
                })
            }
		}
	})

	construirDataTable("dtUsuarios", "Usuarios", {MethodName: "listarUsuarios"}, "Buscar...", "", columnas, dominio + "/dataLayout/srvGestionUsuarios.php", [5,10], undefined, undefined);
}

function nuevoUsuario(){
	idUsuarioActualizacion = 0;
	//$("#txtPassword").parent().parent().parent().show();
	//$("#txtPasswordRepeat").parent().parent().parent().show();
	$("#btnConfirmarResetearPassword").hide();
	$("#pnlUsuarios").slideToggle();
	$("#pnlNuevoUsuario").slideToggle();
	$("#slcRol").val("0").trigger("change");
	$("#txtUsuario").removeAttr("disabled");
}

function cancelarUsuario(){
	$("#pnlUsuarios").slideToggle();
	$("#pnlNuevoUsuario").slideToggle();

	$("#frmNuevoUsuario .form-control").val("");
	$("#frmNuevoUsuario .form-control").removeClass("error");
	$("#frmNuevoUsuario").find("label.error").remove();

	$("#txtUsuario").css("background-color","");

	idUsuarioActualizacion = 0;
}

function editarUsuario(obj){
	var row = $(obj).closest('tr');
	var dataRow = $("#dtUsuarios").DataTable().row(row).data();

	nuevoUsuario();

	idUsuarioActualizacion = dataRow.idUsuario;

	//$("#txtPassword").parent().parent().parent().hide();
	//$("#txtPasswordRepeat").parent().parent().parent().hide();
	$("#btnConfirmarResetearPassword").show();

	$("#txtApellidos").val(dataRow.apellidos);
	$("#txtNombres").val(dataRow.nombres);
	$("#txtUsuario").val(dataRow.usuario);
	$("#txtTelefono").val(dataRow.telefono);
	$("#txtEmail").val(dataRow.email);
	$("#txtUsuario").attr("disabled", "disabled");

	$("#slcRol").val(dataRow.idPerfil);
}

function guardarUsuario(){
	$("#txtPassword").val($("#txtUsuario").val());
	$("#txtPasswordRepeat").val($("#txtUsuario").val());

	var servicio = "actualizarUsuario";
	var reglas = {
		"txtApellidos": {
			required: true
		},
		"txtNombres": {
			required: true
		},
		"txtUsuario": {
			required: true
		},
		"txtTelefono": {
			required: true
		},
		"txtEmail": {
			email: true
		},
		"slcRol": {
			notEqual: '0'
		}
	}

	if($("#btnConfirmarResetearPassword").is(":hidden")){
		servicio = "insertarUsuario";
		/*var reglasAdicionales = {};
	    
	    reglasAdicionales["txtPassword"] = {
	        required: true
	    }; $.extend(reglas, reglasAdicionales);

	    reglasAdicionales["txtPasswordRepeat"] = {
	        required: true
	    }; $.extend(reglas, reglasAdicionales);*/
	}
	
	if(validarFormulario("frmNuevoUsuario", reglas))
	{
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

                var envio = {
				    "u": $("#txtUsuario").val(),
				    "n": $("#txtNombres").val(),
				    "a": $("#txtApellidos").val(),
				    "t": $("#txtTelefono").val(),
				    "e": $("#txtEmail").val(),
				    "p": $("#txtPassword").val(),
				    "r": $("#slcRol").val(),
				    "idU": idUsuarioActualizacion
				}

				$.ajax({
				    url: dominio + "/dataLayout/srvGestionUsuarios.php",
				    method: 'GET',
				    data: {MethodName: 	"verificarUsuarioRegistrado", data: '{"u": "' + envio.u + '"}'},
				    success: function(resp) {
						var json = JSON.parse(resp);

						if((json.length == 0) || (idUsuarioActualizacion != 0)){
							$.ajax({
							    url: dominio + "/dataLayout/srvGestionUsuarios.php",
							    method: 'GET',
							    data: {MethodName: servicio, data: JSON.stringify(envio)},
							    success: function(user) {
							    	construirDataTable("dtUsuarios", "Usuarios", {MethodName: "listarUsuarios"}, "Buscar...", "", columnas, dominio + "/dataLayout/srvGestionUsuarios.php", [5,10], undefined, undefined);
							    	cancelarUsuario();
							    	$.gritter.add({
										title: 'Correcto!',
										text: 'El usuario se ha registrado/actualizado exitosamente.',
										time: 5000
									});
							    },
							    error: function(request,msg,error) {
							        $.gritter.add({
										title: 'Error!',
										text: 'No se pudo insertar/actualizar el usuario.',
										time: 4000
									});
							        console.log(msg);
							    }
							})
						}
						else
						{
							$.gritter.add({
								title: 'Advertencia!',
								text: 'El usuario ' + envio.u + ' ya se encuentra registrado',
								time: 5000
							});

							$("#txtUsuario").css("background-color","#fff57c");
						}
					},
				    error: function(request,msg,error) {
				        $.gritter.add({
							title: 'Error!',
							text: 'No se pudo validar existencia de usuario.',
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

function confirmarBloqueoActivacionUsuario(obj){
	idUsuarioBloqueoActivacion = $(obj).data().id;
	estadoUsuario = $(obj).data().estado;

	$("#usuarioBloqueoActivacion").html($(obj).data().usuario);
	if(estadoUsuario == 0)
		$("#accion").html("<b>ACTIVAR</b>");
	else
		$("#accion").html("<b>BLOQUEAR</b>");
}

function bloquearUsuario(){
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
			    url: dominio + "/dataLayout/srvGestionUsuarios.php",
			    method: 'GET',
			    data: {MethodName: "bloquearActivarUsuario", data: '{"idU": "' + idUsuarioBloqueoActivacion + '", "e": "' + ((estadoUsuario == 0) ? 1 : 0) + '"}'},
			    success: function(user) {
			    	$.gritter.add({
						title: 'Correcto!',
						text: 'El usuario ha sido ' + ((estadoUsuario == 0) ? "<b>ACTIVADO</b>" : "<b>BLOQUEADO</b>") + ' exitosamente.',
						time: 5000
					});

			    	construirDataTable("dtUsuarios", "Usuarios", {MethodName: "listarUsuarios"}, "Buscar...", "", columnas, dominio + "/dataLayout/srvGestionUsuarios.php", [5,10], undefined, undefined);
					$("#mdConfirmacionBloqueoActivacion").modal('hide');
			    	idUsuarioBloqueoActivacion = 0;
			    	estadoUsuario = 0;
			    },
			    error: function(request,msg,error) {
			        $.gritter.add({
						title: 'Error!',
						text: 'No se pudo activar / desactivar al usuario.',
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

function resetearPass(){
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
			    url: dominio + "/dataLayout/srvGestionUsuarios.php",
			    method: 'GET',
			    data: {MethodName: "resetearPass", data: '{"idU": "' + idUsuarioActualizacion + '"}'},
			    success: function(user) {
			    	$.gritter.add({
						title: 'Correcto!',
						text: 'La contraseña ha sido reseteada correctamente.',
						time: 5000
					});

			    	cancelarUsuario();
					$("#mdConfirmacionReseteoPassword").modal('hide');
			    	estadoUsuario = 0;
			    },
			    error: function(request,msg,error) {
			        $.gritter.add({
						title: 'Error!',
						text: 'No se pudo resetear la contraseña del usuario.',
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