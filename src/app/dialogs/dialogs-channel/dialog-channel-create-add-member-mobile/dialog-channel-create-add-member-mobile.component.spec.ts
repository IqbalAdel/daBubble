import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelCreateAddMemberMobileComponent } from './dialog-channel-create-add-member-mobile.component';

describe('DialogChannelCreateAddMemberMobileComponent', () => {
  let component: DialogChannelCreateAddMemberMobileComponent;
  let fixture: ComponentFixture<DialogChannelCreateAddMemberMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogChannelCreateAddMemberMobileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogChannelCreateAddMemberMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
