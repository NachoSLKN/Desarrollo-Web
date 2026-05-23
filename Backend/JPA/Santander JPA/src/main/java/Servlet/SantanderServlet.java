package Servlet;

//EntityManager, objeto principal de JPA para hacer consultas y operaciones con la BD.
import jakarta.persistence.EntityManager; 

//ServletException importa excepciones relacionadas con servlets.
import jakarta.servlet.ServletException;

//Permite usarla anotación @WebServlet para definir la URL del servlet
import jakarta.servlet.annotation.WebServlet;

//Importa HttpServlet, la clase TestServlet heredará de ella para comportarse como servlet web.
import jakarta.servlet.http.HttpServlet;

//HttpServletRequest representa la petición HTTP enviada por el usuario.
import jakarta.servlet.http.HttpServletRequest;

//HttpServletResponse representa la respuesta HTTP que devolverá el servlet.
import jakarta.servlet.http.HttpServletResponse;


import entidades.Cliente;

//JpaUtil es una clase auxiliar que devuelve EntityManager.
import util.JpaUtil;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import servicio.ServicioBanco;
import excepciones.TransferenciaException;

//Define la URL del servlet. Cuando el usuario entra en /TestServlet, Payara ejecuta esta clase.
@WebServlet("/SantanderServlet")

//La clase hereda de HttpServlet para funcionar como servlet web.
public class SantanderServlet extends HttpServlet {

	//Identificador de serialización de Java. Normalmente se deja generado automáticamente. 
    private static final long serialVersionUID = 1L;

    //Construtor del servlet. super() llama al constructor de HttpServlet.
    public SantanderServlet() {
        super();
    }

    //doGet: Método que se ejecuta cuando llega una petición GET. Muestra páginas.
    protected void doGet(
    		//request: contiene datos enviados por el usuario.
            HttpServletRequest request,
            //response: contiene la respuesta que devolverá el servlet.
            HttpServletResponse response)
    		//Indica el método que puede lanzar excepciones web o de entrada/salida.
            throws ServletException, IOException {
    	
    	//Define que la respuesta será HTML codificado en UTF-8.
        response.setContentType("text/html;charset=UTF-8");
        
        //Obtenemos el dispatcher hacia clientes.jsp y con forward enviamos internamente request y response a la JSP.
        //request.getRequestDispatcher("/WEB-INF/clientes.jsp").forward(request, response);
        
        request.getRequestDispatcher(
    		    "/web.jsp")
    		    .forward(request, response);
        
        
       
    }
      

    //doPost procesa datos enviados.
    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

       // Lee el parámetro cuentaDeudora  del formulario y lo convierte de String a int.
       int Cuentadeudora = Integer.parseInt(request.getParameter("cuentaDeudora"));
       // Lee el parámetro cuentaAcreedora del formulario y lo convierte de String a int. 
       int CuentaAcreedora = Integer.parseInt(request.getParameter("cuentaAcreedora"));  
       // Lee el importe del formulario y lo convierte de String a double.
       double importe = Double.parseDouble(request.getParameter("importe"));
       // Lee el concepto del formulario. No se parsea porque ya es String.
       String concepto = (request.getParameter("concepto")); 
       
       // Creamos el servicio, que contiene la lógica de negocio. 
       ServicioBanco servicio = new ServicioBanco();
       
       try {
    	   // Llamamos al servicio para realizar la transferencia puesto que el Servlet delega la lógica a la capa del Servicio.
    	   servicio.realizarTransferencia(
    			   Cuentadeudora,
    			   CuentaAcreedora,
    			   concepto,
    			   importe); 
    	   
    	   // Si no ha saltado excepción, guardamos mensaje de éxito para la JSP.
       request.setAttribute(
    		   "mensaje",
    		   "Transferencia realizada correctamente");
       }
       
       
       catch(TransferenciaException e) {
    	   
    	// Si el servicio lanza error, guardamos el mensaje para mostrarlo en la JSP.
    	request.setAttribute("error", e.getMessage());
       
       }
       
       // ENviamos la misma request y response a resultado.jsp.
       request.getRequestDispatcher("/WEB-INF/resultados.jsp").forward(request, response);
       
      
    }
    
    
}