$(document).on("ready", iniciar);

var columnas = [
    {
    	"mData": "idOrdenMantenimiento",
        "title": "N°"
    }, {
        "mData": "cliente",
        "title": "Cliente"
    }, {
        "mData": "producto",
        "title": "Producto"
    }, {
        "mData": "fechaEmision",
        "title": "Fecha Emisión",
        "sClass": "none"
    }, {
        "mData": "fechaRegistro",
        "title": "Fecha Registro",
        "sClass": "none"
    }, {
        "title": "Técnico Asignado",
        "mRender": function (data, type, full) {
        	return full.apellidos + " " + full.nombres;
        }
    }, {
        "mData": "fechaAsignacion",
        "title": "Fecha Asignación"
    }, {
        "mData": "fechaInicio",
        "title": "Inicio Mantenimiento"
    }, {
        "mData": "fechaFin",
        "title": "Fin Mantenimiento"
    }, {
        "title": "Tiempo Mantenimiento",
        "mRender": function (data, type, full) {
            try
            {
                if((full.fechaInicio != null) && (full.fechaFin != null))
                {
                    var tiempo = 0;
                    var fITmp = new Date(full.fechaInicio).getTime();
                    var fFTmp = new Date(full.fechaFin).getTime();

                    var diff = fFTmp - fITmp;
                    var tiempo = (diff/(1000));

                    var hours = Math.floor( tiempo / 3600 );  
                    var minutes = Math.floor( (tiempo % 3600) / 60 );
                    var seconds = tiempo % 60;

                    //Anteponiendo un 0 a los minutos si son menos de 10 
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                     
                    //Anteponiendo un 0 a los segundos si son menos de 10 
                    seconds = seconds < 10 ? '0' + seconds : seconds;
                     
                    tiempo = hours + ":" + minutes + ":" + seconds;  // 2:41:30*/
                    return tiempo;
                }
            }catch(e)
            {

            }

            return "";
        }
    }, {
        "mData": "usuarioRegistro",
        "title": "Usuario Registro",
        "sClass": "none"
    }, {
        "mData": "observaciones",
        "title": "Observaciones",
        "sClass": "none"
    }, {
        "mData": "estadoDetalle",
        "title": "Estado",
        "mRender": function (data, type, full) {
            return '<div class="label label-' + obtenerEtiqueta(full.estadoDetalle) + '">' + full.estadoDetalle + '</div>';
        }
    }, {
    	"sWidth": "90px",
        "mRender": function (data, type, full) {
            if ((full.idflujo == 4) || (full.idflujo == 6))
                return "<a href='#det' class='btn btn-xs btn-info' onclick='consultarDetalle(" + full.idOrdenMantenimiento + ")'><i class='fa fa-info'></i></a>&nbsp;"
                  + "<a class='btn btn-xs btn-success' onclick='mostrarOrdenVisita(this, 1)'><i class='fa fa-file'></i></a>&nbsp;"
                  + "<a class='btn btn-xs btn-warning' onclick='mostrarOrdenVisita(this, 2)'><i class='fa fa-cog'></i></a>";
            else
                return "<a href='#det' class='btn btn-xs btn-info' onclick='consultarDetalle(" + full.idOrdenMantenimiento + ")'><i class='fa fa-info'></i></a>&nbsp;"
                  + "<a class='btn btn-xs btn-success' onclick='mostrarOrdenVisita(this, 1)'><i class='fa fa-file'></i></a>";
        }
    }
]

var columnasReporte = [
    {
        "mData": "codigoBarras",
        "title": "Código de Barras"
    }, {
        "mData": "cliente",
        "title": "Cliente"
    }, {
        "mData": "producto",
        "title": "Producto"
    }, {
        "mData": "direccion",
        "title": "Dirección"
    }, {
        "mData": "telefono",
        "title": "Teléfono"
    }, {
        "mRender": function (data, type, full) {
            return "<a href='#rep' class='btn btn-xs btn-success' data-cb='" + full.codigoBarras + "' onclick='consultarReporteDetalle(this)'><i class='fa fa-search'></i></a>";
        }
    }
]

