package Servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.*;
import servicio.ServicioIes;

import java.io.IOException;
import java.util.List;

/**
 * Servlet implementation class ControladorCiclos
 */
@WebServlet("/ControladorCiclos")
public class ControladorCiclos extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ControladorCiclos() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) 
			throws ServletException, IOException {
		// TODO Auto-generated method stub

	String operacion = request.getParameter("operacion"); //Lee la URL del parámetro
	
	if("inicio".equals(operacion)) { //Si URL es inicio...

	    ServicioIes servicio =
	            new ServicioIes(); //Crea el objeto servicio.

	    List<Ies> institutos =
	            servicio.listar(); //Servicio: listado con todos los institutos.

	    request.setAttribute( //Guarda la lsta dentro de la petición.
	            "institutos",
	            institutos);

	    request.getRequestDispatcher(
	            "/WEB-INF/inicio.jsp") //Localiza el JSP
	            .forward(request, response); //Le pasa el control. 
	}
	
	else if ("verOferta".equals(operacion)) {
		int idIes = Integer.parseInt(request.getParameter("idIes"));
		
		ServicioIes servicio = new ServicioIes();
		List<Ies> institutos = servicio.listar();
		List<Oferta> ofertas = servicio.listarOfertasPorIes(idIes);
		
		request.setAttribute("institutos", institutos);
		request.setAttribute("ofertas", ofertas);
		request.setAttribute("idIesSeleccionado", idIes);

		request.getRequestDispatcher("/WEB-INF/inicio.jsp").forward(request, response);
		
	}
	
	else if ("editar".equals(operacion)) {
		int idOferta = Integer.parseInt(request.getParameter("idOferta"));
		
		ServicioIes servicio = new ServicioIes();
		
		Oferta oferta = servicio.buscarOfertaPorId(idOferta);
		
		request.setAttribute("oferta", oferta);
		
		request.getRequestDispatcher("/WEB-INF/editar.jsp").forward(request, response);
	}
	
	else if ("modificar".equals(operacion)) {
		int idOferta=Integer.parseInt(request.getParameter("idOferta"));
		int plazas = Integer.parseInt(request.getParameter("plazas"));
		ServicioIes servicio = new ServicioIes();
		Oferta oferta = servicio.buscarOfertaPorId(idOferta);
		
		int idIes = oferta.getIes().getId();
		
		servicio.modificarPlazas(idOferta, plazas);
		
		
		List<Ies> institutos = servicio.listar();
		List<Oferta> ofertas = servicio.listarOfertasPorIes(idIes);
		
		
		request.setAttribute("institutos", institutos);
		request.setAttribute("ofertas", ofertas);
		request.setAttribute("idIesSeleccionado", idIes);
		request.setAttribute("mensaje", "Oferta modificada correctamente");

		
		request.getRequestDispatcher("/WEB-INF/inicio.jsp").forward(request, response);
		
		
		
		
	}
		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
