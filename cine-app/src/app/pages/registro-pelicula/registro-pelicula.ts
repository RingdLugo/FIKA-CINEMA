import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CineService, Movie } from '../../services/cine.service';

@Component({
  selector: 'app-registro-pelicula',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './registro-pelicula.html',
  styleUrl: './registro-pelicula.css',
})
export class RegistroPelicula {
  private cineService = inject(CineService);

  // datos formulario
  movieForm = {
    id: '',
    title: '',
    originalTitle: '',
    genre: '',
    serie: '',
    duration: '',
    trailer: '',
    description: '',
    estado: '',
    classification: '',
    director: '',
    actors: '',
    country: '',
    distributor: '',
    releaseDate: '',
    poster: '',
    allCines: true,
    targetState: '',
    targetCity: '',
    targetCine: ''
  };

  get statesList() {
    return this.cineService.locations.map(l => l.state);
  }

  get citiesList() {
    const state = this.movieForm.targetState;
    if (!state) return [];
    const stateData = this.cineService.locations.find(l => l.state === state);
    return stateData ? stateData.cities : [];
  }

  get cinesList() {
    const cityName = this.movieForm.targetCity;
    const stateName = this.movieForm.targetState;
    if (!stateName || !cityName) return [];
    const stateData = this.cineService.locations.find(l => l.state === stateName);
    const cityData = stateData?.cities.find(c => c.name === cityName);
    return cityData ? cityData.cines : [];
  }

  // alerta
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';

