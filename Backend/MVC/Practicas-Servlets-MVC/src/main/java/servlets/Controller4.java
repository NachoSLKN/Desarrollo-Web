package servlets;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Servlet implementation class Controller4
 */
@WebServlet("/Controller4")
public class Controller4 extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Controller4() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
    protected void doGet(HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType(
                "text/html;charset=UTF-8");

        PrintWriter out =
                response.getWriter();

        out.println("""
        <html>
        <head>
            <title>Práctica 4</title>
            <style>
                body{
                    background:black;
                    color:white;
                    font-family:Arial;
                    margin:40px;
                }
            </style>
        </head>
        <body>

            <h1>Práctica 4</h1>

            <h2>Petición realizada mediante GET</h2>

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

    response.setContentType(
            "text/html;charset=UTF-8");

    request.setCharacterEncoding("UTF-8");

    PrintWriter out =
            response.getWriter();

    out.println("""
    <html>
    <head>
        <title>Práctica 4</title>
        <style>
            body{
                background:black;
                color:white;
                font-family:Arial;
                margin:40px;
            }
        </style>
    </head>
    <body>

        <h1>Práctica 4</h1>

        <h2>Petición realizada mediante POST</h2>

    </body>
    </html>
    """);
}

}
