package Servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import servicio.ServicioBanco;

import java.io.IOException;
import java.util.List;

import entidades.Cliente;

/**
 * Servlet implementation class SantanderClientesServlet
 */
@WebServlet("/SantanderClientesServlet")
public class SantanderClientesServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public SantanderClientesServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		
		ServicioBanco servicio =
			    new ServicioBanco();
		
		List<Cliente> lista =
			    servicio.obtenerClientes();
		
		request.setAttribute(
			    "clientes",
			    lista);
		
		
		request.getRequestDispatcher(
    		    "/clientes.jsp")	    
		.forward(request, response);

	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
