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
@WebServlet("/Controller5")
public class Controller5 extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	private static int contador2 =0;
	
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Controller5() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
    protected void doGet(HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        contador2++;

        response.setContentType("text/html;charset=UTF-8");

        PrintWriter out = response.getWriter();

        out.println("""
        <html>
        <head>
            <title>Práctica 5</title>
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

        out.println("<h1>Práctica 5</h1>");
        out.println("<h2>Ejecución número " + contador2 + "</h2>");
        
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
