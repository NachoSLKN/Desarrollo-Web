package servlets;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Servlet implementation class Controller3
 */
@WebServlet("/Controller3")
public class Controller3 extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Controller3() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
    protected void doGet(HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

    	response.setContentType("text/html;charset=UTF8");
    	
    	PrintWriter out = response.getWriter();
    	
        response.getWriter().println("HE ENTRADO EN EL SERVLET");

        String filas = request.getParameter("filas");
        String columnas = request.getParameter("columnas");

        System.out.println("FILAS = " + filas);
        System.out.println("COLUMNAS = " + columnas);
        
        int filasT = Integer.parseInt(filas);        
        int columnasT = Integer.parseInt(columnas);
        
        out.println("<h1>Filas: " + filasT + "</h1>");
        out.println("<h1>Filas: " + columnasT + "</h1>");

        int contador = 1;

        out.println("<table border='1'>");

        for (int i = 0; i < filasT; i++) {

            out.println("<tr>");

            for (int j = 0; j < columnasT; j++) {

                out.println("<td>" + contador + "</td>");

                contador++;
            }

            out.println("</tr>");
        }

        out.println("</table>");
        
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
