import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { Hero } from './hero';
import { MessageService } from './message.service';
import { GraphQLService, GQLOptions } from './graphql.service';

const options: GQLOptions = {
  readAll: gql`query readAll{allHeroes{nodes{id,name}}}`,
  readById: gql`query readById($id:Int!){heroById(id:$id){id,name}}`,
  readWithTerm: gql`query readWithTerm($term:String!){allHeroes(term:$term){nodes{id,name}}}`,
  create: gql`mutation create($name:String!)
    {createHero(input:{clientMutationId:"toh-createHero",hero:{name:$name}})
      {clientMutationId,hero{id,name}}}`,
  update: gql`mutation update($id:Int!,$name:String!)
    {updateHeroById(input:{clientMutationId:"toh-updateHero",id:$id,heroPatch:{name:$name}})
      {clientMutationId,hero{id,name}}}`,
  delete: gql`mutation delete($id:Int!)
    {deleteHeroById(input:{clientMutationId:"toh-deleteHero",id:$id})
      {clientMutationId,hero{id,name}}}`,
  deleteById: gql`mutation deleteById($id:Int!)
    {deleteHeroById(input:{clientMutationId:"toh-deleteHeroById",id:$id})
      {clientMutationId,hero{id,name}}}`
};

@Injectable()
export class HeroService {

  constructor(
    private graphQLService: GraphQLService
  ) { }

  /** Get all heroes from the server */
  getHeroes (): Observable<Hero[]> {
    return this.graphQLService.readAll<{allHeroes:{nodes:Hero[]}}>(options).pipe(
      map((data) => data.allHeroes.nodes))
  }

  /** Get a hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    return this.graphQLService.readById<{heroById:Hero}>(options, id).pipe(
      map((data) => data.heroById))
  }

  /* Get all heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {return of([]);} // if not search term, return empty hero array.
    return this.graphQLService.readWithTerm<{allHeroes:{nodes:Hero[]}}>(options, term).pipe(
      map((data) => data.allHeroes.nodes))
  }

  //////// Save methods //////////

  /** Add a new hero to the server */
  addHero (hero: Hero): Observable<Hero> {
    return this.graphQLService.create<{createHero:{hero:Hero}}>(options, hero).pipe(
      map((data) => data.createHero.hero))
  }

  /** Delete the hero from the server */
  deleteHero (hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    return this.graphQLService.delete<{deleteHeroById:{hero:Hero}}>(options, {"id": id}).pipe(
      map((data) => data.deleteHeroById.hero))
  }


  /** Update the hero on the server */
  updateHero (hero: Hero): Observable<Hero> {
    return this.graphQLService.update<{updateHeroById:{hero:Hero}}>(options, hero).pipe(
      map((data) => data.updateHeroById.hero))
  }

}
