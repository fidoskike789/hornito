$(document).on("ready", iniciar);

document.addEventListener("deviceready", function(){
	$("#btnScan").on("click", escanear);
})

var sessionTmp = null;
var idOrdenIniciar = 0;
var flujos = [2,3,4].join(',');

var columnas = [
	    {
	    	"mData": "idOrdenMantenimiento",
	        "title": "N°"
	    }, {
	        "mData": "fechaRegistro",
	        "title": "Fecha Registro",
        	"sClass": "desktop"
	    }, {
	        "mData": "cliente",
	        "title": "Cliente"
	    }, {
	        "mData": "fechaEmision",
	        "title": "Fecha Emisión"
	    }, {
	        "mData": "producto",
	        "title": "Producto"
	    }, {
	        "mData": "estadoDetalle",
	        "title": "Estado",
	        "mRender": function (data, type, full) {
	        	return '<div class="label label-' + obtenerEtiqueta(full.estadoDetalle) + '">' + full.estadoDetalle + '</div>';
	        }
	    }, {
	        "bSortable": false,
	        "width": "80px",
	        "mRender": function (data, type, full) {
	        	if(full.idFlujo < 3)
		        	return "<div class='btn-group'>"
		        				+ "<a class='btn btn-xs btn-success' data-accion='1' onclick='verificarInicioOrden(this)' data-toggle='modal' data-target='#mdConfirmacionInicioOrden'><i class='fa fa-cogs'></i></a>"
		        	  	  + "</div>";
		       	else if(full.idFlujo == 3)
		        	return "<div class='btn-group'>"
		        				+ "<a class='btn btn-xs btn-info' data-accion='2' onclick='verificarInicioOrden(this)' data-toggle='modal' data-target='#mdConfirmacionInicioOrden'><i class='fa fa-eye'></i></a>"
		        	  	  + "</div>";
				else
		       		return "<div class='btn-group'>"
		        				+ "<a class='btn btn-xs btn-info' data-accion='2' onclick='verificarInicioOrden(this)' data-toggle='modal' data-target='#mdConfirmacionInicioOrden'><i class='fa fa-eye'></i></a>"
		        				+ "<a class='btn btn-xs btn-warning' onclick='ingresarObservaciones(this)' data-toggle='modal' data-target='#mdIngresarObservaciones'><i class='fa fa-edit'></i></a>"
		        	  	  + "</div>";

	        }
	    }
	]

function iniciar(){
	sessionTmp = JSON.parse(localStorage.getItem("session"));
	addActiveMenu("Mantenimientos");

	$("#btnIniciarOrden").on("click", iniciarMantenimiento);
	$("#btnIniciarMantenimiento").on("click", grabar);
	$("#btnGrabarObservaciones").on("click", guardarObservaciones);
	$("#txtCodigo").attr("readonly","readonly");

	construirDataTable("dtOrdenesMantenimiento", "Ordenes de Mantenimiento", {MethodName: "listarOrdenesMantenimientoTecnico", data: '{"fl": "' + flujos + '", "u": "' + sessionTmp._datosUsuario.idUsuario + '"}'}, "Buscar...", "", columnas, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
}

function verificarInicioOrden(obj){
	var row = $(obj).closest('tr');
	var dataRow = $("#dtOrdenesMantenimiento").DataTable().row(row).data();

	idOrdenIniciar = dataRow.idOrdenMantenimiento;

	$("#lblCliente").html(dataRow.cliente);
	$("#lblTelefono").html(dataRow.telefono);
	$("#lblProducto").html(dataRow.producto);
	$("#lblFechaEmision").html(dataRow.fechaEmision);
	$("#lblFechaHoraMantenimiento").html(dataRow.fechaHoraMantenimiento);
	$("#lblTecnicoReporta").html(dataRow.tecnicoQuienReporta);
	$("#lblDireccion").html(dataRow.direccion);
	$("#lblDescripcion").html(dataRow.descripcionMantenimiento);
	$("#lblGarantia").html(((dataRow.garantia == 1) ? "SI" : "NO"));

	if($(obj).data().accion == 1)
		$("#btnIniciarOrden").show();

	if($(obj).data().accion == 2)
		$("#btnIniciarOrden").hide();
}

function iniciarMantenimiento(){
	$("#mdConfirmacionInicioOrden").modal('hide');
	$("#mdEscaneoCodigo").modal('show');
	$("#txtCodigo").val("");
}

function escanear(){
	$("#txtCodigo").val("");
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			/*alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);*/

			if(!result.cancelled){
		       if(result.format == "CODE_128"){
		            var value = result.text;
		            $("#txtCodigo").val(value);
		       }else{
		        	$.gritter.add({
						title: 'No autorizado!',
						text: 'Solo códigos de barra permitidos.',
						time: 4000
					});
		       }
			}else{
			  	$.gritter.add({
					title: 'Cancelado!',
					text: 'Se ha cancelado el proceso de lectura.',
					time: 5000
				});
			}
		},
		function (error) {
			$.gritter.add({
				title: 'Error!',
				text: 'Error en la cámara. Por favor intente de nuevo.',
				time: 4000
			});
		},
		{
			preferFrontCamera : false, // iOS y Android
			showFlipCameraButton : true, // iOS y Android
			showTorchButton : true, // iOS y Android
			torchOn: false, // Android, lanza la linterna encendida (si estA disponible)
			prompt : "", // Android
			resultDisplayDuration: 2, // Android, muestra el texto escaneado.
			//formats : "CODE_128", // default: todos, excepto PDF_417 y RSS_EXPANDED
			orientation : "landscape", // Solo Android (portrait|landscape), por defecto no seteado. Los dos modos disponibles
			disableAnimations : true, // iOS
			disableSuccessBeep: false // iOS
		}
	);
}

