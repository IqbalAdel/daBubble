import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogProfileMobileMenuComponent } from './dialog-profile-mobile-menu.component';

describe('DialogProfileMobileMenuComponent', () => {
  let component: DialogProfileMobileMenuComponent;
  let fixture: ComponentFixture<DialogProfileMobileMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogProfileMobileMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogProfileMobileMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
