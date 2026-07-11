# Prácticas Servlets - DWES

Proyecto realizado con Jakarta Servlet y Payara Server para introducir los conceptos fundamentales de desarrollo web en Java siguiendo una arquitectura MVC (Modelo-Vista-Controlador).

---

# Práctica 1 - Hola Mundo

Creación de un servlet básico llamado `Controller1` que muestra el mensaje "Hola Mundo".

![Práctica 1](img/1.png)

---

# Práctica 2 - Tabla 3x3

Creación de un servlet `Controller2` que genera dinámicamente una tabla 3x3 numerada.

![Práctica 2](img/2.png)

---

# Práctica 3 - Tabla dinámica

Formulario HTML que solicita filas y columnas y genera una tabla dinámica utilizando parámetros recibidos por el servlet.

### Formulario

![Práctica 3 - Formulario](img/3.png)

### Resultado

![Práctica 3 - Resultado](img/3.2.png)

---

# Práctica 4 - GET y POST

Formulario que permite seleccionar el método de envío (GET o POST) y muestra un resultado diferente según el método utilizado.

### GET

![Práctica 4 - GET](img/4.png)

### POST

![Práctica 4 - POST](img/4.1.png)

---

# Práctica 5 - Contador de ejecuciones

Cada vez que se genera una tabla se incrementa un contador de ejecuciones mostrado en la página.

### Primera ejecución

![Práctica 5 - Ejecución 1](img/5.png)

### Segunda ejecución

![Práctica 5 - Ejecución 2](img/5.1.png)

### Tercera ejecución

![Práctica 5 - Ejecución 3](img/5.2.png)

---

# Práctica 6 - Validación

Validación en JavaScript y validación en servidor para impedir valores fuera de rango.

### Ejecución correcta

![Práctica 6](img/6.png)

### Página de error

![Práctica 6 - Error](img/6.1.png)

---

# Práctica 7 - Misma página

La petición y el resultado se muestran en la misma página utilizando el servlet correspondiente.

### GET

![Práctica 7 - GET](img/7.png)

### POST

![Práctica 7 - POST](img/7.1.png)

---

# Práctica 8 - Sesiones

Uso de `HttpSession` para mantener:

* Contador global.
* Contador local de sesión.
* Identificador de sesión.

También se estudia la cookie `JSESSIONID`.

![Práctica 8](img/8.png)

---

# Práctica 9 - Cookies

Almacenamiento de preferencias mediante cookies para recordar automáticamente los valores introducidos en el formulario.

![Práctica 9](img/9.png)

---

# Práctica 10 - Parámetros de inicialización

Lectura de parámetros:

* Globales mediante `web.xml`.
* Locales mediante anotaciones y configuración del servlet.

### Controller10_1

![Práctica 10 - Controller10\_1](img/10.png)

### Controller10_2

![Práctica 10 - Controller10\_2](img/10.1.png)

---

# Práctica 11 - Forward entre Servlets

Uso de `RequestDispatcher` para enviar información entre dos servlets.

## Controller11_1

* Recibe filas y columnas.
* Valida que no superen el valor 7.
* Envía los datos mediante atributos de petición.

## Controller11_2

* Recupera los atributos.
* Genera la tabla dinámica.
* Impide el acceso directo mostrando una página de error.

### Formulario

![Práctica 11 - Formulario](img/11.png)

### Resultado

![Práctica 11 - Resultado](img/11.1.png)

---

# Práctica 12 - Gestión de socios

Mini aplicación web para gestionar socios utilizando una colección en memoria.

Operaciones implementadas:

* Alta de socios.
* Consulta de socios.
* Baja de socios.

Datos gestionados:

* Nombre
* Apellidos
* NIF
* Correo electrónico

### Formulario

![Práctica 12 - Formulario](img/12.png)

### Alta

![Práctica 12 - Alta](img/12.1.png)

### Consulta

![Práctica 12 - Consulta](img/12.2.png)

### Baja

![Práctica 12 - Baja](img/12.3.png)

---

# Reflexión final

Estas prácticas permiten trabajar progresivamente con:

* Servlets
* Formularios HTML
* GET y POST
* Validaciones
* Cookies
* Sesiones
* Parámetros de inicialización
* RequestDispatcher y Forward
* Colecciones Java

Constituyen una base sólida para continuar con aplicaciones MVC más completas y sirven como preparación para ejercicios y exámenes posteriores.
