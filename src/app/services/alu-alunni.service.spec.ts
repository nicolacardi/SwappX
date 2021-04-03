import { TestBed } from '@angular/core/testing';

import { ALUAlunniService } from './alu-alunni.service';

describe('ALUAlunniService', () => {
  let service: ALUAlunniService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ALUAlunniService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
