import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationCategoriesComponent } from './information-categories.component';

describe('InformationCategoriesComponent', () => {
  let component: InformationCategoriesComponent;
  let fixture: ComponentFixture<InformationCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformationCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformationCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
