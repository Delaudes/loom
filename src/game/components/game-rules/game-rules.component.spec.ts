import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameRulesComponent } from './game-rules.component';

describe('GameRulesComponent', () => {
  let component: GameRulesComponent;
  let fixture: ComponentFixture<GameRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameRulesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameRulesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
