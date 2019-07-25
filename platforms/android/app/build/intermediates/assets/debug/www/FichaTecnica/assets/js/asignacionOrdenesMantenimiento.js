$(document).on("ready", iniciar);

var sessionTmp = null;
var flujos = [1,2].join(',');
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
        "mData": "ciudad",
        "title": "Ciudad"
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
            if(full.idFlujo == 1)
                return "<a id='btnE' class='btn btn-xs btn-success' onclick='asignarOrden(this)'><i class='fa fa-check-square-o'></i></a>";
            else
                return "<a id='btnE' class='btn btn-xs btn-warning' onclick='asignarOrden(this)'><i class='fa fa-undo'></i></a>";
        }
    }
]

function iniciar(){
    sessionTmp = JSON.parse(localStorage.getItem("session"));

    addActiveMenu("Asignación O. M.");

	//$("#slcTecnico").select2();
	$("#btnGuardarAsignacion").on("click", guardar);

    $("#slcTecnico").on("change", function(){
        if($(this).val() != "0")
            $(this).css("color", "");
        else
            $(this).css("color", "#999999");
    })

    $.ajax({
        url: dominio + "/dataLayout/srvSeguridades.php",
        method: 'GET',
        data: {MethodName: "listarUsuarios", data: '{"p": "3"}'},
        success: function(resp) {
            var json = JSON.parse(resp);

            if(json.length > 0){
                $.each(json, function (i, rol) {
                    $("#slcTecnico").append('<option value="' + rol.idUsuario + '">' + rol.nombres + ' ' + rol.apellidos + '</option>');
                })
            }
        }
    })

	construirDataTable("dtOrdenesMantenimiento", "Ordenes de Mantenimiento", {MethodName: "listarOrdenesMantenimiento", data: '{"fl": "' + flujos + '"}'}, "Buscar...", "", columnas, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
}

function asignarOrden(obj){
    var row = $(obj).closest('tr');
    var dataRow = $("#dtOrdenesMantenimiento").DataTable().row(row).data();

    $("#lblNumeroOrden").html(dataRow.idOrdenMantenimiento);

	$("#mdAsignacionOrden").modal("show");
    if(dataRow.idTecnico != null)
	   $("#slcTecnico").val(dataRow.idTecnico).trigger("change");
    else
       $("#slcTecnico").val("0").trigger("change");
}

function guardar(){
    var reglas = {
        "slcTecnico": {
            required: true,
            notEqual: '0'
        }
    }

    if(validarFormulario("frmAsignacionOrden", reglas))
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
                    "idO": $("#lblNumeroOrden").html(),
                    "idT": $("#slcTecnico").val(),
                    "u" : sessionTmp._datosUsuario.usuario
                }

                $.ajax({
                    url: dominio + "/dataLayout/srvOrdenesMantenimiento.php",
                    method: 'GET',
                    data: {MethodName: "asignarOrdenMantenimiento", data: JSON.stringify(envio)},
                    success: function(resp) {
                        $("#mdAsignacionOrden").modal("hide");

                        construirDataTable("dtOrdenesMantenimiento", "Ordenes de Mantenimiento", {MethodName: "listarOrdenesMantenimiento", data: '{"fl": "' + flujos + '"}'}, "Buscar...", "", columnas, dominio + "/dataLayout/srvOrdenesMantenimiento.php", [5,10], undefined, undefined);
                        
                        $.gritter.add({
                            title: 'Correcto!',
                            text: 'La Orden de Mantenimiento se ha asignado exitosamente.',
                            time: 5000
                        });
                    },
                    error: function(request,msg,error) {
                        $.gritter.add({
                            title: 'Error!',
                            text: 'No se pudo asignar la Orden de Mantenimiento.',
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