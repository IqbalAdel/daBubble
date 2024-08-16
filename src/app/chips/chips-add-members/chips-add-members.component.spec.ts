import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipsAddMembersComponent } from './chips-add-members.component';

describe('ChipsAddMembersComponent', () => {
  let component: ChipsAddMembersComponent;
  let fixture: ComponentFixture<ChipsAddMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipsAddMembersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChipsAddMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
