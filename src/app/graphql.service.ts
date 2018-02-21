import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Apollo} from 'apollo-angular';
import {HttpLink} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {MessageService} from './message.service';

export const GraphQLUrl = 'http://localhost:5000/graphql';  // URL to web api

@Injectable()
export class GraphQLService {

  constructor(
    private messageService: MessageService,
    private apollo: Apollo,
    private httpLink: HttpLink
  ) {
    apollo.create({
      link: httpLink.create({ uri: GraphQLUrl }),
      cache: new InMemoryCache()
    });
  }

  /* Query (read) record(s), matching variables where necessary */
  query<T>(query: any, variables: any = {}, description: string = 'read'): Observable<T> {
    return this.apollo.subscribe({query: query, variables: variables}).pipe(
      map(({data}) => data),
      tap(_ => this.log(`${description} record(s) with ${JSON.stringify(variables)}`)),
      catchError(this.handleError<T>(`Query=${JSON.stringify(query)} Variables=${JSON.stringify(variables)} Description=${description}`))
    );
  }

  /** Mutate (create, update or delete) a record on the server */
  mutate<T>(mutation: any, variables: any = {}, description: string = 'mutate'): Observable<T> {
    return this.apollo.mutate<T>({mutation: mutation, variables: variables}).pipe(
      map(({data}) => data),
      tap(_ => this.log(`${description} record(s) with ${JSON.stringify(variables)}`)),
      catchError(this.handleError<T>(`Mutate=${JSON.stringify(mutation)} Variables=${JSON.stringify(variables)} Description=${description}`))
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

  /** Log a GraphQLService message with the MessageService */
  log<T>(item: T, prefix: string = ''): T {
    return this.messageService.log(item, 'GraphQLService: ' + prefix);
  }
}