  // procesar poster local
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.movieForm.poster = e.target.result;
        this.showAlert('¡Imagen cargada con éxito!', 'success');
      };
      reader.onerror = () => {
        this.showAlert('Error al procesar el póster.', 'error');
      };
      reader.readAsDataURL(file);
    }
  }

  showAlert(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      if (this.alertMessage === message) {
        this.alertMessage = '';
      }
    }, 5000);
  }

  // buscar pelicula
  buscarPelicula() {
    const id = this.movieForm.id.trim();
    if (!id) {
      this.showAlert('Ingresa un ID para buscar.', 'error');
      return;
    }

    // buscar local
    const localMovies = this.cineService.getCustomMovies();
    const localFound = localMovies.find(m => m.id === id);

    if (localFound) {
      this.loadMovieIntoForm(localFound);
      this.showAlert('Película local encontrada.', 'success');
      return;
    }

    // buscar activa
    const activeMovies = this.cineService.movies();
    const activeFound = activeMovies.find(m => m.id === id);
    if (activeFound) {
      this.loadMovieIntoForm(activeFound);
      this.showAlert('Película activa encontrada.', 'success');
      return;
    }

    // buscar tmdb
    if (/^\d+$/.test(id)) {
      this.showAlert('Buscando en TMDB API...', 'info');
      this.cineService.getMovieFromTMDB(id).subscribe({
        next: (tmdbRes) => {
          const genresStr = tmdbRes.genres?.map((g: any) => g.name).join(', ') || 'Acción';
          const directorName = tmdbRes.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Por definir';
          const actorsNames = tmdbRes.credits?.cast?.slice(0, 5).map((a: any) => a.name).join(', ') || 'Por definir';
          
          let trailerUrl = '';
          const trailer = tmdbRes.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
          if (trailer) {
            trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
          }

          this.movieForm.title = tmdbRes.title || '';
          this.movieForm.originalTitle = tmdbRes.original_title || tmdbRes.title || '';
          this.movieForm.genre = genresStr;
          this.movieForm.serie = tmdbRes.belongs_to_collection?.name || '';
          this.movieForm.duration = tmdbRes.runtime ? `${tmdbRes.runtime} min` : '120 min';
          this.movieForm.trailer = trailerUrl;
          this.movieForm.description = tmdbRes.overview || '';
          
          const status = tmdbRes.status;
          if (status === 'In Production' || status === 'Planned' || status === 'Post Production') {
            this.movieForm.estado = 'proximamente';
          } else {
            this.movieForm.estado = 'cartelera';
          }
          
          this.movieForm.classification = tmdbRes.adult ? 'C' : 'B';
          this.movieForm.director = directorName;
          this.movieForm.actors = actorsNames;
          this.movieForm.country = tmdbRes.production_countries?.map((c: any) => c.name).join(', ') || 'Estados Unidos';
          this.movieForm.distributor = tmdbRes.production_companies?.[0]?.name || 'FIKA Distribution';
          this.movieForm.releaseDate = tmdbRes.release_date || '';
          this.movieForm.poster = tmdbRes.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbRes.poster_path}` : '';

          this.showAlert('Datos cargados de TMDB.', 'success');
        },
        error: (err) => {
          console.error(err);
          this.showAlert('No se encontró en TMDB API. Escribe los datos manualmente.', 'error');
        }
      });
    } else {
      this.showAlert('ID no encontrado localmente.', 'error');
    }
  }

  // insertar pelicula
  insertarPelicula() {
    const id = this.movieForm.id.trim();
    const title = this.movieForm.title.trim();

    if (!id || !title) {
      this.showAlert('ID y Título son obligatorios.', 'error');
      return;
    }

    const localMovies = this.cineService.getCustomMovies();
    if (localMovies.some(m => m.id === id)) {
      this.showAlert('Ya existe una película con ese ID.', 'error');
      return;
    }

    const movie: Movie = this.mapFormToMovie();
    this.cineService.addCustomMovie(movie);
    this.showAlert(`¡Película "${title}" insertada con éxito!`, 'success');
  }

  // modificar pelicula
  modificarPelicula() {
    const id = this.movieForm.id.trim();
    const title = this.movieForm.title.trim();

    if (!id || !title) {
      this.showAlert('ID y Título son obligatorios.', 'error');
      return;
    }

    const movie: Movie = this.mapFormToMovie();
    const success = this.cineService.updateCustomMovie(movie);
    if (success) {
      this.showAlert(`¡Película "${title}" modificada con éxito!`, 'success');
    } else {
      this.showAlert('Error al modificar película.', 'error');
    }
  }

  // eliminar pelicula
  eliminarPelicula() {
    const id = this.movieForm.id.trim();
    if (!id) {
      this.showAlert('Ingresa el ID de la película a eliminar.', 'error');
      return;
    }

    const localMovies = this.cineService.getCustomMovies();
    const activeMovies = this.cineService.movies();
    
    const existsLocally = localMovies.some(m => m.id === id);
    const existsActive = activeMovies.some(m => m.id === id);

    if (!existsLocally && !existsActive) {
      this.showAlert('La película con ese ID no existe.', 'error');
      return;
    }

    this.cineService.deleteCustomMovie(id);
    this.resetForm();
    this.showAlert('¡Película eliminada con éxito!', 'success');
  }

  // cargar pelicula en formulario
  private loadMovieIntoForm(movie: Movie) {
    this.movieForm = {
      id: movie.id,
      title: movie.title || '',
      originalTitle: movie.originalTitle || movie.title || '',
      genre: movie.genre || '',
      serie: movie.genre || '',
      duration: movie.duration || '',
      trailer: movie.trailer || '',
      description: movie.description || '',
      estado: movie.isUpcoming ? 'proximamente' : (movie.isPresale ? 'preventa' : 'cartelera'),
      classification: movie.classification || 'B',
      director: movie.director || 'Por definir',
      actors: movie.actors || 'Por definir',
      country: movie.country || 'Estados Unidos',
      distributor: movie.distributor || 'FIKA Distribution',
      releaseDate: movie.releaseDate || '',
      poster: movie.poster || '',
      allCines: movie.allCines !== undefined ? movie.allCines : true,
      targetState: movie.targetState || '',
      targetCity: movie.targetCity || '',
      targetCine: movie.targetCine || ''
    };
  }

  // mapear formulario a objeto
  private mapFormToMovie(): Movie {
    return {
      id: this.movieForm.id.trim(),
      title: this.movieForm.title.trim(),
      poster: this.movieForm.poster.trim(),
      trailer: this.movieForm.trailer.trim(),
      description: this.movieForm.description.trim(),
      director: this.movieForm.director.trim() || 'Por definir',
      actors: this.movieForm.actors.trim() || 'Por definir',
      classification: this.movieForm.classification || 'B',
      originalTitle: this.movieForm.originalTitle.trim() || this.movieForm.title.trim(),
      releaseDate: this.movieForm.releaseDate.trim(),
      genre: this.movieForm.genre.trim(),
      country: this.movieForm.country.trim() || 'Estados Unidos',
      duration: this.movieForm.duration.trim() || '120 min',
      distributor: this.movieForm.distributor.trim() || 'FIKA Distribution',
      isUpcoming: this.movieForm.estado === 'proximamente' || this.movieForm.estado === 'preestreno',
      isPresale: this.movieForm.estado === 'preventa',
      isCustom: true,
      allCines: this.movieForm.allCines,
      targetState: this.movieForm.allCines ? '' : this.movieForm.targetState,
      targetCity: this.movieForm.allCines ? '' : this.movieForm.targetCity,
      targetCine: this.movieForm.allCines ? '' : this.movieForm.targetCine,
      schedules: {}
    };
  }

  // reiniciar formulario
  private resetForm() {
    this.movieForm = {
      id: '',
      title: '',
      originalTitle: '',
      genre: '',
      serie: '',
      duration: '',
      trailer: '',
      description: '',
      estado: '',
      classification: '',
      director: '',
      actors: '',
      country: '',
      distributor: '',
      releaseDate: '',
      poster: '',
      allCines: true,
      targetState: '',
      targetCity: '',
      targetCine: ''
    };
  }
}
