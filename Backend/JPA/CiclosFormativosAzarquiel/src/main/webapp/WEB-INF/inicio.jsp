<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<%@ page import="java.util.List"%>
<%@ page import="model.Ies"%>
<%@ page import="model.Oferta"%>

<%
List<Ies> institutos = (List<Ies>) request.getAttribute("institutos");

List<Oferta> ofertas = (List<Oferta>) request.getAttribute("ofertas");
%>

<%
Integer idIesSeleccionado =
    (Integer) request.getAttribute("idIesSeleccionado");
%>

<link rel="icon"
	href="${pageContext.request.contextPath}/img/favicon.ico">
<link rel="stylesheet"
	href="${pageContext.request.contextPath}/css/estilos.css">

<html>
<body>

	<div class="contenedor">

		<img class="banner"
			src="${pageContext.request.contextPath}/img/banner.jpg"
			alt="Banner IES Azarquiel">


		<% String mensaje = (String) request.getAttribute("mensaje");

if (mensaje  != null){
%>


		<div class="mensaje">

			<%=mensaje %>

		</div>


		<%
	
}
	
	%>




		<h1>Institutos</h1>

		<form action="ControladorCiclos" method="get">

			<input type="hidden" name="operacion" value="verOferta"> <label>Selección
				de instituto</label> <select name="idIes">
				<option value="">Seleccione Instituto</option>



			<%
if (institutos != null) {
    for (Ies i : institutos) {
%>

<option value="<%= i.getId() %>"
<%
if (idIesSeleccionado != null && i.getId() == idIesSeleccionado) {
%>
selected
<%
}
%>
>
    <%= i.getNombre() %>
</option>

<%
    }
}
%>
			</select> <input type="submit" value="Ver Oferta">

		</form>



		<%
		if (ofertas != null) {
		%>

		<h2>Oferta educativa</h2>

<table border="1" class="tablaOfertas">
			<tr>
				<th>Ciclo</th>
				<th>Turno</th>
				<th>Plazas</th>
				<th>Editar</th>
			</tr>

			<%
			for (Oferta o : ofertas) {
			%>

			<tr>
				<td><%=o.getCiclo().getNombre()%></td>
				<td><%=o.getTurno().getDescripcion()%></td>
				<td><%=o.getPlazas()%></td>
				<td><a
					href="ControladorCiclos?operacion=editar&idOferta=<%=o.getId()%>">
						Editar </a></td>
			</tr>

			<%
			}
			%>

		</table>

		<%
		}
		%>


	</div>


<a href="ControladorCiclos?operacion=inicio">
    Volver al inicio
</a>


</body>
</html>