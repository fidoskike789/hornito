var dominio = "http://www.hornipan.com.ec/FichaTecnica";

/*Internacionalizacion de Jquery Validate*/
jQuery.extend(jQuery.validator.messages, {
    required: "Obligatorio!",
    remote: "Por favor, rellena este campo.",
    email: "Correo no válido",
    url: "URL no válida.",
    date: "Formato de fecha no válida.",
    dateISO: "Formato de fecha (ISO) no válida.",
    number: "Número no válido.",
    digits: "Sólo dígitos.",
    creditcard: "Número de tarjeta no válido.",
    equalTo: "Escribe el mismo valor de nuevo.",
    accept: "Escribe un valor con una extensión aceptada.",
    maxlength: jQuery.validator.format("No escribas más de {0} caracteres."),
    minlength: jQuery.validator.format("No escribas menos de {0} caracteres."),
    rangelength: jQuery.validator.format("Escribe un valor entre {0} y {1} caracteres."),
    range: jQuery.validator.format("Escribe un valor entre {0} y {1}."),
    max: jQuery.validator.format("Escribe un valor menor o igual a {0}."),
    min: jQuery.validator.format("Escribe un valor mayor o igual a {0}."),
    require_from_group: jQuery.validator.format("Por favor, complete al menos {0} de estos campos."),
    notEqual: "Seleccione una opción."
});

jQuery.validator.addMethod("notEqual", function (value, element, param) {
    return this.optional(element) || value != '0';
});

$(document).ajaxStart(bloquearPagina).ajaxStop($.unblockUI);
$(document).on("ready", function(){
    $("#menu").html("");
    $("#btnCerrarSesion").on("click", cerrarSesion);

    if($("#btnCerrarSesion").length != 0){
        if(localStorage.getItem("session") == null)
            cerrarSesion();
        else
        {
            var session = JSON.parse(localStorage.getItem("session"));
            $(".logged-user .name").html(session._datosUsuario.usuario);
            crearMenuLateral();
        }
    }
})

function cerrarSesion(){
    localStorage.removeItem("session");
    location.href = "index.html";
}

function crearMenuLateral() {
    var idPadre = 0;
    //obtenemos el objeto que se encuentra en la variable de session
    var sessionLocal = JSON.parse(localStorage.getItem("session"));
    //
    if (sessionLocal._menu.length > 0) {
        $.each(sessionLocal._menu, function (i, menu) {
            if (menu.idMenuPadre == "" || menu.idMenu == null || menu.idMenuPadre == null) {
                $("#menu").append("<li id='" + menu.idMenu + "'><a href='" + menu.url + "'><i class='fa " + menu.icono + "'></i><span class='text'>" + menu.nombre + "</span></a></li>");
            } else {
                if (!($("#" + menu.idMenuPadre + " ul").length)) {
                    $("#" + menu.idMenuPadre).append("<ul id='u" + menu.idMenuPadre + "' class='sub-menu'></ul>");
                }

                if (!($("#" + menu.idMenuPadre + " a:first-child").hasClass("js-sub-menu-toggle"))) {
                    $("#" + menu.idMenuPadre + " a:first-child").addClass("js-sub-menu-toggle");
                    $("#" + menu.idMenuPadre + " a:first-child").append("<i class='toggle-icon fa fa-angle-left'></i>");
                }

                $("#u" + menu.idMenuPadre).append("<li id='" + menu.idMenu + "'><a tabindex='-1' href='" + menu.url + "'><i class='fa " + menu.icono + "'></i><span class='text'>" + menu.nombre + "</span></a></li>");
            }
        });
    }
    
    $('.main-menu .js-sub-menu-toggle').on('click', function(e){

        e.preventDefault();

        $li = $(this).parent('li');
        if( !$li.hasClass('active')){
            $li.find(' > a .toggle-icon').removeClass('fa-angle-left').addClass('fa-angle-down');
            $li.addClass('active');
            $li.find('ul.sub-menu')
                .slideDown(300);
        }
        else {
            $li.find(' > a .toggle-icon').removeClass('fa-angle-down').addClass('fa-angle-left');
            $li.removeClass('active');
            $li.find('ul.sub-menu')
                .slideUp(300);
        }
    });
}

function addActiveMenu(nombreMenu) {
    $(".text:contains('" + nombreMenu + "')").closest("li").addClass("active");
    $(".text:contains('" + nombreMenu + "')").closest("li").closest("ul").closest("li").children("a").click()
}

function bloquearPagina(){
    $.blockUI({
        message: "Cargando...",
        css: { 
            border: 'none', 
            padding: '15px', 
            backgroundColor: '#000', 
            '-webkit-border-radius': '10px', 
            '-moz-border-radius': '10px', 
            opacity: .5, 
            color: '#fff' 
        }
    })
}

