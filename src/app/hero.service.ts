import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Hero } from './hero';
import { HEROES } from './mock-heroes';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  private heroesUrl = 'api/heroes'; // Web APIのURL

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  // サーバからHeroを取得する
  getHeroes(): Observable<Hero[]> {

    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(heroes => this.log('fetched heroes')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );

    /* 書き換え
    //TODO: send the message _after_ fetching the heroes
    this.messageService.add('Hero Service: fetched heroes');
    return of(HEROES);
    */

  }

  /** GET hero by id. will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;

    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );

    /* 書き換え
    this.messageService.add(`HeroService: fetched hero id=${id}`);
    return of(HEROES.find(hero => hero.id === id));
    */
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue
   * ＠param operation - name of the operaion that failed
   * ＠param result - optional value to return as the observable result
   */

  private handleError<T>(operation = 'operation', result?: T) {

    return (error: any): Observable<T> => {

      // send the error to remote loggin infrastructure
      console.error(error);

      // better job of transforming error for user consumption
      this.log(`${operation} faild: ${error.message}`);

      // Let the app keep running by returning an emoty result.
      return of(result as T);
    };
  }


  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }

  /** update hero's info on server */
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updatedHero'))
    );
  }

  /** POST: registar new hero to the server  */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero w/ id=${ newHero.id }`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /** DELETE: delete a hero from the server */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    )
  }

  /** GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]>{
    if(!term.trim()){
      // if not search term, return empty hero array
      return of([]);
    }

    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
        this.log(`found heroes matching "${term}"`):
        this.log(`no heroes matchin "${term}`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

}
