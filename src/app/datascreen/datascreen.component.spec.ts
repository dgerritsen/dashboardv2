import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatascreenComponent } from './datascreen.component';

describe('DatascreenComponent', () => {
  let component: DatascreenComponent;
  let fixture: ComponentFixture<DatascreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatascreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatascreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
