# Dynamic Movie Navigation Task

## Plan Steps:
- [x] 1. Update cine.service.ts: Add Movie interface and movies signal with data for all posters/slider.
- [x] 2. Update app.routes.ts: Add :id param to detalles-pelicula route.
- [x] 3. Update inicio.ts: Inject service, expose movies signal.
- [x] 4. Update inicio.html: Use @for loops for slider/posters with [routerLink]="['/detalles-pelicula', movie.id]".
- [x] 5. Update detalles-pelicula.ts: Inject ActivatedRoute/service, load movie by id, bind signals.
- [x] 6. Update detalles-pelicula.html: Bind dynamic title, trailer src, description, etc. from signals.
- [x] 7. Task complete: Dynamic navigation implemented. Run `ng serve` in cine-app/ to test: click posters/buttons on home, confirm correct movie details/trailer load in detalles-pelicula.

Progress tracked here.
