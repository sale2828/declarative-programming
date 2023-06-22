import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideshowImperativeComponent } from './slideshow-imperative.component';

describe('SlideshowImperativeComponent', () => {
  let component: SlideshowImperativeComponent;
  let fixture: ComponentFixture<SlideshowImperativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlideshowImperativeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideshowImperativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
