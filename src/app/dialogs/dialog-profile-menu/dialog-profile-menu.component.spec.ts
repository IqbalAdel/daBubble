import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogProfileMenuComponent } from './dialog-profile-menu.component';

describe('DialogProfileMenuComponent', () => {
  let component: DialogProfileMenuComponent;
  let fixture: ComponentFixture<DialogProfileMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogProfileMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogProfileMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
