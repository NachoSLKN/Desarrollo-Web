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
@WebServlet("/Controller6")
public class Controller6 extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Controller6() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
   protected void doGet(HttpServletRequest request,
        HttpServletResponse response)
        throws ServletException, IOException {

    response.setContentType("text/html;charset=UTF-8");

    PrintWriter out = response.getWriter();

    String filas = request.getParameter("filas");
    String columnas = request.getParameter("columnas");

    int filasT = Integer.parseInt(filas);
    int columnasT = Integer.parseInt(columnas);
    
    if(filasT > 7 || columnasT > 7) {

        response.sendRedirect(
            "Error.html");

        return;
    }

    out.println("""
    <html>
    <head>
        <title>Práctica 6</title>
        <style>
            body{
                background:black;
                color:white;
                font-family:Arial;
                margin:40px;
            }

            table{
                border-collapse:collapse;
                margin-top:20px;
            }

            td{
                border:1px solid white;
                padding:15px;
                text-align:center;
            }
        </style>
    </head>
    <body>
    """);

    out.println("<h1>Práctica 6 - Tabla dinámica</h1>");

    out.println("<h2>Filas: " + filasT + "</h2>");
    out.println("<h2>Columnas: " + columnasT + "</h2>");

    int contador = 1;

    out.println("<table>");

    for (int i = 0; i < filasT; i++) {

        out.println("<tr>");

        for (int j = 0; j < columnasT; j++) {

            out.println("<td>" + contador + "</td>");

            contador++;
        }

        out.println("</tr>");
    }

    out.println("</table>");

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
