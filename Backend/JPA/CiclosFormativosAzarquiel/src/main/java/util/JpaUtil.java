package util;

import dao.PersistenceManager;
import jakarta.persistence.EntityManager;

/**
 * Clase de utilidad para no repetir Persistence Manager, 
 * EntityManagerFactory y createEntityManager.
 * Singleton significa una clase de la que solo existe una instancia. 
 * La aplicacion reutiliza siempre el mismo objeto. 
 * */


public class JpaUtil {

    public static EntityManager getEntityManager() {

    	// PersistenceManager -> EntityManagerFactory devuelve -> EntityManager
        return PersistenceManager
                .getInstance() // Obtiene el singleton
                .getEntityManagerFactory() // Obtiene la fábrica JPA: Un objeto que fabrica otros.
                .createEntityManager();
    }
}