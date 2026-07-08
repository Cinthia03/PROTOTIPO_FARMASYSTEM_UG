import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuidadoPersonal } from './cuidado-personal';

describe('CuidadoPersonal', () => {
  let component: CuidadoPersonal;
  let fixture: ComponentFixture<CuidadoPersonal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuidadoPersonal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuidadoPersonal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
