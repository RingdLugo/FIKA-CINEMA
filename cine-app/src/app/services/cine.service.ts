import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Schedules {
  espanol: string[];
  sub: string[];
  regular: string[];
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  trailer: string;
  description: string;
  director: string;
  actors: string;
  classification: string;
  schedules?: Record<string, Schedules>;
}

@Injectable({
  providedIn: 'root'
})
export class CineService {
  private http = inject(HttpClient);

  selectedCine = signal<string | null>(null);
  movies = signal<Movie[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  private tmdbUrl = 'https://api.themoviedb.org/3';

  constructor() {
    this.loadMovies();
  }

  public loadMovies() {
    this.loading.set(true);
    this.error.set(null);

    const url = `${this.tmdbUrl}/movie/now_playing?api_key=${environment.tmdbApiKey}&language=es-MX&page=1`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        const tmdbMovies = response.results.map((m: any) => ({
          id: m.id.toString(),
          title: m.title,
          poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
          trailer: '', // TMDB requiere otro endpoint para videos
          description: m.overview,
          director: 'Por definir', // TMDB requiere endpoint de créditos
          actors: 'Por definir',
          classification: m.adult ? 'C' : 'B',
          schedules: {
            'Cinépolis': { espanol: ['14:00', '18:00'], sub: ['16:00', '20:00'], regular: [] },
            'Cinemex': { espanol: ['13:00', '17:00'], sub: [], regular: ['15:00', '19:00'] }
          }
        }));
        
        console.log("Movies from TMDB:", tmdbMovies);
        this.movies.set(tmdbMovies);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error fetching from TMDB:", err);
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  getMovieById(id: string) {
    return this.movies().find(movie => movie.id === id) || null;
  }
}
