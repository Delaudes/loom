import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareGameComponent } from './share-game.component';

describe('ShareGameComponent', () => {
  let component: ShareGameComponent;
  let fixture: ComponentFixture<ShareGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareGameComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareGameComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
