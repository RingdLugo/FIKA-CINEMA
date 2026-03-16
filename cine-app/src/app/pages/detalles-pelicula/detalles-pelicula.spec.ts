import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesPelicula } from './detalles-pelicula';

describe('DetallesPelicula', () => {
  let component: DetallesPelicula;
  let fixture: ComponentFixture<DetallesPelicula>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesPelicula]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesPelicula);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
