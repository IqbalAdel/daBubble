import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogProfileUserComponent } from './dialog-profile-user.component';

describe('DialogProfileUserComponent', () => {
  let component: DialogProfileUserComponent;
  let fixture: ComponentFixture<DialogProfileUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogProfileUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogProfileUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
