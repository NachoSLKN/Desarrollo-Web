package dao;

import java.util.List;

import jakarta.persistence.EntityManager;
import model.Ies;
import util.JpaUtil;
import model.Oferta;

public class DaoIes {

	public List<Ies> listar() {

		EntityManager em = JpaUtil.getEntityManager();
		return em.createNamedQuery("Ies.findAll", Ies.class).getResultList();
	}

	public List<Oferta> listarOfertasPorIes(int idIes) {

		EntityManager em = JpaUtil.getEntityManager();
		return em.createQuery(
				"SELECT o FROM Oferta o WHERE o.ies.id = :idIes", Oferta.class).setParameter("idIes", idIes)
				.getResultList();

	}
	
	public Oferta buscarOfertaPorId(int idOferta) {
		EntityManager em = JpaUtil.getEntityManager();
		return em.find(Oferta.class, idOferta);
		
	}
	
	
	public void modificarPlazas(int idOferta, int plazas) {
		EntityManager em = JpaUtil.getEntityManager();
		em.getTransaction().begin();
		Oferta oferta = em.find(Oferta.class, idOferta);
		oferta.setPlazas(plazas);
		em.getTransaction().commit();
	
	
	
	
	}

}