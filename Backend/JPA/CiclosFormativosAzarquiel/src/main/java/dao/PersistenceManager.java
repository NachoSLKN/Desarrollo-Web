package dao;

import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

public class PersistenceManager {

	private static final String UNIDAD_PERSISTENCIA =
	        "ciclosformativos";

    private static PersistenceManager instance;

    private EntityManagerFactory emf;

    private PersistenceManager() {
    }

    public static PersistenceManager getInstance() {

        if(instance == null) {
            instance = new PersistenceManager();
        }

        return instance;
    }

    public EntityManagerFactory getEntityManagerFactory() {

        if(emf == null) {

            emf = Persistence.createEntityManagerFactory(
                    UNIDAD_PERSISTENCIA);

            System.out.println(
                    "ENTITY MANAGER FACTORY CREADO");
        }

        return emf;
    }

    public void closeEntityManagerFactory() {

        if(emf != null && emf.isOpen()) {

            emf.close();

            System.out.println(
                    "ENTITY MANAGER FACTORY CERRADO");
        }
    }
}