import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncontrarCine } from './encontrar-cine';

describe('EncontrarCine', () => {
  let component: EncontrarCine;
  let fixture: ComponentFixture<EncontrarCine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncontrarCine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncontrarCine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
