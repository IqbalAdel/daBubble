import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAnswerComponent } from './group-answer.component';

describe('GroupAnswerComponent', () => {
  let component: GroupAnswerComponent;
  let fixture: ComponentFixture<GroupAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupAnswerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
