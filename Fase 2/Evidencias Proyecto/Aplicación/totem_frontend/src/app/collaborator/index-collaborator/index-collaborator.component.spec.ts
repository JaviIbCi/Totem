import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexCollaboratorComponent } from './index-collaborator.component';

describe('IndexCollaboratorComponent', () => {
  let component: IndexCollaboratorComponent;
  let fixture: ComponentFixture<IndexCollaboratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexCollaboratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexCollaboratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
