import { Component, Input, OnInit } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { filter, switchMap, tap } from "rxjs/operators";
import { GameVersion } from "src/app/lib/game-version/game-version";
import { PokedexService } from "src/app/lib/pokedex/pokedex.service";
import { selectGameVersionByRouterParam } from "src/app/state/game-versions.selector";
import { retreivedAllPokedexesForGame } from "src/app/state/pokedex.actions";
import { selectActivePokedexByGameVersionRouterParam } from "src/app/state/pokedex.selector";
import { retreivedBasicSpeciesListFromPokedex } from "src/app/state/pokemon-species.actions";

@Component({
  selector: "app-select-a-pokemon",
  template: ` <div
    *ngIf="{
      pokedexes: currentPokedexes$ | async,
      currentGame: currentGame$ | async
    } as baseObservables"
    id="select-a-pokemon"
  >
    <ng-container *ngFor="let pokedex of baseObservables.pokedexes">
      <h4 class="title">Displaying {{ pokedex.pokemon.length }} Pokemon</h4>

      <app-pokemon-card
        *ngFor="let pokemon of pokedex.pokemon"
        [pokemon]="pokemon"
      >
        {{ pokemon.entry }}<br />
        {{ pokemon.name }}
      </app-pokemon-card>
    </ng-container>
  </div>`,
  styleUrls: ["./select-a-pokemon.component.scss"],
})
export class SelectAPokemonComponent implements OnInit {
  currentGame$ = this.store
    .pipe(select(selectGameVersionByRouterParam))
    .pipe(filter((game) => !!game));

  // take the current game version based on router params
  // and then grab the pokedex relative the the :version router param
  currentPokedexes$ = this.currentGame$.pipe(
    switchMap((gameVersion: GameVersion) => {
      // Now that we have our GameVersion, get the Pokedex
      return this.pokedexService.getPokedexByGameVersion$(gameVersion).pipe(
        tap((MultiplePokedexApiResponse) => {
          this.store.dispatch(
            retreivedAllPokedexesForGame({ MultiplePokedexApiResponse })
          );
          this.store.dispatch(
            retreivedBasicSpeciesListFromPokedex({
              MultiplePokedexApiResponse,
            })
          );
        })
      );
    }),
    switchMap((data) => {
      return this.store.pipe(
        select(selectActivePokedexByGameVersionRouterParam),
        filter((pd) => pd !== null)
      );
    })
  );

  constructor(private store: Store, private pokedexService: PokedexService) {}

  ngOnInit(): void {}
}
