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
  isCustom?: boolean;
  targetState?: string;
  targetCity?: string;
  targetCine?: string;
  allCines?: boolean;
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

  private tmdbMoviesList: Movie[] = [];

  constructor() {
    this.loadMovies();
  }

  public getCustomMovies(): Movie[] {
    try {
      const data = localStorage.getItem('fika_custom_movies');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading custom movies from localStorage:", e);
      return [];
    }
  }

  public getDeletedMovieIds(): string[] {
    try {
      const data = localStorage.getItem('fika_deleted_movies');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading deleted movie IDs from localStorage:", e);
      return [];
    }
  }

  public saveDeletedMovieIds(ids: string[]) {
    try {
      localStorage.setItem('fika_deleted_movies', JSON.stringify(ids));
    } catch (e) {
      console.error("Error saving deleted movie IDs to localStorage:", e);
    }
  }

  public saveCustomMovies(customList: Movie[]) {
    try {
      localStorage.setItem('fika_custom_movies', JSON.stringify(customList));
      this.syncAndMergeMovies();
    } catch (e) {
      console.error("Error saving custom movies to localStorage:", e);
    }
  }

  public addCustomMovie(movie: Movie) {
    const list = this.getCustomMovies();
    const filtered = list.filter(m => m.id !== movie.id);
    filtered.unshift(movie); // agregar al inicio
    this.saveCustomMovies(filtered);

    // restaurar si estaba en la lista de eliminadas
    const deletedIds = this.getDeletedMovieIds();
    if (deletedIds.includes(movie.id)) {
      this.saveDeletedMovieIds(deletedIds.filter(id => id !== movie.id));
      this.syncAndMergeMovies();
    }
  }

  public updateCustomMovie(movie: Movie): boolean {
    const list = this.getCustomMovies();
    const index = list.findIndex(m => m.id === movie.id);
    
    // restaurar si estaba en la lista de eliminadas
    const deletedIds = this.getDeletedMovieIds();
    if (deletedIds.includes(movie.id)) {
      this.saveDeletedMovieIds(deletedIds.filter(id => id !== movie.id));
    }

    if (index !== -1) {
      list[index] = movie;
      this.saveCustomMovies(list);
      return true;
    } else {
      list.unshift(movie);
      this.saveCustomMovies(list);
      return true;
    }
  }

  public deleteCustomMovie(id: string) {
    // 1. eliminar de personalizadas
    const list = this.getCustomMovies();
    const filtered = list.filter(m => m.id !== id);
    this.saveCustomMovies(filtered);

    // 2. registrar como oculta/eliminada
    const deletedIds = this.getDeletedMovieIds();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      this.saveDeletedMovieIds(deletedIds);
      this.syncAndMergeMovies();
    }
  }

  private syncAndMergeMovies(tmdbMovies?: Movie[]) {
    if (tmdbMovies) {
      this.tmdbMoviesList = tmdbMovies;
    }
    const customMovies = this.getCustomMovies();
    const deletedIds = new Set(this.getDeletedMovieIds());
    
    // obtener todos los cines
    const allCineNames: string[] = [];
    this.locations.forEach(state => {
      state.cities.forEach(city => {
        allCineNames.push(...city.cines);
      });
    });

    customMovies.forEach(movie => {
      const schedules: Record<string, Schedules> = {};
      const defaultSched = { 
        espanol: ['12:00 PM', '3:30 PM', '6:45 PM'], 
        sub: ['9:15 PM'], 
        regular: ['1:00 PM', '4:00 PM'] 
      };

      if (movie.allCines === undefined || movie.allCines) {
        // disponible en todos los cines
        allCineNames.forEach(cineName => {
          schedules[cineName] = defaultSched;
        });
      } else if (movie.targetCine) {
        // solo para el cine seleccionado
        schedules[movie.targetCine] = defaultSched;
      }
      
      movie.schedules = schedules;
    });

    // unir listas, locales tienen prioridad
    const customIds = new Set(customMovies.map(m => m.id));
    const filteredTmdb = this.tmdbMoviesList.filter(m => !customIds.has(m.id));
    
    // filtrar películas que hayan sido eliminadas
    const merged = [...customMovies, ...filteredTmdb].filter(m => !deletedIds.has(m.id));
    
    this.movies.set(merged);
  }

  public loadMovies() {
    this.loading.set(true);
    this.error.set(null);

    const url = `${this.tmdbUrl}/movie/now_playing?api_key=${environment.tmdbApiKey}&language=es-MX&page=1`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        // obtener nombres de cines
        const allCineNames: string[] = [];
        this.locations.forEach(state => {
          state.cities.forEach(city => {
            allCineNames.push(...city.cines);
          });
        });

        const tmdbMovies = response.results.map((m: any, index: number) => {
          const schedules: Record<string, Schedules> = {};
          
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

        // buscar trailers
        tmdbMovies.slice(0, 15).forEach((movie: any) => {
          const videoUrl = `${this.tmdbUrl}/movie/${movie.id}/videos?api_key=${environment.tmdbApiKey}&language=es-MX`;
          this.http.get<any>(videoUrl).subscribe({
            next: (videoRes) => {
              const trailer = videoRes.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
              if (trailer) {
                movie.trailer = `https://www.youtube.com/embed/${trailer.key}`;
                this.syncAndMergeMovies(tmdbMovies);
              }
            },
            error: (err) => console.warn("Failed to load trailer for movie", movie.id, err)
          });
        });
        
        this.syncAndMergeMovies(tmdbMovies);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error fetching from TMDB:", err);
        this.syncAndMergeMovies([]);
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  getMovieFromTMDB(id: string) {
    const url = `${this.tmdbUrl}/movie/${id}?api_key=${environment.tmdbApiKey}&language=es-MX&append_to_response=credits,videos`;
    return this.http.get<any>(url);
  }

  getMovieById(id: string) {
    return this.movies().find(movie => movie.id === id) || null;
  }
}
