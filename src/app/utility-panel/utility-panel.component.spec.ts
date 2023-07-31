import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilityPanelComponent } from './utility-panel.component';

describe('UtilityPanelComponent', () => {
  let component: UtilityPanelComponent;
  let fixture: ComponentFixture<UtilityPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UtilityPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilityPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
