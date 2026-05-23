<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Transferencias</title>
<link rel="stylesheet" href="css/style.css">
<link rel="icon" type="image/png" href="img/faviconsantander.png">

</head>
<body>
	<img src="img/santander.png" alt="Santander Logo" class="logo">

	<h1>Banco Santander - Transferencias</h1>

	<form method="post" action="SantanderServlet">

		<input type="text" name="cuentaDeudora" placeholder="Cuenta Deudora..">
		<input type="text" name="cuentaAcreedora"
			placeholder="Cuenta Acreedora.."> <input type="text"
			name="importe" placeholder="Importe.."> <input type="text"
			name="concepto" placeholder="Concepto..">
		<button type="submit"> Realizar Transferencia </button>
	</form>

<a href="web.jsp">
   <button>Volver a posición global </button>  </a>
</body>
</html>