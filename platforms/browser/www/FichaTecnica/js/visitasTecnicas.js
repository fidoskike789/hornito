$(document).on("ready", iniciar);

var cameraOptions = null;
var foto = null;

document.addEventListener("deviceready", function(){
    cameraOptions = {
        quality: 20,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        correctOrientation: true,
        mediaType: Camera.MediaType.PICTURE
    }
}, false)

var sessionTmp = null;
var flujos = [3].join(',');
var idOrdenMantenimientoSeleccionada = 0;
var cb = "";
var idVisitaTecnicaSeleccionada = 0;
var idInconvenienteEditar = 0;
var idInconvenienteEliminar = 0;

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
        "mRender": function (data, type, full) {
        	return "<div class='btn-group'>"
        				+ "<a class='btn btn-xs btn-success' onclick='visitaTecnica(this)'><i class='fa fa-cogs'></i></a>" 
        	  	  + "</div>";
        }
    }
]

var columnasInconvenientes = [
    {
        "mData": "inconveniente",
        "title": "Inconveniente"
    }, {
        "mData": "trabajos",
        "title": "Trabajos"
    }, {
        "mData": "novedades",
        "title": "Novedades"
    }, {
        "mData": "fechaRegistro",
        "title": "Fecha Registro"
    }, {
        "bSortable": false,
        "mRender": function (data, type, full) {
            return "<div class='btn-group'>"
                        + "<a class='btn btn-xs btn-warning' onclick='editarInconveniente(this)'><i class='fa fa-edit'></i></a>"
                        + "<a class='btn btn-xs btn-danger' onclick='idInconvenienteEliminar = "+ full.idInconveniente +"' data-toggle='modal' data-target='#mdConfirmacionEliminarInconveniente'><i class='fa fa-trash'></i></a>"
                  + "</div>";
        }
    }
]

var columnasHistorico = [
    {
        "mData": "fecha",
        "title": "Fecha"
    }, {
        "mData": "idOrden",
        "title": "Orden",
        "sClass": "none"
    }, {
        "mData": "tecnico",
        "title": "Técnico",
        "sClass": "none"
    }, {
        "mData": "trabajos",
        "title": "Trabajos Realizados"
    }
]

