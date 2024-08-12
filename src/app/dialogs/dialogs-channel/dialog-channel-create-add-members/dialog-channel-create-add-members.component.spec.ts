import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelCreateAddMembersComponent } from './dialog-channel-create-add-members.component';

describe('DialogChannelCreateAddMembersComponent', () => {
  let component: DialogChannelCreateAddMembersComponent;
  let fixture: ComponentFixture<DialogChannelCreateAddMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogChannelCreateAddMembersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogChannelCreateAddMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