function construirDataTable(table, titulo, data, placeholder, evento, columnas, source, lengthMenu, sorting, responsive) {
    if ($.fn.DataTable.isDataTable('#' + table)) {
        $('#' + table).dataTable().fnClearTable();
        $('#' + table).dataTable().fnDestroy();
        $('#' + table + ' tbody').empty();
    }

    if (sorting == undefined) {
        sorting = [];
    }

    if (responsive == undefined)
    {
        responsive = {
            auto: true
        }
    }

    if (source != "") {
        $("#" + table).hide();

        $('#' + table).dataTable({
            bProcessing: true,
            bServerSide: false,
            bAutoWidth: false,
            bSaveState: true,
            responsive: responsive,
            sAjaxSource: source,
            aoColumns: columnas,
            lengthMenu: lengthMenu,
            fnServerData: function (sSource, aoData, fnCallBack) {
                $.ajax({
                    method: "GET",
                    url: sSource,
                    data: data,
                    success: function (response) {
                        var json = JSON.parse(response);
                        var info = {
                            'sEcho': 1,
                            'iTotalRecords': json.length,
                            'aaData': json
                        }
                        fnCallBack(info);
                        $("#" + table).show();
                    },
                    error: function(request,msg,error) {
                        $.gritter.add({
                            title: 'Error!',
                            text: 'No se pudo cargar la información de la tabla.',
                            time: 5000
                        });
                        console.log(msg);
                    }
                })
            },
            aaSorting: sorting,
            language: internacionalizarDataTable("es")
        });
    }
    else {
        $('#' + table).dataTable({
            bProcessing: true,
            bServerSide: false,
            bAutoWidth: false,
            bSaveState: true,
            responsive: responsive,
            aoColumns: columnas,
            lengthMenu: lengthMenu,
            fnServerData: function (sSource, aoData, fnCallBack) {
                var json = JSON.parse("{'sEcho': 1,'iTotalRecords': 0,'aaData': []}");
                fnCallBack(json);
            },
            language: internacionalizarDataTable("es")
        });
    }

    $('#' + table + '_wrapper .table-caption').text(titulo);
    $('#' + table + '_wrapper .dataTables_filter input').attr('placeholder', placeholder);

    $("#" + table).dataTable().on("draw.dt", function () {
        $("#" + table + " tbody tr.selected").removeClass("selected");
        $("#" + table + " tbody tr").unbind("click").on("click", evento);
        $("#" + table + " tbody ").css("font-size","12px");

    });
}

function internacionalizarDataTable(lang) {
    var traduccion;

    switch (lang) {
        case "es":
            traduccion = {
                "sProcessing": "Procesando Solicitud...",
                "sLengthMenu": "Por página: _MENU_",
                "sZeroRecords": "No se encontraron resultados",
                "sEmptyTable": "Ningún dato disponible en esta tabla",
                "sInfo": "del _START_ al _END_ de _TOTAL_ registros",
                "sInfoEmpty": "del 0 al 0 de 0 registros",
                "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                "sInfoPostFix": "",
                "sSearch": "Buscar:",
                "sUrl": "",
                "sInfoThousands": ",",
                "sLoadingRecords": "Por favor espere...",
                "oPaginate": {
                    "sFirst": "Primero",
                    "sLast": "Último",
                    "sNext": "Siguiente",
                    "sPrevious": "Anterior"
                },
                "oAria": {
                    "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                    "sSortDescending": ": Activar para ordenar la columna de manera descendente"
                }
            }
            break;
        default:
            break;
    }

    return traduccion;
}

function validarFormulario(idForm, reglas){
    var validacion = false;
    var formulario = $("#" + idForm);

    formulario.validate({
        ignore: '.ignore',
        focusInvalid: false,
        rules: reglas
    })

    validacion = formulario.valid();

    return validacion;
}

function listarCatalogo(catalogo, selector){
    $.ajax({
        url: dominio + "/dataLayout/srvSeguridades.php",
        method: 'GET',
        data: {MethodName:  "listarCatalogo", data: '{"c": "' + catalogo + '"}'},
        success: function(resp) {
            var json = JSON.parse(resp);
            if(json.length > 0){
                $.each(json, function (i, cat) {
                    $("#" + selector).append('<option value="' + cat.codigo + '">' + cat.detalle + '</option>');
                })
            }
        }
    })
}

function formatDate(fecha, sIn, sOut){
    if(fecha != "")
    {
        var fTmp = fecha.split(sIn);
        return ((fTmp[2].length > 4) ? fTmp[2].substring(0,2) : fTmp[2]) + sOut + fTmp[1] + sOut + fTmp[0];
    }

    return null;
}