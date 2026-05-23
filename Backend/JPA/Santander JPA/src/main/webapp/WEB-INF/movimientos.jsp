<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Movimientos</title>
<link rel="stylesheet" href="css/style.css">
<link rel="icon" type="image/png" href="img/faviconsantander.png">

</head>
<body>
<img src="img/santander.png"
     alt="Santander Logo"
     class="logo">
     
     	<h1>Banco Santander - Movimientos</h1>
     	
     	<!-- 	El method post hace que el form 
     	envie los datos al servlet usando HTTP POST
		Action SantanderMovServlet responde a 
		quien se enviará el form. -->
     	
	
     	<form action="SantanderMovServlet" method = "post">
   
		<input type="text" name="numeroCuenta" 
		placeholder="Número de cuenta">
		<button type="submit"> Listar transferencias </button>
     	</form>
     	
     	
     	<c:forEach items= "${movimientos}}">
     	</c:forEach>
     
<a href="web.jsp">
    <button> Volver a posición global</button> </a>     
</body>
</html>