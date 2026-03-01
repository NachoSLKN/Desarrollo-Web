import { useState } from 'react'
import './App.css'
import PokemonList from './components/PokemonList'
import PokemonDetails from './components/PokemonDetails'

function App() {

  const [selectedPokemon, setSelectedPokemon] = useState();


  return (
    <>
      {selectedPokemon && (
        <div>
          <h2>Pokémon seleccionado:</h2>
        <PokemonDetails pokemon={selectedPokemon} />
        </div>
      )}


      <h2>Pokédex</h2>
      <PokemonList selectPokemon={setSelectedPokemon}></PokemonList>

    </>
  )
}

export default App
