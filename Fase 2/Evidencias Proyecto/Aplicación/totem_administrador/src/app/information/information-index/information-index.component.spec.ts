import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationIndexComponent } from './information-index.component';

describe('InformationIndexComponent', () => {
  let component: InformationIndexComponent;
  let fixture: ComponentFixture<InformationIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformationIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformationIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
