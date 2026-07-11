package excepciones;

public class BasededatosException
        extends Exception {

    /**
	     * 
	     */
	    private static final long serialVersionUID = 1L;

	public BasededatosException(
            String mensaje,
            Throwable causa) {

        super(mensaje, causa);
    }
}