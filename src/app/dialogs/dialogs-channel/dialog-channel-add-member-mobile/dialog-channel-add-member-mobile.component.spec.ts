import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelAddMemberMobileComponent } from './dialog-channel-add-member-mobile.component';

describe('DialogChannelAddMemberMobileComponent', () => {
  let component: DialogChannelAddMemberMobileComponent;
  let fixture: ComponentFixture<DialogChannelAddMemberMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogChannelAddMemberMobileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogChannelAddMemberMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
