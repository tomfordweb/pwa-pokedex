import { createReducer, on, Action } from "@ngrx/store";
import { extractIdFromEndOfUrl } from "../lib/extract-id-from-url";
import { GameVersion } from "../lib/game-version/game-version";
import { PokedexApiResponse } from "../lib/pokedex/pokedex-api-response";
import { Pokemon } from "../lib/pokemon/pokemon";
import { AppState } from "./app.state";

import { retreiveGameVersionList } from "./game-versions.actions";
import {
  retreivedPokemon,
  retrievedPokemonInformationFromMultiplePokedexResponse,
} from "./pokemon.actions";

export const initialState: ReadonlyArray<Pokemon> = [];

export const factoryBasicPokemonInformationFromPokedexApiResponse = (
  PokedexApiResponse: PokedexApiResponse
) => {
  const pokemonBasic: Pokemon[] = PokedexApiResponse.pokemon_entries.map(
    (pokemon) => {
      return {
        name: pokemon.pokemon_species.name,
        id: extractIdFromEndOfUrl(pokemon.pokemon_species.url),
        url: pokemon.pokemon_species.url,
      };
    }
  );
  return pokemonBasic;
};

export const pokemonReducer = createReducer(
  initialState,
  on(retreivedPokemon, (state, { PokemonApi }) => {
    console.log(state);
    const existingPokemon = state.findIndex(
      (pokemon) => pokemon.id === PokemonApi.id
    );
    if (existingPokemon === -1) {
      return [...state, ...[PokemonApi]];
    }
    const newPokemon = {
      ...state[existingPokemon],
      ...PokemonApi,
    };
    state = state.map((existingState) => {
      if (existingState.id === newPokemon.id) {
        return newPokemon;
      }
      return existingState;
    });

    return [...state];
  }),
  on(
    retrievedPokemonInformationFromMultiplePokedexResponse,
    (state, { MultiplePokedexApiResponse }) => {
      const manyPokedexes = Object.values(MultiplePokedexApiResponse)
        .map((item) =>
          factoryBasicPokemonInformationFromPokedexApiResponse(item)
        )
        .reduce((accumulator, pokedex) => accumulator.concat(pokedex), []);

      return [...state, ...manyPokedexes];
    }
  )
);
