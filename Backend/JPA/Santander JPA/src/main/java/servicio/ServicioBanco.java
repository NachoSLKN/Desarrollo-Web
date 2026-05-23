package servicio;

import java.time.LocalDateTime;
import java.util.List;

import entidades.Cliente;
import entidades.Cuenta;
import entidades.Movimiento;
import excepciones.TransferenciaException;
import jakarta.persistence.EntityManager;
import util.JpaUtil;

// Clase central de la transferencia.
public class ServicioBanco {
	
	
	public void realizarTransferencia(int cuentaDeudora, int cuentaAcreedora, String concepto, double importe) 
			throws TransferenciaException{
      
		//Obtiene un EntityManager para trabajar con JPA y la BD.
		EntityManager em = JpaUtil.getEntityManager();
		
		// Abrimos transacción.
		em.getTransaction().begin();
		
		// Buscamos cuentas reales en BD.
		Cuenta cuentaDeudoraT = em.find(Cuenta.class, cuentaDeudora);
		Cuenta cuentaAcreedoraT = em.find(Cuenta.class,cuentaAcreedora);
		
		if (cuentaDeudoraT == null) {
			em.getTransaction().rollback();
			throw new TransferenciaException(
				    "La cuenta deudora no existe");
		} 
		
		if (cuentaAcreedoraT == null) {
			em.getTransaction().rollback();
			throw new TransferenciaException(
				    "La cuenta acreedora no existe");
		}
		
		
		if(cuentaDeudoraT.getDinero() < importe) {
			em.getTransaction().rollback();
			throw new TransferenciaException(
				    "Saldo insuficiente");
		}
		
		cuentaDeudoraT.setDinero(cuentaDeudoraT.getDinero()-importe);		
		cuentaAcreedoraT.setDinero(cuentaAcreedoraT.getDinero()+importe);

		
		Movimiento movCargo = new Movimiento();
		Movimiento movIngreso = new Movimiento();
		
		movCargo.setCantidad(importe);
		movCargo.setConcepto(concepto);
		movCargo.setFecha(LocalDateTime.now());
		movCargo.setCuenta(cuentaDeudoraT);
		
		movIngreso.setCantidad(importe);
		movIngreso.setConcepto(concepto);
		movIngreso.setFecha(LocalDateTime.now());
		movIngreso.setCuenta(cuentaAcreedoraT);
		
		em.persist(movCargo);
		em.persist(movIngreso);
		
		em.getTransaction().commit();
		em.close();
		
		//em.getTransaction().rollback();
		
		
		
	}
	
	public List<Movimiento> obtenerMovimientosCuenta(int numeroCuenta) 
			throws TransferenciaException {
		EntityManager em =
			    JpaUtil.getEntityManager();
		
		Cuenta cuentaMovimiento = em.find(Cuenta.class, numeroCuenta);
		
		
		if (cuentaMovimiento == null) {
			//em.getTransaction().rollback(); No hacemos rollback porque no hay transacción, solo consulta.
			throw new TransferenciaException(
				    "La cuenta deudora no existe");
		} else {
			
		//query
		List<Movimiento> lista = 
		em.createQuery("SELECT m "
				+ "FROM Movimiento m "
				+ "Where m.cuenta = :cuenta "
				+ "order by m.fecha DESC", Movimiento.class)
		.setParameter("cuenta", cuentaMovimiento)
		.getResultList();
		
		em.close();
		
		return lista;
		}
		
	}

	public List<Cliente> obtenerClientes() {
		EntityManager em =
			    JpaUtil.getEntityManager();
		
		List<Cliente> lista = 
				em.createNamedQuery("Cliente.findAll")
				.getResultList();
		return lista;
	}
	
	
}
