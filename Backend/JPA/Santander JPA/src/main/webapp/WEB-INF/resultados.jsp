<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Resultados</title>
<link rel="stylesheet" href="css/style.css">
<link rel="icon" type="image/png" href="img/faviconsantander.png">
</head>
<body>
	<img src="img/santander.png" alt="Santander Logo" class="logo">

	<h1>Banco Santander - Resultados</h1>
	
	<c:if test="${mensaje != null}">
		${mensaje}
	 </c:if>


	<c:if test="${error != null }">
	 ${error} 
	 </c:if>

<a href="web.jsp">
   <button>Volver a posición global</button>  </a>
</body>
</html>