function grabar(){
	var reglas = {
        "txtCodigo": {
            required: true
        }
    }

    if(validarFormulario("frmCodigoEscaneo", reglas))
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

		        $.ajax({
				    url: dominio + "/dataLayout/srvOrdenesMantenimiento.php",
				    method: 'GET',
				    data: {MethodName: "iniciarMantenimiento", data: '{"idOM": "' + idOrdenIniciar + '", "c": "' + $("#txtCodigo").val() + '", "u": "' + sessionTmp._datosUsuario.usuario + '", "idU": "' + sessionTmp._datosUsuario.idUsuario + '"}'},
				    success: function(res) {
				    	if(res == 1)
				    	{
					    	construirDataTable("dtOrdenesMantenimiento", "Ordenes de Mantenimiento", {MethodName: "listarOrdenesMantenimientoTecnico", data: '{"fl": "' + flujos + '", "u": "' + sessionTmp._datosUsuario.idUsuario + '"}'}, "Buscar...", "", columnas, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
					    	$.gritter.add({
								title: 'Correcto!',
								text: 'La Orden de Mantenimiento se ha iniciado exitosamente.',
								time: 5000
							});

							idOrdenIniciar = 0;
							$("#mdEscaneoCodigo").modal('hide');
						}
						else
						{
							$.gritter.add({
								title: 'ALERTA!',
								text: 'El código utilizado no es válido. Por favor ingrese un código válido.',
								time: 8000
							});
						}
				    },
				    error: function(request,msg,error) {
				        $.gritter.add({
							title: 'Error!',
							text: 'No se pudo iniciar la Orden de Mantenimiento.',
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

function ingresarObservaciones(obj){
	var row = $(obj).closest('tr');
	var dataRow = $("#dtOrdenesMantenimiento").DataTable().row(row).data();

	idOrdenIniciar = dataRow.idOrdenMantenimiento;
}

function guardarObservaciones(){
	var reglas = {
        "txtObservaciones": {
            required: true
        },
        "txtCosto": {
        	required: true,
            number: true
        }
    }

    if(validarFormulario("frmObservaciones", reglas))
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

		        $.ajax({
				    url: dominio + "/dataLayout/srvOrdenesMantenimiento.php",
				    method: 'GET',
				    data: {MethodName: "guardarObservaciones", data: '{"idOM": "' + idOrdenIniciar + '", "o": "' + $("#txtObservaciones").val() + '", "u": "' + sessionTmp._datosUsuario.usuario + '", "c": "' + $("#txtCosto").val() + '"}'},
				    success: function(user) {
				    	construirDataTable("dtOrdenesMantenimiento", "Ordenes de Mantenimiento", {MethodName: "listarOrdenesMantenimientoTecnico", data: '{"fl": "' + flujos + '", "u": "' + sessionTmp._datosUsuario.idUsuario + '"}'}, "Buscar...", "", columnas, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
				    	$.gritter.add({
							title: 'Correcto!',
							text: 'Las observaciones y costo de mantenimiento han sido registrados correctamente.',
							time: 5000
						});

						idOrdenIniciar = 0;
						$("#mdIngresarObservaciones").modal('hide');
						$("#txtObservaciones").val("");
						$("#txtCosto").val("");
				    },
				    error: function(request,msg,error) {
				        $.gritter.add({
							title: 'Error!',
							text: 'No se pudo guardar las Observaciones ni costo de mantenimiento.',
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