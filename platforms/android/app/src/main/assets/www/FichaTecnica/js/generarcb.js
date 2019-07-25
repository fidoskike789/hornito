$(document).on("ready", iniciar);

var sessionTmp = null;

function iniciar(){
	addActiveMenu("Códigos de Barras");
	sessionTmp = JSON.parse(localStorage.getItem("session"));

	$("#btnGenerarCodigos").on("click", confirmarGenerarCodigos);
    $("#btnConfirmarGenerarCodigos").on("click", generarCodigos);
    $("#btnImprimirCodigos").hide();
	$("#btnImprimirCodigos").on("click", imprimirCodigos);
    $("#btnBuscarCodigos").on("click", buscarCodigos);
    $("#dvdReimprimir").hide();
    $("#btnCancelarReimpresion").hide();
    $("#btnCancelarReimpresion").on("click", function(){
        $(".frmCodigosBarras").show();
        $("#btnImprimirCodigos").hide();
        $("#btnCancelarReimpresion").hide();
        $("#dvCodigosBarras").html("");
        $("#dvdReimprimir").hide();
        $('#slcCodigos').multiselect('deselectAll', false); 
        $('button.multiselect').html('Códigos a imprimir&nbsp;<b class="caret"></b>')
    });

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
}

function confirmarGenerarCodigos(){
    $("#dvCodigosBarras").html("");
    $("#tecnico").html("");
    $("#numcodigos").html("");

    var reglas = {
        "slcTecnico": {
            required: true,
            notEqual: '0'
        },
        "slcCantidad": {
            required: true,
            notEqual: '0'
        }
    }

    if(validarFormulario("frmCodigosBarras", reglas))
    {
        $("#mdConfirmacionGeneracionCodigos").modal("show");
        $("#tecnico").html($("#slcTecnico :selected").text());
        $("#numcodigos").html($("#slcCantidad :selected").text());
    }
}
 
function generarCodigos(){
    $("#dvdReimprimir").hide();

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

            var envio = [];
            var lstCodigos = [];

            $("#lblTecnico").html("");
            $("#lblGeneradoPor").html("");
            $("#dvCodigosBarras").html("");

            $.ajax({
                url: dominio + "/dataLayout/srvCodigosBarras.php",
                method: 'GET',
                data: {MethodName: "buscarConsecutivo", data: '{"t": "' + $("#slcTecnico").val() + '"}'},
                success: function(cons) {
                    if(cons != null){
                        $("#lblTecnico").html("<b>TECNICO</b>:&nbsp;" + $("#slcTecnico :selected").text().toUpperCase());
                        $("#lblGeneradoPor").html("<b>GENERADO POR</b>:&nbsp;" + sessionTmp._datosUsuario.nombres + " " + sessionTmp._datosUsuario.apellidos);

                        var consecutivo = parseInt(JSON.parse(cons)[0].consecutivo);

                		for (var i = (consecutivo + 1); i <= (parseInt($("#slcCantidad").val()) + consecutivo); i++) {
                            var codigo = {
                                "t": $("#slcTecnico").val(),
                                "n": i,
                                "c": 'hp-' + ('00000000' + i).slice(-8) + $("#slcTecnico").val(),
                                "u": sessionTmp._datosUsuario.usuario
                            }

                			$("#dvCodigosBarras").append('<img alt="codigo" src="' + dominio + '/dataLayout/barcode.php?text=hp-' + ('00000000' + i).slice(-8) + $("#slcTecnico").val() + '&print=true&size=40&sizefactor=2" />');

                            lstCodigos.push(codigo);
                		}

                        $("#btnImprimirCodigos").show();

                        envio = {
                            "data" : lstCodigos
                        }

                        $.ajax({
                            url: dominio + "/dataLayout/srvCodigosBarras.php",
                            method: 'GET',
                            data: {MethodName: "asignarCodigos", data: JSON.stringify(envio)},
                            success: function(resp) {
                                $.gritter.add({
                                    title: 'Correcto!',
                                    text: 'Los códigos de barras generados se han asignado al técnico seleccionado.',
                                    time: 5000
                                });

                                $("#mdConfirmacionGeneracionCodigos").modal("hide");
                            },
                            error: function(request,msg,error) {
                                $.gritter.add({
                                    title: 'Error!',
                                    text: 'No se pudo asignar los códigos generados.',
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
                            text: 'Consecutivo no encontrado.',
                            time: 4000
                        });
                    }
                },
                error: function(request,msg,error) {
                    $.gritter.add({
                        title: 'Error!',
                        text: 'No se pudo obtener el consecutivo.',
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

function buscarCodigos(){
    $(".frmCodigosBarras").hide();
    $("#btnImprimirCodigos").show();
    $("#btnCancelarReimpresion").show();
    $("#dvCodigosBarras").html("");
    $("#lblTecnico").html("");
    $("#lblGeneradoPor").html("");

    $.ajax({
        url: dominio + "/dataLayout/srvCodigosBarras.php",
        method: 'GET',
        data: {MethodName: "listarCodigosTecnico"},
        success: function(resp) {
            var codigos = JSON.parse(resp);

            if(codigos.length > 0){
                $.each(codigos, function (i, cod) {
                    $("#slcCodigos").append('<option data-prueba="5" value="' + cod.codigo + '">' + cod.codigo + '</option>');
                })

                $('#slcCodigos').multiselect({
                    enableFiltering: true,
                    enableCaseInsensitiveFiltering: true,
                    maxHeight: 200,
                    nonSelectedText: "Códigos a imprimir",
                    onChange: function(option, checked, select) {
                        console.log(option);
                        var opselected = $(option).val();
                        if(checked == true)
                            $("#dvCodigosBarras").append('<img class="' + opselected + '" alt="codigo" src="' + dominio + '/dataLayout/barcode.php?text=' + opselected + '&print=true&size=40&sizefactor=2" />');
                        else
                            $("#dvCodigosBarras").children("." + opselected).remove();
                    }
                });

                $('#slcCodigos').multiselect('deselectAll', false); 
                $('button.multiselect').html('Códigos a imprimir&nbsp;<b class="caret"></b>')
                $(".multiselect-search").attr("placeholder","Buscar...");

                $("#dvdReimprimir").show();
            }
            else{
                $.gritter.add({
                    title: 'Advertencia!',
                    text: 'No se han encontrado códigos para el técnico seleccionado.',
                    time: 5000
                });
            }
        },
        error: function(request,msg,error) {
            console.log(msg);
        }
    })
}

function imprimirCodigos(){
	$("#dvContenedorCB").printArea('{mode: "popup", popClose: false, extraCss: "", retainAttr: Array[4], extraHead: ""}');
}