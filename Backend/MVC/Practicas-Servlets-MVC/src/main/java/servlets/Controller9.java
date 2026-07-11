package servlets;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.*;

/**
 * Servlet implementation class Controller9
 */
@WebServlet("/Controller9")
public class Controller9 extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Controller9() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request,
		HttpServletResponse response)
		throws ServletException, IOException {

	String filas =
			request.getParameter("filas");

	String columnas =
			request.getParameter("columnas");
	
	String recordar = request.getParameter("recordar");
	
	if(recordar != null){

	    Cookie cookieFilas =
	            new Cookie("filas", filas);

	    Cookie cookieColumnas =
	            new Cookie("columnas", columnas);

	    cookieFilas.setMaxAge(600);
	    cookieColumnas.setMaxAge(600);

	    response.addCookie(cookieFilas);
	    response.addCookie(cookieColumnas);
	}

	response.setContentType(
			"text/html;charset=UTF-8");

	PrintWriter out =
			response.getWriter();

	out.println("""
	<html>
	<body style='background:black;color:white;font-family:Arial'>
	""");

	out.println("<h1>Práctica 9</h1>");

	out.println("<h2>Filas: "
			+ filas +
			"</h2>");

	out.println("<h2>Columnas: "
			+ columnas +
			"</h2>");
	
	Cookie[] cookies = request.getCookies();

	if(cookies != null){

	    out.println("<h2>Cookies encontradas:</h2>");

	    for(Cookie c : cookies){

	        out.println(
	                c.getName()
	                + " = "
	                + c.getValue()
	                + "<br>");
	    }
	}
	
	

	out.println("""
	</body>
	</html>
	""");
}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
