import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelAddMembersComponent } from './dialog-channel-add-members.component';

describe('DialogChannelAddMembersComponent', () => {
  let component: DialogChannelAddMembersComponent;
  let fixture: ComponentFixture<DialogChannelAddMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogChannelAddMembersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogChannelAddMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
