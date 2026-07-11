package servlets;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.*;


/**
 * Servlet implementation class Controller4
 */
@WebServlet("/Controller8")
public class Controller8 extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	private static int contadorGeneral = 0; //Contador compartido por todos los usuarios. 
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Controller8() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
   protected void doGet(HttpServletRequest request,
        HttpServletResponse response)
        throws ServletException, IOException {

	   
	contadorGeneral++;
	
	HttpSession sesion = request.getSession(); //Obtenemos sesión
	Integer contadorLocal = (Integer) sesion.getAttribute("contador"); //Recuperamos contador local
	
	if(contadorLocal ==null) { //Inicializar o incrementar
		contadorLocal = 1;
	} else {
		contadorLocal++;
	}
	
	sesion.setAttribute("contador", contadorLocal); //Guardar en sesión.
	
	response.setContentType(
	        "text/html;charset=UTF-8");

	PrintWriter out =
	        response.getWriter();

	out.println("""
	<html>
	<body style='background:black;color:white;
	font-family:Arial'>
	""");

	out.println("<h1>Práctica 8</h1>");

	out.println("<h2>Contador general: "
	        + contadorGeneral +
	        "</h2>");

	out.println("<h2>Contador local: "
	        + contadorLocal +
	        "</h2>");

	out.println("<h3>Session ID:</h3>");

	out.println(sesion.getId());

	out.println("""
	</body>
	</html>
	""");
	
}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
 protected void doPost(HttpServletRequest request,
        HttpServletResponse response)
        throws ServletException, IOException {

    response.setContentType("text/html;charset=UTF-8");

    PrintWriter out = response.getWriter();

    out.println("""
    <html>
    <body style='background:black;color:white;font-family:Arial'>
        <h1>Práctica 7</h1>
        <h2>Has llegado mediante POST</h2>
    </body>
    </html>
    """);
}

}
