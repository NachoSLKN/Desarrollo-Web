package model;

import java.io.Serializable;
import jakarta.persistence.*;
import java.util.List;


/**
 * The persistent class for the ciclo database table.
 * 
 */
@Entity
@NamedQuery(name="Ciclo.findAll", query="SELECT c FROM Ciclo c")
public class Ciclo implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	private int id;

	private String nombre;

	//bi-directional many-to-one association to Oferta
	@OneToMany(mappedBy="ciclo")
	private List<Oferta> ofertas;

	public Ciclo() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getNombre() {
		return this.nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public List<Oferta> getOfertas() {
		return this.ofertas;
	}

	public void setOfertas(List<Oferta> ofertas) {
		this.ofertas = ofertas;
	}

	public Oferta addOferta(Oferta oferta) {
		getOfertas().add(oferta);
		oferta.setCiclo(this);

		return oferta;
	}

	public Oferta removeOferta(Oferta oferta) {
		getOfertas().remove(oferta);
		oferta.setCiclo(null);

		return oferta;
	}

}