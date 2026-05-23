package test;

import java.util.List;

import entidades.Cliente;
import jakarta.persistence.EntityManager;
import util.JpaUtil;

public class TestConexion {

    public static void main(String[] args) {

        EntityManager em =
                JpaUtil.getEntityManager();

        List<Cliente> lista =
                em.createNamedQuery(
                        "Cliente.findAll",
                        Cliente.class)
                .getResultList();

        for(Cliente c : lista) {

            System.out.println(
                    c.getNombre()
                    + " - "
                    + c.getSaldo());
        }

        em.close();
    }
}