import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAvatarComponent } from './create-avatar.component';

describe('CreateAvatarComponent', () => {
  let component: CreateAvatarComponent;
  let fixture: ComponentFixture<CreateAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAvatarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
