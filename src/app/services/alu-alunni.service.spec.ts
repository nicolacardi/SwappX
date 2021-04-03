import { TestBed } from '@angular/core/testing';

import { ALU_AlunniService } from './alu-alunni.service';

describe('ALUAlunniService', () => {
  let service: ALU_AlunniService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ALU_AlunniService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
