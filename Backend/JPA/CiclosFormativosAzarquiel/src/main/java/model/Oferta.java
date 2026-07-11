package model;

import java.io.Serializable;
import jakarta.persistence.*;


/**
 * The persistent class for the oferta database table.
 * 
 */
@Entity
@NamedQuery(name="Oferta.findAll", query="SELECT o FROM Oferta o")
public class Oferta implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	private int id;

	private int plazas;

	//bi-directional many-to-one association to Ciclo
	@ManyToOne
	private Ciclo ciclo;

	//bi-directional many-to-one association to y
	@ManyToOne
	@JoinColumn(name="ies_id")
	private Ies ies;

	//bi-directional many-to-one association to Turno
	@ManyToOne
	private Turno turno;

	public Oferta() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getPlazas() {
		return this.plazas;
	}

	public void setPlazas(int plazas) {
		this.plazas = plazas;
	}

	public Ciclo getCiclo() {
		return this.ciclo;
	}

	public void setCiclo(Ciclo ciclo) {
		this.ciclo = ciclo;
	}

	public Ies getIes() {
		return this.ies;
	}

	public void setIes(Ies ies) {
		this.ies = ies;
	}

	public Turno getTurno() {
		return this.turno;
	}

	public void setTurno(Turno turno) {
		this.turno = turno;
	}

}