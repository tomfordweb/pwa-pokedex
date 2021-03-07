import { LiteralMapEntry } from "@angular/compiler/src/output/output_ast";
import { createReducer, on, Action } from "@ngrx/store";
import { extractIdFromEndOfUrl } from "../lib/extract-id-from-url";
import { Pokedex } from "../lib/pokedex/pokedex";
import { PokedexApiResponse } from "../lib/pokedex/pokedex-api-response";

import {
  retreivedAllPokedexesForGame,
  retreivedPokedexContents,
} from "./pokedex.actions";

export const initialState: ReadonlyArray<Pokedex> = [];

export const createPokedexFromPokedexApiResponse = (
  response: PokedexApiResponse
) => {
  return;
};

export const pokedexApiFactory = (PokedexApiResponse: PokedexApiResponse) => {
  const pokedex: Pokedex = {
    id: PokedexApiResponse.id,
    is_main_series: PokedexApiResponse.is_main_series,
    name: PokedexApiResponse.name,
    gameVersion: PokedexApiResponse.gameVersion,
    pokemon: PokedexApiResponse.pokemon_entries.map((entry) => {
      return {
        entry: entry.entry_number,
        id: extractIdFromEndOfUrl(entry.pokemon_species.url),
      };
    }),
  };
  return pokedex;
};
export const pokedexReducer = createReducer(
  initialState,
  on(retreivedAllPokedexesForGame, (state, { MultiplePokedexApiResponse }) => {
    console.log("reducing multiple pokedexes", MultiplePokedexApiResponse);
    const pokedexNew = Object.values(
      MultiplePokedexApiResponse
    ).map((pokedexApi) => pokedexApiFactory(pokedexApi));
    return [...state, ...pokedexNew];
  }),
  on(retreivedPokedexContents, (state, { PokedexApiResponse }) => {
    const pokedex = pokedexApiFactory(PokedexApiResponse);
    return [...state, pokedex];
  })
);
