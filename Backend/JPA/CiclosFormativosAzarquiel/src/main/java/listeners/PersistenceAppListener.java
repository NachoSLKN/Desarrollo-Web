package listeners;

import dao.PersistenceManager;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class PersistenceAppListener
        implements ServletContextListener {

    @Override
    public void contextDestroyed(
            ServletContextEvent sce) {

        PersistenceManager
                .getInstance()
                .closeEntityManagerFactory();

        System.out.println(
                "ENTITY MANAGER FACTORY CERRADO");
    }
}