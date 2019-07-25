$(document).on("ready", iniciar);

var sessionTmp = null;

function iniciar(){
	$(".default").hide();
	$(".tecnico").hide();

	sessionTmp = JSON.parse(localStorage.getItem("session"));

	if(sessionTmp._datosUsuario.idperfil == 3){
		$(".tecnico").show();
		$.ajax({
		    url: dominio + "/dataLayout/srvCharts.php",
		    method: 'GET',
		    data: {MethodName: "chartPendientesTecnico", data: '{"idU": "' + sessionTmp._datosUsuario.idUsuario + '"}'},
		    success: function(resp) {
		    	var resumen = JSON.parse(resp);

		    	$("#asignadas").html(resumen[0].asignadas);
		    	$("#procesando").html(resumen[0].procesando);
		    	$("#enobservaciones").html(resumen[0].enobservaciones);

		    	if(resumen[0].asignadas != "0")
		    		$("#asignadas").parent().parent().attr("href", "mantenimientos.html");

		    	if(resumen[0].procesando != "0")
		    		$("#procesando").parent().parent().attr("href", "visitastecnicas.html");

		    	if(resumen[0].enobservaciones != "0")
		    		$("#enobservaciones").parent().parent().attr("href", "mantenimientos.html");
		    },
		    error: function(request,msg,error) {
		        console.log(msg);
		    }
		})
	}
	else
	{
		$(".default").show();

		$.ajax({
		    url: dominio + "/dataLayout/srvCharts.php",
		    method: 'GET',
		    data: {MethodName: "chartHistorialOrdenesMantenimiento", data: '{}'},
		    success: function(resp) {
		    	var historico = JSON.parse(resp);
		    	var total = parseInt(historico[0].total);
		    	var pPendientes = (parseInt(historico[0].pendientes) * 100) / total;
		    	var pProcesando = (parseInt(historico[0].procesando) * 100) / total;
		    	var pFinalizadas = (parseInt(historico[0].finalizadas) * 100) / total;

		    	$("#chartReg").attr("data-percent", "100");
		    	$("#chartPen").attr("data-percent", pPendientes);
		    	$("#chartPro").attr("data-percent", pProcesando);
		    	$("#chartFin").attr("data-percent", pFinalizadas);

		    	$("#regNum").html(historico[0].total);
		    	$("#penNum").html(historico[0].pendientes);
		    	$("#proNum").html(historico[0].procesando);
		    	$("#finNum").html(historico[0].finalizadas);

		    	var cOptions = {
					animate: 3000,
					trackColor: "#dadada",
					scaleColor: "#dadada",
					lineCap: "square",
					lineWidth: 5,
					barColor: "#ef1e25",
					onStep: function(from, to, percent) {
						$(this.el).find('.percent').text(Math.round(percent));
					}
				}

				cOptions.barColor = "#000000"; // black
				$('.easy-pie-chart.default').easyPieChart(cOptions);
				cOptions.barColor = "#E60404"; // red
				$('.easy-pie-chart.red').easyPieChart(cOptions);
				cOptions.barColor = "#FFB800"; // yellow
				$('.easy-pie-chart.yellow').easyPieChart(cOptions);
				cOptions.barColor = "#3E9C1A"; // green
				$('.easy-pie-chart.green').easyPieChart(cOptions);
		    },
		    error: function(request,msg,error) {
		        console.log(msg);
		    }
		})
	}
}