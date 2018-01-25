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
import { validateConfig } from '@angular/router/src/config';

const heroesUrl = 'http://localhost:5000/graphql';  // URL to web api
const allHeroes=gql`query tohAllHero{allHeroes{nodes{id,name}}}`;
const heroById=gql`query tohHeroByID($id:Int!){heroById(id:$id){id,name}}`;
const heroWithTerm=gql`query tohHeroWithTerm($term:String!){herowithterm(term:$term){nodes{id,name}}}`;
const createHero=gql`mutation tohCreateHero($name:String!){createHero(input:{clientMutationId:"toh-createHero",hero:{name:$name}}){clientMutationId,hero{id,name}}}`;
const updateHero=gql`mutation tohUpdateHeroById($id:Int!,$name:String!){updateHeroById(input:{clientMutationId:"toh-updateHero",id:$id,heroPatch:{name:$name}}){clientMutationId,hero{id,name}}}`;
const deleteHero=gql`mutation tohDeleteHeroById($id:Int!){deleteHeroById(input:{clientMutationId:"toh-deleteHero",id:$id}){clientMutationId,hero{id,name}}}`;

@Injectable()
export class HeroService {

  constructor(
    private messageService: MessageService,
    private apollo: Apollo,
    private httpLink: HttpLink
  ) {
    apollo.create({
      link: httpLink.create({ uri: heroesUrl }),
      cache: new InMemoryCache()
    });
  }

  /** Get all heroes from the server */
  getHeroes (): Observable<Hero[]> {
    return this.apollo.query<{allHeroes:{nodes:Hero[]}}>({query: allHeroes}).pipe(
        map(({data})=>data.allHeroes.nodes),
        tap(heroes => this.log(`fetched heroes`)),
        catchError(this.handleError('getHeroes', []))
      );
  }

  /** Get a hero by id. Return `undefined` when id not found */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    return this.apollo.query<{heroById:Hero}>({query: heroById, variables: {id: id}}).pipe(
        map(({data}) => data.heroById), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  /** Get a hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    return this.apollo.query<{heroById:Hero}>({query: heroById, variables: {id: id}}).pipe(
      map(({data}) => data.heroById), // returns a {0|1} element array
      tap(_ => this.log(`fetched hero id=${id}`)),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  /* Get all heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }
    return this.apollo.watchQuery<{herowithterm:{nodes:Hero[]}}>({query: heroWithTerm, variables: {term: term}}).valueChanges.pipe(
      map(({data})=>data.herowithterm.nodes),
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  //////// Save methods //////////

  /** Add a new hero to the server */
  addHero (hero: Hero): Observable<Hero> {
    return this.apollo.mutate<{createHero:{hero:Hero}}>({mutation: createHero, variables: {name: hero.name}}).pipe(
      map(({data}) => data.createHero.hero), // returns a {0|1} element array
      tap(_ => this.log(`added hero id=${_.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /** Delete the hero from the server */
  deleteHero (hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    return this.apollo.mutate({mutation: deleteHero, variables: {id: id}}).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  /** Update the hero on the server */
  updateHero (hero: Hero): Observable<Hero> {
    return this.apollo.mutate({mutation:updateHero, variables: hero}).pipe(
      tap(_ => this.log(`updated hero id=${hero.id} new name=${hero.name}`)),
      catchError(this.handleError<Hero>('updateHero'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message} no: ${error.number}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add('HeroService: ' + message);
  }
}
