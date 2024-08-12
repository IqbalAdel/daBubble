import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoloChatComponent } from './solo-chat.component';

describe('SoloChatComponent', () => {
  let component: SoloChatComponent;
  let fixture: ComponentFixture<SoloChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoloChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoloChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