function iniciar(){
    sessionTmp = JSON.parse(localStorage.getItem("session"));

	addActiveMenu("Visitas Técnicas");

    $("#pnlVisitaTecnica").hide();
    $("#btnCancelarVisita").on("click", cancelarVisita);
    $("#btnNuevoInconveniente").on("click", nuevoInconveniente);
    $("#btnCancelarInconveniente").on("click", cancelarInconveniente);
    $("#btnGrabarInformacionVT").on("click", grabarInfoVisitaTecnica);
    $("#btnGrabarInconveniente").on("click", grabarInconveniente);
    $("#btnConfirmarEliminarInconveniente").on("click", eliminarInconveniente);
    $("#btnConfirmarFinalizarMantenimiento").on("click", finalizarMantenimiento);
    $("#btnHistorialMantenimientos").on("click", consultarHistorialMantenimientos);
    $("#btnFinalizarMantenimiento").on("click", function(){
        $("#ordenFinalizar").html($("#lblOrden").html());
        navigator.camera.getPicture(onSuccessCamera, onFailCamera, cameraOptions);
    })

    $(".add-more-trabajos").on("click", trabajo);
    $(".add-more-novedades").on("click", novedad);

    $('#chkEstadoCodigo').bootstrapSwitch();
    $("#chkEstadoCodigo").parent().children(".switch-left").html("SI");
    $("#chkEstadoCodigo").parent().children(".switch-right").html("NO");

    construirDataTable("dtOrdenesMantenimiento", "Ordenes de Mantenimiento", {MethodName: "listarOrdenesMantenimiento", data: '{"fl": "' + flujos + '"}'}, "Buscar...", "", columnas, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
    construirDataTable("dtInconvenientes", "Inconvenientes", "", "Buscar...", "", columnasInconvenientes, "", [5,10], undefined, undefined);
}

function nuevoInconveniente(){
    idInconvenienteEditar = 0;
    var nuevoTrabajo = '<tr>'
                        + '<td>'
                            + '<div class="form-group">'
                                + '<div class="input-group">'
                                    + '<input type="text" class="form-control" id="txtTrabajo1" name="txtTrabajo1" placeholder="Trabajo Realizado"/>'
                                    + '<span class="input-group-btn">'
                                        + '<button id="btnTrabajo1" class="btn btn-success add-more-trabajos" type="button">+</button>'
                                    + '</span>'
                                + '</div>'
                            + '</div>'
                        + '</td>'
                    + '</tr>';

    $("#tblTrabajos").append(nuevoTrabajo);
    $("#btnTrabajo1").on("click", trabajo);

    var nuevoNovedad = '<tr>'
                        + '<td>'
                            + '<div class="form-group">'
                                + '<div class="input-group">'
                                    + '<input type="text" class="form-control" id="txtNovedad1" name="txtNovedad1" placeholder="Novedad"/>'
                                    + '<span class="input-group-btn">'
                                        + '<button id="btnNovedad1" class="btn btn-success add-more-novedades" type="button">+</button>'
                                    + '</span>'
                                + '</div>'
                            + '</div>'
                        + '</td>'
                    + '</tr>';

    $("#txtDescripcionInconveniente").val("");
    $("#tblNovedades").append(nuevoNovedad);
    $("#btnNovedad1").on("click", novedad);
    $("#chkEstadoCodigo").bootstrapSwitch('setState', false);

    $("#pnlInconvenientes").slideUp();
    $("#pnlNuevoInconveniente").slideDown();
    $(".pnlPrincipal").css("color", "#bdbdbd");
    $("#btnFinalizarMantenimiento").hide();
    $("#btnCancelarVisita").hide();
}

function editarInconveniente(obj){
    var row = $(obj).closest('tr');
    var dataRow = $("#dtInconvenientes").DataTable().row(row).data();
    idInconvenienteEditar = dataRow.idInconveniente;
    idInconvenienteEliminar = 0;

    $("#pnlInconvenientes").slideUp();
    $("#pnlNuevoInconveniente").slideDown();
    $(".pnlPrincipal").css("color", "#bdbdbd");
    $("#btnFinalizarMantenimiento").hide();
    $("#btnCancelarVisita").hide();

    $("#txtDescripcionInconveniente").val(dataRow.inconveniente);

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
                data: {MethodName: "buscarTrabajosNovedades", data: '{"idI": "' + dataRow.idInconveniente + '"}'},
                success: function(resp) {
                    var trabajosNovedades = JSON.parse(resp);

                    console.log(trabajosNovedades);

                    $("#tblTrabajos").html("");
                    $("#tblNovedades").html("");

                    $.each(trabajosNovedades, function( i, el) {
                        var nuevoTrabajoNovedad = '<tr>'
                                                    + '<td>'
                                                        + '<div class="form-group">'
                                                            + '<div class="input-group">'
                                                                + '<input type="text" class="form-control" data-idtn="' + el.idTrabajosNovedades + '" id="txt' + ((el.idTipoActividad == 1) ? "Trabajo" : "Novedad") + (i + 1) + '" name="txt' + ((el.idTipoActividad == 1) ? "Trabajo" : "Novedad") + (i + 1) + '" placeholder="' + ((el.idTipoActividad == 1) ? "Trabajo Realizado" : "Novedad") + '"/>'
                                                                + '<span class="input-group-btn">'
                                                                    + '<button id="btn' + ((el.idTipoActividad == 1) ? "Trabajo" : "Novedad") + (i + 1) + '" class="btn btn-danger" type="button">&nbsp;-</button>'
                                                                + '</span>'
                                                            + '</div>'
                                                        + '</div>'
                                                    + '</td>'
                                                + '</tr>';

                        if (el.idTipoActividad == 1){
                            $("#tblTrabajos").append(nuevoTrabajoNovedad);
                            $("#btnTrabajo" + (i + 1)).on("click", trabajo);
                            $("#txtTrabajo" + (i + 1)).val(el.descripcion);
                        }

                        if (el.idTipoActividad == 2){
                            $("#tblNovedades").append(nuevoTrabajoNovedad);
                            $("#btnNovedad" + (i + 1)).on("click", novedad);
                            $("#txtNovedad" + (i + 1)).val(el.descripcion);
                        }
                    });

                    var lstTrabajos = $("#tblTrabajos tr td").children().children().find("input");
                    var lstNovedades = $("#tblNovedades tr td").children().children().find("input");

                    if(lstTrabajos.length == 0){
                        var nuevoTrabajo = '<tr>'
                                            + '<td>'
                                                + '<div class="form-group">'
                                                    + '<div class="input-group">'
                                                        + '<input type="text" class="form-control" id="txtTrabajo1" name="txtTrabajo1" placeholder="Trabajo Realizado"/>'
                                                        + '<span class="input-group-btn">'
                                                            + '<button id="btnTrabajo1" class="btn btn-success add-more-trabajos" type="button">+</button>'
                                                        + '</span>'
                                                    + '</div>'
                                                + '</div>'
                                            + '</td>'
                                        + '</tr>';

                        $("#tblTrabajos").append(nuevoTrabajo);
                        $("#btnTrabajo1").on("click", trabajo);
                    }

                    if(lstNovedades.length == 0){
                        var nuevoNovedad = '<tr>'
                                            + '<td>'
                                                + '<div class="form-group">'
                                                    + '<div class="input-group">'
                                                        + '<input type="text" class="form-control" id="txtNovedad1" name="txtNovedad1" placeholder="Novedad"/>'
                                                        + '<span class="input-group-btn">'
                                                            + '<button id="btnNovedad1" class="btn btn-success add-more-novedades" type="button">+</button>'
                                                        + '</span>'
                                                    + '</div>'
                                                + '</div>'
                                            + '</td>'
                                        + '</tr>';

                        $("#tblNovedades").append(nuevoNovedad);
                        $("#btnNovedad1").on("click", novedad);
                    }

                    $("#tblTrabajos tr td").children().children().find("button").last().removeClass("btn-danger").addClass("btn-success").addClass("add-more-trabajos").html("+");
                    $("#tblNovedades tr td").children().children().find("button").last().removeClass("btn-danger").addClass("btn-success").addClass("add-more-novedades").html("+");

                    $("#contadorTrabajos").val($("#tblTrabajos tr td").children().children().find("button").length);
                    $("#contadorNovedades").val($("#tblNovedades tr td").children().children().find("button").length);
                },
                error: function(request,msg,error) {
                    $.gritter.add({
                        title: 'Error!',
                        text: 'No se pudo recuperar la lista de Trabajos y Novedades.',
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

function cancelarInconveniente(){
    $(".pnlPrincipal").css("color", "");
    $("#pnlNuevoInconveniente").slideUp();
    $("#pnlInconvenientes").slideDown();
    $("#btnFinalizarMantenimiento").show();
    $("#btnCancelarVisita").show();
}

function visitaTecnica(obj){
    var row = $(obj).closest('tr');
    var dataRow = $("#dtOrdenesMantenimiento").DataTable().row(row).data();
    idOrdenMantenimientoSeleccionada = dataRow.idOrdenMantenimiento;
    cb = dataRow.codigoBarras;

    idVisitaTecnicaSeleccionada = 0;
    idInconvenienteEditar = 0;
    idInconvenienteEliminar = 0;

    foto = null;

    $("#lblOrden").html(dataRow.idOrdenMantenimiento);
    $("#lblCliente").html(dataRow.cliente);
    $("#lblProducto").html(dataRow.producto);
    $("#lblFechaVenta").html(dataRow.fechaVenta);
    $("#btnConfirmarFinalizarMantenimiento").removeAttr("disabled");
    $("#btnConfirmarFinalizarMantenimiento").html(" SI");
    $("#chkEstadoCodigo").bootstrapSwitch('setState', false);
    document.getElementById('imgFoto').src = "";

    $.ajax({
        url: dominio + "/dataLayout/srvOrdenesMantenimiento.php",
        method: 'GET',
        data: {MethodName: "buscarVisitaTecnica", data: '{"idOM": "' + idOrdenMantenimientoSeleccionada + '"}'},
        success: function(resp) {
            var visitaTecnica = JSON.parse(resp);

            if(visitaTecnica.length > 0){
                idVisitaTecnicaSeleccionada = visitaTecnica[0].idVisitaTecnica;
                $("#txtMaquina").val(visitaTecnica[0].maquina);
                $("#txtSerie").val(visitaTecnica[0].serie);
                $("#txtModelo").val(visitaTecnica[0].modelo);
                //$("#txtCosto").val(visitaTecnica[0].costoMantenimiento);
                
                if(visitaTecnica[0].estadocodigo == 1)
                    $("#chkEstadoCodigo").bootstrapSwitch('setState', true);

                $("#pnlInconvenientes").slideDown();
                construirDataTable("dtInconvenientes", "Inconvenientes", {MethodName: "buscarInconvenientes", data: '{"idVT": "' + idVisitaTecnicaSeleccionada + '"}'}, "Buscar...", "", columnasInconvenientes, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
            }
            else
                $("#pnlInconvenientes").slideUp();   

            $("#pnlOrdenesMantenimiento").slideUp();
            $("#pnlNuevoInconveniente").slideUp();
            $("#pnlVisitaTecnica").slideDown();
        },
        error: function(request,msg,error) {
            $.gritter.add({
                title: 'Error!',
                text: 'Error durante la consulta de la Visita Técnica.',
                time: 4000
            });
            console.log(msg);
        }
    })
}

function grabarInfoVisitaTecnica(){
    var reglas = {
        "txtMaquina": {
            required: true
        }
    }

    if(validarFormulario("frmCostoMantenimiento", reglas))
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

                var servicio = "insertarVisitaTecnica";

                if (idVisitaTecnicaSeleccionada != 0)
                    servicio = "actualizarVisitaTecnica";

                var envio = {
                    "idOM" : idOrdenMantenimientoSeleccionada,
                    "m" : $("#txtMaquina").val(),
                    "s" : $("#txtSerie").val(),
                    "md" : $("#txtModelo").val(),
                    "ec" : (($("#chkEstadoCodigo").bootstrapSwitch('state')) ? 1 : 0),
                    "u" : sessionTmp._datosUsuario.usuario
                }

                $.ajax({
                    url: dominio + "/dataLayout/srvOrdenesMantenimiento.php",
                    method: 'GET',
                    data: {MethodName: servicio, data: JSON.stringify(envio)},
                    success: function(resp) {
                        var visitaTecnica = null;
                        //var visitaTecnica = JSON.parse(resp);
                        if(resp != ""){
                            visitaTecnica = JSON.parse(resp);
                            if(visitaTecnica.length > 0){
                                idVisitaTecnicaSeleccionada = visitaTecnica;
                                $("#pnlInconvenientes").slideDown();
                            }
                            else
                                $("#pnlInconvenientes").slideUp();   
                        }

                         $.gritter.add({
                            title: 'Correcto!',
                            text: 'La información se ha guardado correctamente.',
                            time: 4000
                        });
                    },
                    error: function(request,msg,error) {
                        $.gritter.add({
                            title: 'Error!',
                            text: 'No se pudo grabar / actualizar la información de  Visita Técnica.',
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

function grabarInconveniente(){
    var reglas = {
        "txtDescripcionInconveniente": {
            required: true
        }
    }

    if(validarFormulario("frmNuevoInconveniente", reglas))
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

                var servicio = "insertarInconveniente"
                var lstTrabajos = $("#tblTrabajos tr td").children().children().find("input");
                var lstNovedades = $("#tblNovedades tr td").children().children().find("input");
                var trabajosnovedades = [];

                if(idInconvenienteEditar != 0)
                    servicio = "actualizarInconveniente";

                $.each(lstTrabajos, function( i, el) {
                    if($(el).val() != ""){
                        var trabajo = {
                            "idTN": (($(el).data().idtn != undefined) ? $(el).data().idtn : 0), //idTrabajoNovedad
                            "idA": 1, //trabajos
                            "d": $(el).val()
                        }

                        trabajosnovedades.push(trabajo);
                    }
                });

                $.each(lstNovedades, function( i, el) {
                    if($(el).val() != ""){
                        var novedad = {
                            "idTN": (($(el).data().idtn != undefined) ? $(el).data().idtn : 0), //idTrabajoNovedad
                            "idA": 2, //novedades
                            "d": $(el).val()
                        }

                        trabajosnovedades.push(novedad);
                    }
                });

                var inconvenienteInfo = {
                    "idI": idInconvenienteEditar, //idInconveniente
                    "idVT": idVisitaTecnicaSeleccionada,
                    "i": $("#txtDescripcionInconveniente").val(),
                    "u": sessionTmp._datosUsuario.usuario,
                    "idOM": idOrdenMantenimientoSeleccionada,
                    "trabajosnovedades": trabajosnovedades
                }

                $.ajax({
                    url: dominio + "/dataLayout/srvOrdenesMantenimiento.php",
                    method: 'GET',
                    data: {MethodName: servicio, data: JSON.stringify(inconvenienteInfo)},
                    success: function(resp) {
                        $.gritter.add({
                            title: 'Correcto!',
                            text: 'El inconveniente, trabajos y novedades han sido registradas / actualizadas.',
                            time: 5000
                        });

                        $("#btnCancelarInconveniente").click();
                        construirDataTable("dtInconvenientes", "Inconvenientes", {MethodName: "buscarInconvenientes", data: '{"idVT": "' + idVisitaTecnicaSeleccionada + '"}'}, "Buscar...", "", columnasInconvenientes, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
                    },
                    error: function(request,msg,error) {
                        $.gritter.add({
                            title: 'Error!',
                            text: 'Existieron problemas al registrar / actualizar el inconveniente.',
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

function eliminarInconveniente(){
    idInconvenienteEditar = 0;

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
                data: {MethodName: "eliminarInconveniente", data: '{"idI": "' + idInconvenienteEliminar + '", "idOM": "' + idOrdenMantenimientoSeleccionada + '", "u": "' + sessionTmp._datosUsuario.usuario + '"}'},
                success: function(resp) {
                    idInconvenienteEliminar = 0;
                    $("#mdConfirmacionEliminarInconveniente").modal("hide");

                    construirDataTable("dtInconvenientes", "Inconvenientes", {MethodName: "buscarInconvenientes", data: '{"idVT": "' + idVisitaTecnicaSeleccionada + '"}'}, "Buscar...", "", columnasInconvenientes, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);

                    $.gritter.add({
                        title: 'Correcto!',
                        text: 'El inconveniente seleccionado ha sido eliminado correctamente.',
                        time: 5000
                    });
                },
                error: function(request,msg,error) {
                    $.gritter.add({
                        title: 'Error!',
                        text: 'No se pudo eliminar el inconveniente.',
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

function cancelarVisita(){
    $("#pnlVisitaTecnica").slideUp();   
    $("#pnlInconvenientes").slideUp();
    $("#pnlOrdenesMantenimiento").slideDown();
    $("#pnlNuevoInconveniente").slideDown();
}

function trabajo(){
    if($(this).hasClass("add-more-trabajos")){
        var contador = parseInt($("#contadorTrabajos").val());
        $(this).removeClass("add-more-trabajos");
        $(this).removeClass("btn-success");
        $(this).addClass("btn-danger");
        $(this).html("-&nbsp;");

        var nuevoTrabajo = '<tr>'
                            + '<td>'
                                + '<div class="form-group">'
                                    + '<div class="input-group">'
                                        + '<input type="text" class="form-control" id="txtTrabajo' + (contador + 1) + '" name="txtTrabajo' + (contador + 1) + '" placeholder="Trabajo Realizado"/>'
                                        + '<span class="input-group-btn">'
                                            + '<button id="btnTrabajo' + (contador + 1) + '" class="btn btn-success add-more-trabajos" type="button">+</button>'
                                        + '</span>'
                                    + '</div>'
                                + '</div>'
                            + '</td>'
                        + '</tr>';

        $("#tblTrabajos").append(nuevoTrabajo);
        $(".add-more-trabajos").on("click", trabajo);
        $("#contadorTrabajos").val(contador + 1);
    }
    else
        $(this).closest("tr").remove();
}

function novedad(){
    if($(this).hasClass("add-more-novedades")){
        var contador = parseInt($("#contadorNovedades").val());
        $(this).removeClass("add-more-novedades");
        $(this).removeClass("btn-success");
        $(this).addClass("btn-danger");
        $(this).html("-&nbsp;");

        var nuevaNovedad = '<tr>'
                            + '<td>'
                                + '<div class="form-group">'
                                    + '<div class="input-group">'
                                        + '<input type="text" class="form-control" id="txtNovedad' + (contador + 1) + '" name="txtNovedad' + (contador + 1) + '" placeholder="Novedad"/>'
                                        + '<span class="input-group-btn">'
                                            + '<button id="btnNovedad' + (contador + 1) + '" class="btn btn-success add-more-novedades" type="button">+</button>'
                                        + '</span>'
                                    + '</div>'
                                + '</div>'
                            + '</td>'
                        + '</tr>';

        $("#tblNovedades").append(nuevaNovedad);
        $(".add-more-novedades").on("click", novedad);
        $("#contadorNovedades").val(contador + 1);
    }
    else
        $(this).closest("tr").remove();
}

function finalizarMantenimiento(){
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

            /********Carga de fotografIa****/
            $("#btnConfirmarFinalizarMantenimiento").attr("disabled","disabled");
            $("#btnConfirmarFinalizarMantenimiento").html("Cargando...");

            var options = new FileUploadOptions();
             options.fileKey = "file";
             options.fileName = idOrdenMantenimientoSeleccionada + "_" + foto.substr(foto.lastIndexOf('/') + 1);
             options.mimeType = "image/jpeg";
             options.params = {};
             options.chunkedMode = false;

             var ft = new FileTransfer();
             ft.upload(foto, dominio + "/dataLayout/upload.php", function(result){
                $.gritter.add({
                    title: 'Correcto!',
                    text: 'Foto subida exitosamente. Guardando visita técnica...',
                    time: 5000
                });

                $.ajax({
                    url: dominio + "/dataLayout/srvOrdenesMantenimiento.php",
                    method: 'GET',
                    data: {MethodName: "finalizarOrdenMantenimiento", data: '{"idOM": "' + idOrdenMantenimientoSeleccionada + '", "u": "' + sessionTmp._datosUsuario.usuario + '", "f": "' + (idOrdenMantenimientoSeleccionada + "_" + foto.substr(foto.lastIndexOf('/') + 1)) + '"}'},
                    success: function(resp) {
                        $("#mdConfirmacionFinalizarMantenimiento").modal("hide");
                        $("#btnCancelarVisita").click();
                        construirDataTable("dtOrdenesMantenimiento", "Ordenes de Mantenimiento", {MethodName: "listarOrdenesMantenimiento", data: '{"fl": "' + flujos + '"}'}, "Buscar...", "", columnas, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
                        construirDataTable("dtInconvenientes", "Inconvenientes", "", "Buscar...", "", columnasInconvenientes, "", [5,10], undefined, undefined);
                        navigator.camera.cleanup();
                        $.gritter.add({
                            title: 'Correcto!',
                            text: 'La orden de mantenimiento ha sido finalizada.',
                            time: 5000
                        });
                    },
                    error: function(request,msg,error) {
                        $.gritter.add({
                            title: 'Error!',
                            text: 'No se pudo finalizar la orden de mantenimiento.',
                            time: 4000
                        });
                        console.log(msg);
                        navigator.camera.cleanup();
                    }
                })

                $("#btnConfirmarFinalizarMantenimiento").removeAttr("disabled");
                $("#btnConfirmarFinalizarMantenimiento").html(" SI");
             }, function(error){
                $.gritter.add({
                    title: 'Error!',
                    text: 'No fue posible cargar la fotografía.',
                    time: 5000
                });

                $("#btnConfirmarFinalizarMantenimiento").removeAttr("disabled");
                $("#btnConfirmarFinalizarMantenimiento").html(" SI");
                navigator.camera.cleanup();
             }, options);
        },
        error: function(request,msg,error) {
            cerrarSesion();
            console.log(msg);
        }
    })
}

function onSuccessCamera(imageData) {
    document.getElementById('imgFoto').src = "";
    var imagen = document.getElementById('imgFoto');
    imagen.src = imageData;
    foto = imageData;
}

function onFailCamera(message) {
    alert('Error al tomar la foto: ' + message);
    $("#mdConfirmacionFinalizarMantenimiento").modal("hide");
    document.getElementById('imgFoto').src = "";
}

function consultarHistorialMantenimientos(){
    var dataHistorico = {
        'sEcho': 1,
        'iTotalRecords': 0,
        'aaData': []
    }

    construirDataTable("dtHistorico", "Mantenimientos", "", "Buscar...", "", columnasHistorico, "", [1], undefined, undefined);

    $.ajax({
        url: dominio + "/dataLayout/srvConsultas.php",
        method: 'GET',
        data: {MethodName: "consultarReporteDetalle", data: '{"cb": "' + cb + '"}'},
        success: function(resp) {
            var data = JSON.parse(resp);
            var idOM = 0;
            
            if(data.length > 0){
                dataHistorico.iTotalRecords = data.length;

                $.each(data, function (i, d) {
                    if(idOM != d.idOrdenMantenimiento){
                        var registro = {
                            "fecha": d.fecha,
                            "idOrden": d.idOrdenMantenimiento,
                            "tecnico": d.tecnico,
                            "trabajos": ""
                        }

                        var table = "<table border='0' style='font-size: 11px'>"
                                       + "<tr>"
                                            + "<td><b>Inconveniente:</b></td>"
                                            + "<td>"+d.inconveniente+"</td>" 
                                       + "</tr>";
                        
                        $.each(data, function (j, item) {
                            if(d.idOrdenMantenimiento == item.idOrdenMantenimiento)
                            {
                                table += "<tr>"
                                            + "<td><b>" + ((item.idTipoActividad == 1) ? "Trabajo:" : "Novedad") + "</b></td>"
                                            + "<td>"+item.descripcion+"</td>"
                                       + "</tr>";
                            }
                        }) 

                        table += "</table>";

                        registro.trabajos = table;

                        dataHistorico.aaData.push(registro);
                    }

                    idOM = d.idOrdenMantenimiento;
                })

                $("#dtHistorico").dataTable().fnAddData(dataHistorico.aaData);
            }
        },
        error: function(request,msg,error) {
            console.log(msg);
        }
    })
}