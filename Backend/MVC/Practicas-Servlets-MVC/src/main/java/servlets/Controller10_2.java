package servlets;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Servlet implementation class Controller09
 */
//@WebServlet("/Controller09") Quitamos la anotación WEBSERVLET porque lo estamos configurando desde web.xml
public class Controller10_2 extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Controller10_2() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		String parametroGlobal =
		        getServletContext()
		        .getInitParameter("parametroGlobal");

		String parametroLocal =
		        getServletConfig()
		        .getInitParameter("parametroLocal");
		
		response.setContentType(
				"text/html;charset=UTF-8");

		PrintWriter out =
				response.getWriter();
		
		out.println("<h1>Práctica 10</h1>");

		out.println("<h2>Global:</h2>");
		out.println(parametroGlobal);

		out.println("<h2>Local:</h2>");
		out.println(parametroLocal);
	
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
