$(document).on("ready", iniciar);

var sessionTmp = null;
var idOrdenAnular = 0;
var idOrdenEliminar = 0;
var flujos = [1,2,3,4].join(',');
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
        	return "<div class='btn-group'>"
        				+ "<a class='btn btn-xs btn-success' onclick='verOrden(this)'><i class='fa fa-eye'></i></a>"
        	  	  		+ ((full.idFlujo >=3) ? "" : "<a class='btn btn-xs btn-warning' onclick='confirmarAnulacionOrden(this)' data-toggle='modal' data-target='#mdConfirmacionAnulacionOrden'><i class='fa fa-times'></i></a>")
        	  	  		+ ((full.idFlujo >=3) ? "" : "<a class='btn btn-xs btn-danger' onclick='confirmarEliminacionOrden(this)' data-toggle='modal' data-target='#mdConfirmacionEliminarOrden'><i class='fa fa-trash'></i></a>")
        	  	  + "</div>";
        }
    }
]

function iniciar(){
	sessionTmp = JSON.parse(localStorage.getItem("session"));

	addActiveMenu("Ordenes de Mantenimiento");

	$("#pnlOrdenMantenimientoInfo").hide();
	$("#pnlImprimirOrdenMantenimiento").hide();
	$("#btnImprimirOrden").hide();
	$("#btnEditarOrden").hide();
	$("#btnGuardarOrden").on("click", guardarOrden);
	$("#btnCancelarOrden").on("click", cancelarOrden);
	$("#btnNuevaOrden").on("click", nuevaOrden);
	$("#btnEditarOrden").on("click", activarEdicion);
	$("#btnAnularOrden").on("click", anularOrden);
	$("#btnEliminarOrden").on("click", anularOrden);
	$("#btnImprimirOrden").on("click", imprimirOrdenMantenimiento);

	$('#chkGarantia').bootstrapSwitch();
    $("#chkGarantia").parent().children(".switch-left").html("SI");
    $("#chkGarantia").parent().children(".switch-right").html("NO");

	$('#txtFechaEmision').datepicker({
        autoclose: true,
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        weekStart: 1,
        language: "es",
        endDate: new Date()
    }).change(function(){
    	$(this).valid();
    });

    $('#txtFechaMantenimiento').datepicker({
        autoclose: true,
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        weekStart: 1,
        language: "es"
    }).change(function(){
    	$(this).valid();
    });

    $('#txtFechaVenta').datepicker({
        autoclose: true,
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        weekStart: 1,
        language: "es",
        endDate: new Date()
    }).change(function(){
    	$(this).valid();
    });

    construirDataTable("dtOrdenesMantenimiento", "Ordenes de Mantenimiento", {MethodName: "listarOrdenesMantenimiento", data: '{"fl": "' + flujos + '"}'}, "Buscar...", "", columnas, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
}

function nuevaOrden(){
	$("#pnlOrdenMantenimientoInfo .form-control").removeAttr("disabled");
	$("#btnEditarOrden").hide();
	$("#btnImprimirOrden").hide();
	$("#btnGuardarOrden").show();
	$("#btnCancelarOrden").show();
	$("#orden").closest(".widget-header-toolbar").hide();
	$("#orden").html("");
	$("#estado").html("");
	$("#chkGarantia").bootstrapSwitch('setState', false);
	$("#pnlOrdenMantenimientoInfo").slideToggle();
	$("#pnlOrdenesMantenimiento").slideToggle();
	idOrdenAnular = 0;
	idOrdenEliminar = 0;
}

function verOrden(obj){
	var row = $(obj).closest('tr');
	var dataRow = $("#dtOrdenesMantenimiento").DataTable().row(row).data();

	nuevaOrden();

	$("#orden").closest(".widget-header-toolbar").show();
	$("#orden").html(dataRow.idOrdenMantenimiento);
	$("#estado").html(dataRow.estadoDetalle);
	if(dataRow.idFlujo < 3)
		$("#btnEditarOrden").show();
	$("#btnGuardarOrden").hide();
	$("#btnImprimirOrden").show();
	$("#btnCancelarOrden").show();
	$("#pnlOrdenMantenimientoInfo .form-control").attr("disabled", "disabled");
	$("#txtCliente").val(dataRow.cliente);
	$("#txtTelefono").val(dataRow.telefono);
	$("#txtDireccion").val(dataRow.direccion);
	$("#txtFechaEmision").datepicker('setDate', formatDate(dataRow.fechaEmision, "-", "/"));
	$("#txtSeccion").val(dataRow.seccion);
	$("#txtFechaMantenimiento").datepicker('setDate', formatDate(dataRow.fechaHoraMantenimiento, "-", "/"));
	$("#txtProducto").val(dataRow.producto);
	$("#txtFechaVenta").datepicker('setDate', formatDate(dataRow.fechaVenta, "-", "/"));
	$("#txtTecnicoUltimoMantenimiento").val(dataRow.tecnicoUltimoMantenimiento);
	$("#txtTecnicoReporta").val(dataRow.tecnicoQuienReporta);
	$("#txtDescripcion").val(dataRow.descripcionMantenimiento);
	$("#txtCiudad").val(dataRow.ciudad);
	if(dataRow.garantia == 1)
		$("#chkGarantia").bootstrapSwitch('setState', true);
}

function confirmarAnulacionOrden(obj){
	var row = $(obj).closest('tr');
	var dataRow = $("#dtOrdenesMantenimiento").DataTable().row(row).data();

	idOrdenAnular = dataRow.idOrdenMantenimiento;
	idOrdenEliminar = 0;
	$("#ordenAnular").html(dataRow.idOrdenMantenimiento);
}

function confirmarEliminacionOrden(obj){
	var row = $(obj).closest('tr');
	var dataRow = $("#dtOrdenesMantenimiento").DataTable().row(row).data();

	idOrdenEliminar = dataRow.idOrdenMantenimiento;
	idOrdenAnular = 0;
	$("#ordenEliminar").html(dataRow.idOrdenMantenimiento);
}

function activarEdicion(){
	$("#btnEditarOrden").hide();
	$("#btnGuardarOrden").show();
	$("#btnImprimirOrden").hide();

	$("#pnlOrdenMantenimientoInfo .form-control").removeAttr("disabled");
}

function guardarOrden(){
	var reglas = {
		"txtCliente": {
			required: true
		},
		"txtTelefono": {
			required: true
		},
		"txtDireccion": {
			required: true
		},
		"txtFechaEmision": {
			required: true
		}/*,
		"txtSeccion": {
			required: true
		}*/,
		"txtFechaMantenimiento": {
			required: true
		},
		"txtProducto": {
			required: true
		},
		"txtFechaVenta": {
			required: true
		}/*,
		"txtTecnicoUltimoMantenimiento": {
			required: true
		},
		"txtTecnicoReporta": {
			required: true
		}*/,
		"txtDescripcion": {
			required: true
		}/*,
		"txtObservaciones": {
			required: true
		}*/
	}

	if(validarFormulario("frmOrdenMantenimiento", reglas))
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

		        var idFlujo = 1;
				var servicio = "insertarOrdenMantenimiento";
				var session = JSON.parse(localStorage.getItem("session"));

				var envio = {
					"f": idFlujo,
					"c": $("#txtCliente").val(),
					"t": $("#txtTelefono").val(),
					"d": $("#txtDireccion").val(),
					"fe": formatDate($("#txtFechaEmision").val(), "/", "-"),
					"s": $("#txtSeccion").val(),
					"fm": formatDate($("#txtFechaMantenimiento").val(), "/", "-"),
					"p": $("#txtProducto").val(),
					"fv": formatDate($("#txtFechaVenta").val(), "/", "-"),
					"tm": $("#txtTecnicoUltimoMantenimiento").val(),
					"tr": $("#txtTecnicoReporta").val(),
					"dsc": $("#txtDescripcion").val(),
					"g" : (($("#chkGarantia").bootstrapSwitch('state')) ? 1 : 0),
					"o": "",//$("#txtObservaciones").val(),
					"ciu": $("#txtCiudad").val(),
					"u": session._datosUsuario.usuario,
					"idO": (($("#orden").html() == "") ? 0 : $("#orden").html())
				}

				servicio = (($("#orden").html() == "") ? servicio : "actualizarOrdenMantenimiento")

				$.ajax({
				    url: dominio + "/dataLayout/srvOrdenesMantenimiento.php",
				    method: 'GET',
				    data: {MethodName: servicio, data: JSON.stringify(envio)},
				    success: function(resp) {
				    	construirDataTable("dtOrdenesMantenimiento", "Ordenes de Mantenimiento", {MethodName: "listarOrdenesMantenimiento", data: '{"fl": "' + flujos + '"}'}, "Buscar...", "", columnas, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
				    	cancelarOrden();
				    	$.gritter.add({
							title: 'Correcto!',
							text: 'La Orden de Mantenimiento se ha registrado/actualizado exitosamente.',
							time: 5000
						});
				    },
				    error: function(request,msg,error) {
				        $.gritter.add({
							title: 'Error!',
							text: 'No se pudo insertar/actualizar la Orden de Mantenimiento.',
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

function cancelarOrden(){
	$('#txtFechaEmision').datepicker('setDate', null);
	$('#txtFechaMantenimiento').datepicker('setDate', null);
	$('#txtFechaVenta').datepicker('setDate', null);
	$("#pnlOrdenMantenimientoInfo .form-control").val("");

	$("#pnlOrdenMantenimientoInfo").slideToggle();
	$("#pnlOrdenesMantenimiento").slideToggle();
	$('#pnlImprimirOrdenMantenimiento').slideUp('fast');
	$("#editorOrden").summernote().code("");

	idOrdenAnular = 0;
	idOrdenEliminar = 0;
}

function anularOrden(){
	var servicio = "anularOrdenMantenimiento";
	var idOrden = idOrdenAnular;

	if(idOrdenEliminar != 0){
		servicio = "eliminarOrdenMantenimiento";
		idOrden = idOrdenEliminar;
	}

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
			    data: {MethodName: servicio, data: '{"idOM": "' + idOrden + '", "u": "' + sessionTmp._datosUsuario.usuario + '"}'},
			    success: function(user) {
			    	construirDataTable("dtOrdenesMantenimiento", "Ordenes de Mantenimiento", {MethodName: "listarOrdenesMantenimiento", data: '{"fl": "' + flujos + '"}'}, "Buscar...", "", columnas, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
			    	$.gritter.add({
						title: 'Correcto!',
						text: 'La Orden de Mantenimiento se ha procesado exitosamente.',
						time: 5000
					});

					$("#mdConfirmacionAnulacionOrden").modal('hide');
					$("#mdConfirmacionEliminarOrden").modal('hide');
			    },
			    error: function(request,msg,error) {
			        $.gritter.add({
						title: 'Error!',
						text: 'No se pudo procesar la Orden de Mantenimiento.',
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

function imprimirOrdenMantenimiento(){
	$("#editorOrden").summernote().code("");

	jQuery.get(dominio + '/plantillas/plantillaOrdenMantenimiento.html?' + Math.random(), function (reporte) {
		$('#pnlImprimirOrdenMantenimiento').slideDown('fast');

		reporte = reporte.replace("#orden",$("#orden").html());
		reporte = reporte.replace("#cliente",$("#txtCliente").val());
		reporte = reporte.replace("#direccion",$("#txtDireccion").val());
		reporte = reporte.replace("#telefono",$("#txtTelefono").val());
		reporte = reporte.replace("#fechaemision",$("#txtFechaEmision").val());
		reporte = reporte.replace("#producto",$("#txtProducto").val());
		reporte = reporte.replace("#fechaventa",$("#txtFechaVenta").val());
		reporte = reporte.replace("#tecnicoultimo",$("#txtTecnicoUltimoMantenimiento").val());
		reporte = reporte.replace("#tecnicoreporta",$("#txtTecnicoReporta").val());
		reporte = reporte.replace("#descripcion",$("#txtDescripcion").val());
		reporte = reporte.replace("#observaciones","");

        $("#editorOrden").summernote().code(reporte);
        btnEditorImprimir("editorOrden");

        $('html,body').animate({
	        scrollTop: $("#pnlImprimirOrdenMantenimiento").offset().top
	    }, 2000);
    })
}