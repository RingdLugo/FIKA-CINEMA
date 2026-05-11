import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPelicula } from './registro-pelicula';

describe('RegistroPelicula', () => {
  let component: RegistroPelicula;
  let fixture: ComponentFixture<RegistroPelicula>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPelicula]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPelicula);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
