# CiclosFormativosAzarquiel

Aplicación web desarrollada utilizando el patrón Modelo-Vista-Controlador (MVC).

## Tecnologías utilizadas

* Java
* Jakarta Servlet
* JSP
* JPA (EclipseLink)
* MySQL
* Payara Server
* HTML/CSS

## Funcionalidades

* Selección de instituto mediante desplegable.
* Consulta de la oferta educativa de cada instituto.
* Visualización de:

  * Ciclo formativo.
  * Turno.
  * Número de plazas ofertadas.
* Modificación de plazas ofertadas.
* Persistencia de cambios en base de datos.
* Mensajes de confirmación.

## Arquitectura

Vista:

* JSP

Controlador:

* Servlet (ControladorCiclos)

Lógica de negocio:

* ServicioIes

Acceso a datos:

* DaoIes

Persistencia:

* JPA + MySQL

## Capturas

### Pantalla principal

![Pantalla principal](img/1.png)

### Selección de instituto

![Selección de instituto](img/2.png)

### Oferta educativa

![Oferta educativa](img/3.png)

### Formulario de edición

![Formulario edición](img/4.png)

### Confirmación de modificación

![Confirmación](img/5.png)

## Autor

Ignacio Liñán Vicente
2º DAW - IES Azarquiel
