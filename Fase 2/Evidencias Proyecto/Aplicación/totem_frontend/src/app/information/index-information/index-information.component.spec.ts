import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndexInformationComponent } from './index-information.component';

describe('IndexInformationComponent', () => {
  let component: IndexInformationComponent;
  let fixture: ComponentFixture<IndexInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
