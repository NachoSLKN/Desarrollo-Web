import "./PokemonDetails.css";

function PokemonDetails(props) {
    const {pokemon} = props;
    return (

        <section className="selected-pokemon">
            <div className="pokemon-container">
            <h2 className="text">{pokemon.name}
            <img src={pokemon.sprites.front_default} 
            alt="pokemon img" 
            className="pokemon-img"
            />
            <h3 className="text">HP:{pokemon.stats[0].base_stat}</h3>
            </h2>
            </div>
        </section>
  )
}
export default PokemonDetails;
