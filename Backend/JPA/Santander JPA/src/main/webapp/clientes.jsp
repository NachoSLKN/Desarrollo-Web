<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>
<%@ page import="java.util.List"%>
<%@ page import="entidades.Cliente"%>

<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>Clientes</title>
<link rel="stylesheet" href="/BancoSantander/css/style.css">
<link rel="icon" type="image/png" href="/BancoSantander/img/faviconsantander.png">
</head>

<body>

	<img src="img/santander.png" alt="Santander Logo" class="logo">


	<h1>Banco Santander - Clientes</h1>

	<!-- Recorre la colección clientes y en cada vuelta
	guarda el elemento actual en c -->
	<c:forEach items="${clientes}" var="c">
		<div class="cliente">
		<h1>Nombre: ${c.nombre}</h1>
		<h1>Saldo: ${c.saldo}</h1>
		</div>
	</c:forEach>



<a href="web.jsp">
  <button>  Volver a posición global </button> </a>
</body>

</html>