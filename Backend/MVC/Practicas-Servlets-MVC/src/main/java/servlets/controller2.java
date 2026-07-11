package servlets;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Servlet implementation class controller2
 */
@WebServlet("/controller2")
public class controller2 extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public controller2() {
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

    out.println("""
    <html>
    <head>
        <title>Práctica 2</title>
        <style>
            body{
                background:black;
                color:white;
                font-family:Arial;
                margin:40px;
            }

            table{
                border-collapse:collapse;
            }

            td{
                border:1px solid white;
                padding:15px;
                text-align:center;
            }
        </style>
    </head>
    <body>

        <h1>Tabla 3x3</h1>

        <table>

            <tr>
                <td>1</td>
                <td>2</td>
                <td>3</td>
            </tr>

            <tr>
                <td>4</td>
                <td>5</td>
                <td>6</td>
            </tr>

            <tr>
                <td>7</td>
                <td>8</td>
                <td>9</td>
            </tr>

        </table>

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
