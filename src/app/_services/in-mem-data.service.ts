import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemDataService implements InMemoryDbService {
  createDb() {
  
    let comuni=[
      {
        "istat": "1001",
        "comune": "Agliè",
        "regione": "Piemonte",
        "provincia": "TO"
      },
      {
        "istat": "1002",
        "comune": "Airasca",
        "regione": "Piemonte",
        "provincia": "TO",
      },
      {
        "istat": "1003",
        "comune": "Ala di Stura",
        "regione": "Piemonte",
        "provincia": "TO",
      },
      {
        "istat": "1004",
        "comune": "Albiano d'Ivrea",
        "regione": "Piemonte",
        "provincia": "TO",
      },
      {
        "istat": "1005",
        "comune": "Alice Superiore",
        "regione": "Piemonte",
        "provincia": "TO",
      },
      {
        "istat": "1006",
        "comune": "Almese",
        "regione": "Piemonte",
        "provincia": "TO",
      }
    ];

    return {comuni: {
      total: comuni.length,
      results: comuni
    }};
  }
}