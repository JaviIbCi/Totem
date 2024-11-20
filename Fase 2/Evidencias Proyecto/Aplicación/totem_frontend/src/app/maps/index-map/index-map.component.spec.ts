import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexMapComponent } from './index-map.component';

describe('IndexMapComponent', () => {
  let component: IndexMapComponent;
  let fixture: ComponentFixture<IndexMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
