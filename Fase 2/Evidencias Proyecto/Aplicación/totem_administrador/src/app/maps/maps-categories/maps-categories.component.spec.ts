import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsCategoriesComponent } from './maps-categories.component';

describe('MapsCategoriesComponent', () => {
  let component: MapsCategoriesComponent;
  let fixture: ComponentFixture<MapsCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapsCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapsCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
