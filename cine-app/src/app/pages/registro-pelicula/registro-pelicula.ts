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

  // datos del formulario
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

  // alertas de estado
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';

  // convertir imagen a base64
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.movieForm.poster = e.target.result;
        this.showAlert('¡Imagen del póster procesada y cargada con éxito!', 'success');
      };
      reader.onerror = () => {
        this.showAlert('Error al procesar el póster local.', 'error');
      };
      reader.readAsDataURL(file);
    }
  }

  showAlert(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.alertMessage = message;
    this.alertType = type;
    // cerrar a los 5 segundos
    setTimeout(() => {
      if (this.alertMessage === message) {
        this.alertMessage = '';
      }
    }, 5000);
  }

  // buscar por id local o en api
  buscarPelicula() {
    const id = this.movieForm.id.trim();
    if (!id) {
      this.showAlert('Por favor, ingresa un ID / No. Película para buscar.', 'error');
      return;
    }

    // buscar local
    const localMovies = this.cineService.getCustomMovies();
    const localFound = localMovies.find(m => m.id === id);

    if (localFound) {
      this.loadMovieIntoForm(localFound);
      this.showAlert('Película local encontrada en la base de datos.', 'success');
      return;
    }

    // buscar en cartelera activa
    const activeMovies = this.cineService.movies();
    const activeFound = activeMovies.find(m => m.id === id);
    if (activeFound) {
      this.loadMovieIntoForm(activeFound);
      this.showAlert('Película encontrada en cartelera activa.', 'success');
      return;
    }

    // buscar en tmdb
    if (/^\d+$/.test(id)) {
      this.showAlert('Buscando detalles de película en TMDB API...', 'info');
      this.cineService.getMovieFromTMDB(id).subscribe({
        next: (tmdbRes) => {
          // parsear resultados
          const genresStr = tmdbRes.genres?.map((g: any) => g.name).join(', ') || 'Acción / Aventura';
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
          
          // definir estado
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

          this.showAlert('¡Película encontrada y datos cargados desde la API de TMDB!', 'success');
        },
        error: (err) => {
          console.error("TMDB search error:", err);
          this.showAlert('No se encontró la película en TMDB API. Puedes ingresar los datos manualmente.', 'error');
        }
      });
    } else {
      this.showAlert('ID no encontrado localmente. Para buscar en TMDB, el ID debe ser numérico.', 'error');
    }
  }

  // insertar pelicula
  insertarPelicula() {
    const id = this.movieForm.id.trim();
    const title = this.movieForm.title.trim();

    if (!id || !title) {
      this.showAlert('El ID y el Título de la película son obligatorios.', 'error');
      return;
    }

    // validar si ya existe
    const localMovies = this.cineService.getCustomMovies();
    if (localMovies.some(m => m.id === id)) {
      this.showAlert('Error: Ya existe una película local con ese ID. Usa "Modificar" si deseas actualizarla.', 'error');
      return;
    }

    const movie: Movie = this.mapFormToMovie();
    this.cineService.addCustomMovie(movie);
    this.showAlert(`¡Película "${title}" insertada con éxito! Ya se muestra en cartelera.`, 'success');
  }

  // modificar pelicula
  modificarPelicula() {
    const id = this.movieForm.id.trim();
    const title = this.movieForm.title.trim();

    if (!id || !title) {
      this.showAlert('El ID y el Título son obligatorios para modificar.', 'error');
      return;
    }

    const movie: Movie = this.mapFormToMovie();
    const success = this.cineService.updateCustomMovie(movie);
    if (success) {
      this.showAlert(`¡Película "${title}" modificada con éxito!`, 'success');
    } else {
      this.showAlert('Error: No se pudo modificar. Verifica si el ID existe localmente.', 'error');
    }
  }

  // eliminar pelicula
  eliminarPelicula() {
    const id = this.movieForm.id.trim();
    if (!id) {
      this.showAlert('Ingresa el ID de la película que deseas eliminar.', 'error');
      return;
    }

    const localMovies = this.cineService.getCustomMovies();
    const activeMovies = this.cineService.movies();
    
    const existsLocally = localMovies.some(m => m.id === id);
    const existsActive = activeMovies.some(m => m.id === id);

    if (!existsLocally && !existsActive) {
      this.showAlert('Error: La película con ese ID no existe en el catálogo.', 'error');
      return;
    }

    this.cineService.deleteCustomMovie(id);
    this.resetForm();
    this.showAlert('¡Película eliminada con éxito del catálogo de cartelera!', 'success');
  }

  // helpers
  private loadMovieIntoForm(movie: Movie) {
    this.movieForm = {
      id: movie.id,
      title: movie.title || '',
      originalTitle: movie.originalTitle || movie.title || '',
      genre: movie.genre || '',
      serie: movie.genre || '', // genero de respaldo
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
      schedules: {} // horarios por defecto
    };
  }

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
