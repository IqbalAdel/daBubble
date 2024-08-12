import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelCreateComponent } from './dialog-channel-create.component';

describe('DialogChannelCreateComponent', () => {
  let component: DialogChannelCreateComponent;
  let fixture: ComponentFixture<DialogChannelCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogChannelCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogChannelCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
