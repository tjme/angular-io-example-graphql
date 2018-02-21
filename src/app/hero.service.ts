import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map, tap } from 'rxjs/operators';
import { Hero } from './hero';
import { GraphQLService } from './graphql.service';

@Injectable()
export class HeroService {

  constructor(
    private gqlService: GraphQLService
  ) { }

  /** Get all heroes from the server */
  getHeroes (): Observable<Hero[]> {
    return this.gqlService.query<{allHeroes:{nodes:Hero[]}}>(
      gql`query readAllHeroes{allHeroes{nodes{id,name}}}`
    ).pipe(map((data) => data.allHeroes.nodes))}

  /** Get a hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    return this.gqlService.query<{heroById:Hero}>(
      gql`query readHeroById($id:Int!){heroById(id:$id){id,name}}`,
      {'id': id},
      'readHeroById'
    ).pipe(map((data) => data.heroById))}

  /* Get all heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {return of([]);} // if not search term, return empty hero array.
    return this.gqlService.query<{herowithterm:{nodes:Hero[]}}>(
      gql`query readHeroesWithTerm($term:String!){herowithterm(term:$term){nodes{id,name}}}`,
      {'term': term},
      'readHerosWithTerm'
    ).pipe(map((data) => data.herowithterm.nodes))}

  //////// Save methods //////////

  /** Add a new hero to the server */
  addHero (hero: Hero): Observable<Hero> {
    return this.gqlService.mutate<{createHero:{hero:Hero}}>(
      gql`mutation create($name:String!)
        {createHero(input:{hero:{name:$name}})
          {hero{id,name}}}`,
      hero, 'create').pipe(map((data) => data.createHero.hero))}

  /** Delete the hero from the server */
  deleteHero (hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    return this.gqlService.mutate<{deleteHeroById:{hero:Hero}}>(
      gql`mutation delete($id:Int!)
        {deleteHeroById(input:{id:$id})
          {hero{id,name}}}`,
      {'id': id}, 'delete').pipe(map((data) => data.deleteHeroById.hero))}

  /** Update the hero on the server */
  updateHero (hero: Hero): Observable<Hero> {
    return this.gqlService.mutate<{updateHeroById:{hero:Hero}}>(
      gql`mutation update($id:Int!,$name:String!)
        {updateHeroById(input:{id:$id,heroPatch:{name:$name}})
          {hero{id,name}}}`,
      hero, 'update').pipe(map((data) => data.updateHeroById.hero))}

}
