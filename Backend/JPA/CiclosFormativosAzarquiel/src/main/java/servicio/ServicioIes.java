package servicio;

import java.util.List;

import dao.DaoIes;
import model.*;


public class ServicioIes {

    private DaoIes dao =
            new DaoIes();

    public List<Ies> listar(){

        return dao.listar();
    }
    
    
    public List <Oferta>listarOfertasPorIes(int idIes){
    	return dao.listarOfertasPorIes(idIes);
    }
    
    
    public Oferta buscarOfertaPorId(int idOferta) {
    	return dao.buscarOfertaPorId(idOferta);
    }
    
    public void modificarPlazas(int idOferta, int plazas) {
    	dao.modificarPlazas(idOferta, plazas);
    }
    
}