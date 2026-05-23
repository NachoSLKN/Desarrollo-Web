<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>
<%@ page import="java.util.List"%>

<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>Resultado Movimientos</title>
<link rel="stylesheet" href="/BancoSantander/css/style.css">
<link rel="icon" type="image/png"
	href="/BancoSantander/img/faviconsantander.png">
</head>

<body>

	<img src="img/santander.png" alt="Santander Logo" class="logo">


	<h1>Banco Santander - Resultado Movimientos</h1>


	<c:if test="${error!= null}">
		<div class="error">

			<h2>${error}</h2>
		</div>

	</c:if>

	<c:if test="${movimientos != null}">

		<c:forEach items="${movimientos}" var="movimiento">
			<div class="movimiento">
				<h1>Fecha: ${movimiento.fecha}</h1>
				<h1>Concepto: ${movimiento.concepto}</h1>
				<h1>Cantidad: ${movimiento.cantidad}</h1>
			</div>
		</c:forEach>
	</c:if>

<a href="SantanderServlet">
<button>Volver a posicion global </button> 
</a>
</body>
</html>