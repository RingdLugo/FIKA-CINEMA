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
  originalTitle?: string;
  releaseDate?: string;
  genre?: string;
  country?: string;
  duration?: string;
  distributor?: string;
  isUpcoming?: boolean;
  isPresale?: boolean;
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
        const tmdbMovies = response.results.map((m: any, index: number) => ({
          id: m.id.toString(),
          title: m.title,
          poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
          trailer: '', // Se llenará abajo
          description: m.overview,
          director: 'Por definir',
          actors: 'Por definir',
          classification: m.adult ? 'C' : 'B',
          originalTitle: m.original_title,
          releaseDate: m.release_date,
          genre: 'Acción / Aventura',
          country: 'Estados Unidos',
          duration: '120 min',
          distributor: 'FIKA Distribution',
          isUpcoming: index >= 12,
          isPresale: index >= 10 && index < 12,
          schedules: {
            'FIKA Sat': { espanol: ['12:00', '15:00', '19:00'], sub: ['21:00'], regular: [] },
            'FIKA Las Torres': { espanol: ['14:00', '18:00'], sub: ['16:00', '20:00'], regular: [] },
            'FIKA Plaza Sol': { espanol: ['13:00', '17:00'], sub: [], regular: ['15:00', '19:00'] }
          }
        }));

        // Obtener trailers para las primeras 15 películas
        tmdbMovies.slice(0, 15).forEach((movie: any) => {
          const videoUrl = `${this.tmdbUrl}/movie/${movie.id}/videos?api_key=${environment.tmdbApiKey}&language=es-MX`;
          this.http.get<any>(videoUrl).subscribe(videoRes => {
            const trailer = videoRes.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
            if (trailer) {
              movie.trailer = `https://www.youtube.com/embed/${trailer.key}`;
              this.movies.set([...tmdbMovies]); // Trigger update
            } else {
              // Si no hay en español, buscar en inglés
              const videoUrlEn = `${this.tmdbUrl}/movie/${movie.id}/videos?api_key=${environment.tmdbApiKey}`;
              this.http.get<any>(videoUrlEn).subscribe(videoResEn => {
                const trailerEn = videoResEn.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
                if (trailerEn) {
                  movie.trailer = `https://www.youtube.com/embed/${trailerEn.key}`;
                  this.movies.set([...tmdbMovies]); // Trigger update
                }
              });
            }
          });
        });
        
        console.log("Movies with dynamic trailers populated");
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
