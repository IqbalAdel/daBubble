import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogProfileUserEditComponent } from './dialog-profile-user-edit.component';

describe('DialogProfileUserEditComponent', () => {
  let component: DialogProfileUserEditComponent;
  let fixture: ComponentFixture<DialogProfileUserEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogProfileUserEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogProfileUserEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
