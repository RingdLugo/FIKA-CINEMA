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

  selectedState = signal<string | null>(null);
  selectedCity = signal<string | null>(null);
  selectedCine = signal<string | null>(null);
  
  movies = signal<Movie[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  locations = [
    {
      state: 'CDMX',
      cities: [
        { name: 'Benito Juárez', cines: ['FIKA Sat', 'FIKA Mitikah'] },
        { name: 'Cuauhtémoc', cines: ['FIKA Reforma', 'FIKA Plaza Sol'] }
      ]
    },
    {
      state: 'Estado de México',
      cities: [
        { name: 'Naucalpan', cines: ['FIKA Torres', 'FIKA Satélite'] },
        { name: 'Tlalnepantla', cines: ['FIKA Mundo E', 'FIKA Arboledas'] }
      ]
    },
    {
      state: 'Jalisco',
      cities: [
        { name: 'Guadalajara', cines: ['FIKA Andares', 'FIKA Centro'] },
        { name: 'Zapopan', cines: ['FIKA Galerías', 'FIKA Belenes'] }
      ]
    }
  ];

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
        // Obtener todos los nombres de cines de la estructura de locations
        const allCineNames: string[] = [];
        this.locations.forEach(state => {
          state.cities.forEach(city => {
            allCineNames.push(...city.cines);
          });
        });

        const tmdbMovies = response.results.map((m: any, index: number) => {
          const schedules: Record<string, Schedules> = {};
          
          // Asignar horarios a TODOS los cines para que siempre haya películas
          allCineNames.forEach(cineName => {
            schedules[cineName] = { 
              espanol: ['12:00', '15:30', '18:45'], 
              sub: ['21:15'], 
              regular: ['13:00', '16:00'] 
            };
          });

          return {
            id: m.id.toString(),
            title: m.title,
            poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
            trailer: '',
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
            isUpcoming: index >= 15,
            isPresale: index >= 12 && index < 15,
            schedules: schedules
          };
        });

        // Obtener trailers
        tmdbMovies.slice(0, 15).forEach((movie: any) => {
          const videoUrl = `${this.tmdbUrl}/movie/${movie.id}/videos?api_key=${environment.tmdbApiKey}&language=es-MX`;
          this.http.get<any>(videoUrl).subscribe(videoRes => {
            const trailer = videoRes.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
            if (trailer) {
              movie.trailer = `https://www.youtube.com/embed/${trailer.key}`;
              this.movies.set([...tmdbMovies]);
            }
          });
        });
        
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