function iniciar(){
    addActiveMenu("Consultas");

	$("#left-sidebar").addClass("sidebar-hide-left");
	$("#main-content-wrapper").addClass("expanded-full");
    $("#dvdConsultas").hide();
    $("#dvdReportes").hide();
    $(".consultas").hide();
    $("#btnProcesar").hide();

    $("#slcConsultaReporte").on("change", function(){
        switch($(this).val())
        {
            case "1": //consultas
                $("#dvdConsultas").slideDown();
                $("#dvdReportes").slideUp();
                $(".consultas").slideDown();
                $("#btnProcesar").show();
                break;
            case "2": //reportes
                $("#dvdReportes").slideDown();
                $("#dvdConsultas").slideUp();
                $(".consultas").slideUp();
                $("#btnProcesar").show();
                break;
            default:
                $("#dvdReportes").slideUp();
                $("#dvdConsultas").slideUp();
                $(".consultas").slideUp();
                $("#btnProcesar").hide();
                break;
        }
    })

	$('#txtFechaDesde').datepicker({
        autoclose: true,
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        weekStart: 1,
        language: "es",
        endDate: new Date()
    });

    $('#txtFechaHasta').datepicker({
        autoclose: true,
        format: 'dd/mm/yyyy',
        todayHighlight: true,
        weekStart: 1,
        language: "es",
        endDate: new Date()
    });

    $("#btnProcesar").on("click", procesarConsulta);
    document.getElementById("imgFoto").src = imagenFotoEmpty;
    $("#imgFoto").on("error", function(){
        $(this).attr("src", imagenFotoError);
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

	construirDataTable("dtResultado", "Resultados", "", "Buscar...", "", columnas, "", [10,20,50], undefined, undefined);
    construirDataTable("dtReporte", "Reporte", "", "Buscar...", "", columnasReporte, "", [10,20,50], undefined, undefined);
}

function procesarConsulta(){

    var filtros = {
        "o": $("#txtOrden").val(),
        "t": $("#slcTecnico").val(),
        "fd": formatDate($("#txtFechaDesde").val(), "/", "-"),
        "fh": formatDate($("#txtFechaHasta").val(), "/", "-")
    }
    
    $(".inbox-left-menu").removeClass("active");

    if($("#slcConsultaReporte").val() == "1")
    {
        $("#fechaRegistro").html("");
        $("#usuarioRegistro").html("");
        $("#fechaAsignacion").html("");
        $("#usuarioAsignacion").html("");
        $("#tecnicoAsignado").html("");
        $("#fechaInicio").html("");
        $("#fechaFin").html("");
        $("#tiempoMantenimiento").html("");
        $("#codigoBarras").html("");
        $("#estadoDetalle").html("");
        $("#observaciones").html("");
        document.getElementById("imgFoto").src = imagenFotoEmpty;
        construirDataTable("dtResultado", "Resultados", {MethodName: "consultarOrdenesMantenimiento", data: JSON.stringify(filtros)}, "Buscar...", "", columnas, dominio + "/dataLayout/srvConsultas.php", [5,10], undefined, undefined);
        calcularHorasTrabajadas();
    }

    if($("#slcConsultaReporte").val() == "2")
    {
        construirDataTable("dtReporte", "Reporte", {MethodName: "consultarReporte", data: JSON.stringify(filtros)}, "Buscar...", "", columnasReporte, dominio + "/dataLayout/srvConsultas.php", [10,20,50], undefined, undefined);
    }
}

function consultarDetalle(idOM){
    $.ajax({
        url: dominio + "/dataLayout/srvConsultas.php",
        method: 'GET',
        data: {MethodName: "consultarOrdenMantenimientoDetalle", data: '{"idOM": "' + idOM + '"}'},
        success: function(resp) {
            var data = JSON.parse(resp);

            if(data.length > 0)
            {
                var fInicio = data[0].fechaInicio;
                var fFin = data[0].fechaFin;
                var fITmp = null;
                var fFTmp = null;
                var tiempo = "";

                if((fInicio != null) && (fFin != null))
                {
                    var fITmp = new Date(fInicio).getTime();
                    var fFTmp    = new Date(fFin).getTime();

                    var diff = fFTmp - fITmp;
                    tiempo = (diff/(1000));
                    //console.log(diff/(1000*60) );

                    var hours = Math.floor( tiempo / 3600 );  
                    var minutes = Math.floor( (tiempo % 3600) / 60 );
                    var seconds = tiempo % 60;

                    //Anteponiendo un 0 a los minutos si son menos de 10 
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                     
                    //Anteponiendo un 0 a los segundos si son menos de 10 
                    seconds = seconds < 10 ? '0' + seconds : seconds;
                     
                    tiempo= hours + ":" + minutes + ":" + seconds;  // 2:41:30
                }

                $("#fechaRegistro").html((data[0].fechaRegistro != null) ? data[0].fechaRegistro : "&nbsp;");
                $("#usuarioRegistro").html((data[0].usuarioRegistro != null) ? data[0].usuarioRegistro : "&nbsp;");
                $("#fechaAsignacion").html((data[0].fechaAsignacion != null) ? data[0].fechaAsignacion : "&nbsp;");
                $("#usuarioAsignacion").html((data[0].usuarioAsignacion != null) ? data[0].usuarioAsignacion : "&nbsp;");
                $("#tecnicoAsignado").html((data[0].tecnicoAsignado != null) ? data[0].tecnicoAsignado : "&nbsp;");
                $("#fechaInicio").html((data[0].fechaInicio != null) ? data[0].fechaInicio : "&nbsp;");
                $("#fechaFin").html((data[0].fechaFin != null) ? data[0].fechaFin : "&nbsp;");
                $("#tiempoMantenimiento").html(tiempo);
                $("#codigoBarras").html((data[0].codigoBarras != null) ? data[0].codigoBarras : "&nbsp;");
                $("#estadoDetalle").html((data[0].estadoDetalle != null) ? data[0].estadoDetalle : "&nbsp;");
                $("#observaciones").html((data[0].observaciones != null) ? data[0].observaciones : "&nbsp;");
                if(data[0].foto != null)
                    document.getElementById("imgFoto").src = dominio + "/dataLayout/fotos/" + data[0].foto;
                else
                    document.getElementById("imgFoto").src = imagenFotoEmpty;
            }
            //console.log(data);
        },
        error: function(request,msg,error) {
            console.log(msg);
        }
    })
}

function consultarReporteDetalle(obj){
    var fila = $(obj).closest("tr");
    var dataFila = $('#dtReporte').DataTable().row(fila).data();
    jQuery.get(dominio + '/plantillas/plantillaReporte.html?' + Math.random(), function (reporte) {
        $("#editorReporte").summernote({
            height: 600
        }).code("");
        
        $.ajax({
            url: dominio + "/dataLayout/srvConsultas.php",
            method: 'GET',
            data: {MethodName: "consultarReporteDetalle", data: '{"cb": "' + $(obj).data().cb + '"}'},
            success: function(resp) {
                var data = JSON.parse(resp);
                var idOM = 0;
                
                if(data.length > 0){
                    var row = "";
                    $.each(data, function (i, d) {
                        if(idOM != d.idOrdenMantenimiento){
                            row +="<tr>"
                                      + "<td style='text-align: center'>" + d.fecha + "</td>"
                                      + "<td>";
                            var table = "&nbsp;";
                            /*var table = "<table border='0' style='font-size: 11px'>"
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
                            table += "</table>";*/

                            row += table + "</td>"
                                  +"<td style='text-align: center'>" + d.idOrdenMantenimiento + "</td>"
                                  +"<td style='text-align: center'>" + ((d.costoMantenimiento != null) ? ("$ " + d.costoMantenimiento) : "") +"</td>"
                                  +"<td>&nbsp</td>"
                                  +"<td>&nbsp</td>"
                                  +"<td style='text-align: center'>" + ((d.estadocodigo == 1) ? "DETERIORADO" : "LEGIBLE") + "</td>"
                                  +"<td style='text-align: center'>" + d.tecnico + "</td>"
                                +"</tr>";
                        }

                        idOM = d.idOrdenMantenimiento;
                    })

                    reporte = reporte.replace("#cliente", dataFila.cliente);
                    reporte = reporte.replace("#producto", dataFila.producto);
                    reporte = reporte.replace("#direccion", dataFila.direccion);
                    reporte = reporte.replace("#telefono", dataFila.telefono);
                    reporte = reporte.replace("#cb", dataFila.codigoBarras);
                    reporte = reporte.replace("#modelo", dataFila.modelo);
                    reporte = reporte.replace("#serie", dataFila.serie);
                    reporte = reporte.replace("#detalles", row);
                }
                
                $("#editorReporte").summernote({
                    height: 600
                }).code(reporte);

                btnEditorImprimir("editorReporte");
            },
            error: function(request,msg,error) {
                console.log(msg);
            }
        })
    })
}

function calcularHorasTrabajadas(){
    if($("#dtResultado_processing").is(":visible"))
        setTimeout(calcularHorasTrabajadas, 1000);
    else
    {
        var dtData = $("#dtResultado").DataTable().data();
        var tiempoTrabajo = 0;
        var tiempoTrabajoTmp = "";

        $.each(dtData, function (i, d) {
            if((d.fechaInicio != null) && (d.fechaFin != null))
            {
                var fITmp = new Date(d.fechaInicio).getTime();
                var fFTmp = new Date(d.fechaFin).getTime();

                var diff = fFTmp - fITmp;
                var tiempo = (diff/(1000));
                tiempoTrabajo += tiempo;
            }
        })

        var hours = Math.floor( tiempoTrabajo / 3600 );  
        var minutes = Math.floor( (tiempoTrabajo % 3600) / 60 );
        var seconds = tiempoTrabajo % 60;

        //Anteponiendo un 0 a los minutos si son menos de 10 
        minutes = minutes < 10 ? '0' + minutes : minutes;
         
        //Anteponiendo un 0 a los segundos si son menos de 10 
        seconds = seconds < 10 ? '0' + seconds : seconds;
         
        tiempoTrabajoTmp = hours + ":" + minutes + ":" + seconds;  // 2:41:30*/
        $("#totalTrabajado").html(tiempoTrabajoTmp);
    }
}

function mostrarOrdenVisita(obj, frm){
	var fila = $(obj).closest("tr");
    var dataFila = $('#dtResultado').DataTable().row(fila).data();

    //console.log(dataFila);

    $("#editorOrdenVisita").summernote({
        height: 300
    }).code("");

    btnEditorImprimir("editorOrdenVisita");

    if(frm == 1) //Orden de Mantenimiento
    {
        jQuery.get(dominio + '/plantillas/plantillaOrdenMantenimiento.html?' + Math.random(), function (orden) {
            $("#mdOrdenVisita").modal("show");

            orden = orden.replace("#orden", dataFila.idOrdenMantenimiento);
            orden = orden.replace("#cliente", dataFila.cliente);
            orden = orden.replace("#telefono", dataFila.telefono);
            orden = orden.replace("#direccion", dataFila.direccion);
            orden = orden.replace("#fechaemision", dataFila.fechaEmision);
            orden = orden.replace("#producto", dataFila.producto);
            orden = orden.replace("#fechaventa", dataFila.fechaVenta);
            orden = orden.replace("#tecnicoultimo", dataFila.tecnicoUltimoMantenimiento);
            orden = orden.replace("#tecnicoreporta", dataFila.tecnicoQuienReporta);
            orden = orden.replace("#descripcion", dataFila.descripcionMantenimiento);
            orden = orden.replace("#observaciones", dataFila.observaciones);

            $("#editorOrdenVisita").summernote({
                height: 300
            }).code(orden);
        })
    }

    if(frm == 2) //Visita Tecnica
    {
        jQuery.get(dominio + '/plantillas/plantillaVisitaTecnica.html?' + Math.random(), function (visita) {
        	var horaInicio = moment(dataFila.fechaInicio).format('HH:mm').split(':');
			var horaFin = moment(dataFila.fechaFin).format('HH:mm').split(':');

        	visita = visita.replace("#orden", dataFila.idOrdenMantenimiento);
            visita = visita.replace("#fecha", moment(dataFila.fechaFin).format('YYYY-MM-DD'));
            visita = visita.replace("#cliente", dataFila.cliente);
            visita = visita.replace("#fechaventa", dataFila.fechaVenta);
            visita = visita.replace("#horallegada", horaInicio[0] + ":" + horaInicio[1]);
			visita = visita.replace("#horasalida", horaFin[0] + ":" + horaFin[1]);

			if(dataFila.garantia == "1")
            {
                visita = visita.replace("#si", "X");
                visita = visita.replace("#no", "");
            }

            if(dataFila.garantia == "0")
            {
                visita = visita.replace("#si", "");
                visita = visita.replace("#no", "X");
            }

            $.ajax({
                url: dominio + "/dataLayout/srvConsultas.php",
                method: 'GET',
                data: {MethodName: "consultarVisitaTecnica", data: '{"idOM": "' + dataFila.idOrdenMantenimiento + '"}'},
                success: function(res) {
                    var resp = JSON.parse(res);

                    if(resp.length > 0){
                        
                        var lstInconvenientes = "<ul>"

                        visita = visita.replace("#maquina", resp[0].maquina);
                        visita = visita.replace("#serie", resp[0].serie);
                        visita = visita.replace("#modelo", resp[0].modelo);
                        
                        visita = visita.replace("#costo", ((resp[0].costoMantenimiento != null) ? ("$ " + resp[0].costoMantenimiento) : ""));
                        visita = visita.replace("#tecnico", resp[0].tecnico);

                        $.each(resp, function (i, v) {
                            lstInconvenientes +="<li>" + v.inconveniente + "</li>"
                        })

                        lstInconvenientes += "</ul>";

                        visita = visita.replace("#inconvenientes", lstInconvenientes);


                        $.ajax({
			                url: dominio + "/dataLayout/srvConsultas.php",
			                method: 'GET',
			                data: {MethodName: "consultarVisitaTecnicaTrabajosNovedades", data: '{"idOM": "' + dataFila.idOrdenMantenimiento + '"}'},
			                success: function(lstTN) {
			                    var trabNov = JSON.parse(lstTN);
			                    var lstTrabajos = "<ul>";
			                    var lstNovedades = "<ul>";

			                    $.each(trabNov, function (i, tn) {
			                    	if(tn.idTipoActividad == 1) //trabajos
			                    	{
										lstTrabajos +="<li>" + tn.descripcion + "</li>"
			                    	}

			                    	if(tn.idTipoActividad == 2) //novedades
			                    	{
			                    		lstNovedades +="<li>" + tn.descripcion + "</li>"
			                    	}
		                        })

		                        lstTrabajos += "</ul>";
		                        lstNovedades += "</ul>";

		                        visita = visita.replace("#trabajos", lstTrabajos);
		                        visita = visita.replace("#novedades", lstNovedades);

			                    $("#mdOrdenVisita").modal("show");

			                    $("#editorOrdenVisita").summernote({
			                        height: 300
			                    }).code(visita);
			                }
			            })

                    }
                }
            })
        })
    }    
}