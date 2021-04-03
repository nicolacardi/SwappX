import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ALUAlunniComponent } from './alu-alunni.component';

describe('ALUAlunniComponent', () => {
  let component: ALUAlunniComponent;
  let fixture: ComponentFixture<ALUAlunniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ALUAlunniComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ALUAlunniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
