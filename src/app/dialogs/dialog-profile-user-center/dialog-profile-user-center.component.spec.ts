import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogProfileUserCenterComponent } from './dialog-profile-user-center.component';

describe('DialogProfileUserCenterComponent', () => {
  let component: DialogProfileUserCenterComponent;
  let fixture: ComponentFixture<DialogProfileUserCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogProfileUserCenterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogProfileUserCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
