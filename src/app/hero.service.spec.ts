import { TestBed, async, inject } from '@angular/core/testing';
import { HeroService } from './hero.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { MessageService } from './message.service';

let messageService: MessageService;
let apollo: Apollo;
let httpLink: HttpLink;
let heroService: HeroService;

describe('HeroService', () => {
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloModule, HttpLinkModule, HttpClientModule, HttpClientTestingModule],
      providers: [HeroService, MessageService, Apollo, HttpLink, HttpClient]
    });
    const messageService = TestBed.get(MessageService);
    const apollo = TestBed.get(Apollo);
    const heroService = TestBed.get(HeroService);
    // httpClient = new HttpClient(undefined);
    // httpLink = new HttpLink(httpClient);
    // apollo.create({
    //   link: httpLink.create({ uri: heroesUrl }),
    //   cache: new InMemoryCache()
    // });
    // heroService = new HeroServiceBase;
  });

  it('should be created', (done: DoneFn) => {
    expect(heroService).toBeTruthy();
    done();
  });

  it('getHero should return the specified hero by id', (done: DoneFn) => {
    heroService.getHero(12).subscribe(data => {
      expect(data).toBeDefined;
      expect(data.id).toBe(12);
      expect(data.name).toBe('Narco');
      done();
    });
  });

  it('getHeroes should return all heroes', (done: DoneFn) => {
    heroService.getHeroes().subscribe(data => {
      expect(data.length).toBeGreaterThan(0);
      // expect(data).toEqual([]);
      done();
    });
  });
});
