<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<%@ page import="model.Oferta"%>

<%
Oferta oferta = (Oferta) request.getAttribute("oferta");
%>


<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>Editar Oferta</title>

<link rel="icon"
	href="${pageContext.request.contextPath}/img/favicon.ico">
<link rel="stylesheet"
	href="${pageContext.request.contextPath}/css/estilos.css">

</head>

<body>

	<div class="contenedor">

		<img class="banner"
			src="${pageContext.request.contextPath}/img/banner.jpg"
			alt="Banner IES Azarquiel">

		<h2>Modifique las plazas de la siguiente oferta</h2>

		<%
		String mensaje = (String) request.getAttribute("mensaje");

		if (mensaje != null) {
		%>

		<p style="color: line; border: 1px solid lime; padding: 10px;">
			<%=mensaje%>
		</p>


		<%
		}
		%>

		<form action="ControladorCiclos" method="get">


			<input type="hidden" name="operacion" value="modificar"> <input
				type="hidden" name="idOferta" value="<%=oferta.getId()%>">

			<p>
				Ies: <input type="text" value="<%=oferta.getIes().getNombre()%>"
					disabled>
			</p>

			<p>
				Ciclo: <input type="text"
					value="<%=oferta.getCiclo().getNombre()%>" disabled>
			</p>

			<p>
				Turno: <input type="text"
					value="<%=oferta.getTurno().getDescripcion()%>" disabled>
			</p>

			<p>
				Plazas: <input type="number" name="plazas"
					value="<%=oferta.getPlazas()%>">
			</p>

			<input type="submit" value="Modificar">

		</form>

	</div>

</body>
</html>