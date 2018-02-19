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

export interface GQLOptions {
  readAll: any;
  readById: any;
  readWithTerm: any;
  create: any;
  update: any;
  delete: any;
  deleteById: any;
}

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

  /** Read all records from the server */
  readAll<T>(options: GQLOptions): Observable<T> {
    return this.apollo.subscribe({query: options.readAll}).pipe(
        map(({data}) => data),
        tap(_ => this.log(`read all`)),
        catchError(this.handleError<T>('readAll'))
      );
  }

  /** Read a record by id. Will 404 if id not found */
  readById<T>(options: GQLOptions, id: any): Observable<T> {
    return this.apollo.query<T>({query: options.readById, variables: {id: id}}).pipe(
      map(({data}) => data), // returns a {0|1} element array
      tap(_ => this.log(`read record with id=${id}`)),
        catchError(this.handleError<T>(`readById id=${id}`))
      );
  }

  /* Read all records whose name contains the search term */
  readWithTerm<T>(options: GQLOptions, term: string): Observable<T> {
    if (!term.trim()) {return of();} // if not search term, return empty array of records.
    return this.apollo.watchQuery<T>({query: options.readWithTerm, variables: {term: term}}).valueChanges.pipe(
      map(({data}) => data),
      tap(_ => this.log(`read records matching "${term}"`)),
      catchError(this.handleError<T>('readWithTerm'))
    );
  }

  //////// Save methods //////////

  /** Create a new record on the server */
  create<T>(options: GQLOptions, record: any): Observable<T> {
    return this.apollo.mutate<T>({mutation: options.create, variables: record}).pipe(
      map(({data}) => data), // returns a {0|1} element array
      tap(_ => this.log(`created record with ${JSON.stringify(record)}`)),
      catchError(this.handleError<T>('create'))
    );
  }

  /** Update the record on the server */
  update<T>(options: GQLOptions, record: any): Observable<T> {
    return this.apollo.mutate<T>({mutation: options.update, variables: record}).pipe(
      map(({data}) => data),
      tap(_ => this.log(`updated record with ${JSON.stringify(record)}`)),
      catchError(this.handleError<T>('update'))
    );
  }

  /** Delete the record from the server */
  delete<T>(options: GQLOptions, record: any): Observable<T> {
    return this.apollo.mutate<T>({mutation: options.delete, variables: record}).pipe(
      map(({data}) => data),
      tap(_ => this.log(`deleted record with ${JSON.stringify(record)}`)),
      catchError(this.handleError<T>('delete'))
    );
  }

  /** Delete the record from the server */
  deleteById<T>(options: GQLOptions, id: any): Observable<T> {
    return this.apollo.mutate<T>({mutation: options.deleteById, variables: {id: id}}).pipe(
      map(({data}) => data),
      tap(_ => this.log(`deleted record with id=${id}`)),
      catchError(this.handleError<T>('deleteById'))
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
  private log(message: string) {
    this.messageService.add('GraphQLService: ' + message);
  }
}
