import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url'; // 1. Importar esta utilidad nativa
import csvParser from 'csv-parser';

const routeTypes = [
  {
    "amount": "117000",
    "route_rate_id": "b781837c-ff85-4c54-86c8-772f10bef1e5",
    "route_type_id": "56b9b91f-5a3e-4000-849f-7c4cd001ee2a",
    "valid_from": "2026-08-25",
    "code": "A",
    "name": "Ruta A"
  },
  {
    "amount": "121000",
    "route_rate_id": "41836834-5154-491d-af54-353c9e316289",
    "route_type_id": "f61e9e7f-97d4-4ba8-b47a-1c26f7450312",
    "valid_from": "2026-08-25",
    "code": "B",
    "name": "Ruta B"
  },
  {
    "amount": "148000",
    "route_rate_id": "e92ec1d2-7b44-4ce8-b936-f7c711332fb0",
    "route_type_id": "16658cbf-13ed-4116-9219-23b11354c845",
    "valid_from": "2026-08-25",
    "code": "C",
    "name": "Ruta C"
  },
  {
    "amount": "171000",
    "route_rate_id": "edb8b2c6-9e27-4060-98ad-c125df15a63e",
    "route_type_id": "a09d5694-f7f4-49c5-992a-dd78b9d8444e",
    "valid_from": "2026-08-25",
    "code": "D",
    "name": "Ruta D"
  },
  {
    "amount": "187000",
    "route_rate_id": "e09b46b8-8a5a-48db-8789-d1ec4db5cf56",
    "route_type_id": "26e3a0a7-4e91-4a7d-b928-c942dcf88052",
    "valid_from": "2026-08-25",
    "code": "E",
    "name": "Ruta E"
  },
  {
    "amount": "102000",
    "route_rate_id": "8ed1f8cf-4d92-4ad0-90f6-19bea3acd69a",
    "route_type_id": "56b9b91f-5a3e-4000-849f-7c4cd001ee2a",
    "valid_from": "2026-02-28",
    "code": "A",
    "name": "Ruta A"
  },
  {
    "amount": "107000",
    "route_rate_id": "dbab1bb8-5667-4f50-a98c-85690bdca0c5",
    "route_type_id": "f61e9e7f-97d4-4ba8-b47a-1c26f7450312",
    "valid_from": "2026-02-28",
    "code": "B",
    "name": "Ruta B"
  },
  {
    "amount": "135000",
    "route_rate_id": "75705724-507c-4e3e-816f-3e3541792c5b",
    "route_type_id": "16658cbf-13ed-4116-9219-23b11354c845",
    "valid_from": "2026-02-28",
    "code": "C",
    "name": "Ruta C"
  },
  {
    "amount": "160000",
    "route_rate_id": "71a31c53-eb77-47ac-a319-a89b13030b61",
    "route_type_id": "a09d5694-f7f4-49c5-992a-dd78b9d8444e",
    "valid_from": "2026-02-28",
    "code": "D",
    "name": "Ruta D"
  },
  {
    "amount": "0",
    "route_rate_id": "003fc9b5-2173-4509-9862-67f42f44be13",
    "route_type_id": "26e3a0a7-4e91-4a7d-b928-c942dcf88052",
    "valid_from": "2026-02-28",
    "code": "E",
    "name": "Ruta E"
  },
  {
    "amount": "89300",
    "route_rate_id": "4cf8f600-ba12-449c-b4db-97898c6da295",
    "route_type_id": "56b9b91f-5a3e-4000-849f-7c4cd001ee2a",
    "valid_from": "2025-08-28",
    "code": "A",
    "name": "Ruta A"
  },
  {
    "amount": "94100",
    "route_rate_id": "dc384525-a1b6-4ce8-a9af-d727d9b0dcf3",
    "route_type_id": "f61e9e7f-97d4-4ba8-b47a-1c26f7450312",
    "valid_from": "2025-08-28",
    "code": "B",
    "name": "Ruta B"
  },
  {
    "amount": "120800",
    "route_rate_id": "3edcd8fe-fb1d-4721-bbe6-0e289e972da1",
    "route_type_id": "16658cbf-13ed-4116-9219-23b11354c845",
    "valid_from": "2025-08-28",
    "code": "C",
    "name": "Ruta C"
  },
  {
    "amount": "145000",
    "route_rate_id": "173606a0-a825-4ef7-9748-c2a762982fc4",
    "route_type_id": "a09d5694-f7f4-49c5-992a-dd78b9d8444e",
    "valid_from": "2025-08-28",
    "code": "D",
    "name": "Ruta D"
  },
  {
    "amount": "0",
    "route_rate_id": "2b0d7542-b8dd-4c71-a813-320058c40222",
    "route_type_id": "26e3a0a7-4e91-4a7d-b928-c942dcf88052",
    "valid_from": "2025-08-28",
    "code": "E",
    "name": "Ruta E"
  },
  {
    "amount": "84100",
    "route_rate_id": "f45ce05c-6f73-435e-98be-fbdfdc50d9c0",
    "route_type_id": "56b9b91f-5a3e-4000-849f-7c4cd001ee2a",
    "valid_from": "2025-05-26",
    "code": "A",
    "name": "Ruta A"
  },
  {
    "amount": "89100",
    "route_rate_id": "48d997c9-d36a-471b-87df-34a5aa12c720",
    "route_type_id": "f61e9e7f-97d4-4ba8-b47a-1c26f7450312",
    "valid_from": "2025-05-26",
    "code": "B",
    "name": "Ruta B"
  },
  {
    "amount": "113700",
    "route_rate_id": "b325222d-345b-4048-a4e3-30b974718caa",
    "route_type_id": "16658cbf-13ed-4116-9219-23b11354c845",
    "valid_from": "2025-05-26",
    "code": "C",
    "name": "Ruta C"
  },
  {
    "amount": "138200",
    "route_rate_id": "fd509349-10fb-45aa-91e5-7ffbc2e790f3",
    "route_type_id": "a09d5694-f7f4-49c5-992a-dd78b9d8444e",
    "valid_from": "2025-05-26",
    "code": "D",
    "name": "Ruta D"
  },
  {
    "amount": "0",
    "route_rate_id": "dae99773-4eff-43ec-9d4e-ad069b55e355",
    "route_type_id": "26e3a0a7-4e91-4a7d-b928-c942dcf88052",
    "valid_from": "2025-05-26",
    "code": "E",
    "name": "Ruta E"
  },
  {
    "amount": "78522",
    "route_rate_id": "76ec5e93-a8ad-4e5c-87c4-2fd2971fdfa5",
    "route_type_id": "56b9b91f-5a3e-4000-849f-7c4cd001ee2a",
    "valid_from": "2025-04-16",
    "code": "A",
    "name": "Ruta A"
  },
  {
    "amount": "83190",
    "route_rate_id": "93fb4c0f-c412-4b6f-9372-cc6792bdae1f",
    "route_type_id": "f61e9e7f-97d4-4ba8-b47a-1c26f7450312",
    "valid_from": "2025-04-16",
    "code": "B",
    "name": "Ruta B"
  },
  {
    "amount": "106134",
    "route_rate_id": "82864a2d-0aed-4114-a322-3aefe154f276",
    "route_type_id": "16658cbf-13ed-4116-9219-23b11354c845",
    "valid_from": "2025-04-16",
    "code": "C",
    "name": "Ruta C"
  },
  {
    "amount": "129000",
    "route_rate_id": "0153a293-d59d-4574-88e2-386e580c0e7c",
    "route_type_id": "a09d5694-f7f4-49c5-992a-dd78b9d8444e",
    "valid_from": "2025-04-16",
    "code": "D",
    "name": "Ruta D"
  },
  {
    "amount": "135000",
    "route_rate_id": "83ac0f55-0c29-4c6e-b42f-a129b2f54da4",
    "route_type_id": "26e3a0a7-4e91-4a7d-b928-c942dcf88052",
    "valid_from": "2025-04-16",
    "code": "E",
    "name": "Ruta E"
  }
]

const getRouteTypeByDate = (date: string, name: string) => {
  const validRouteTypes = routeTypes.filter(rt => {
    const validFrom = new Date(rt.valid_from);
    const targetDate = new Date(date);
    return targetDate >= validFrom;
  })
  .filter(rt => rt.name === name);
  return validRouteTypes;
};

// 1. Definir la estructura de los datos del CSV para tener tipado fuerte
interface Usuario {
  'Fecha': string;
  'Kilometros iniciales': number;
  'Kilometros finales': number;
  'Paquetes ML': number;
  'Paquetes SP': number;
  'Paquetes devueltos': number;
  'Ciudad': string;
  'Tarifa/Km': string;
  'Ruta': string;
  'Tarifa/ruta': string;
}

// 2. Recrear __dirname usando import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Tu código original ahora funcionará perfectamente
const csvFilePath = path.join(__dirname, 'Estado contable - Trabajo.csv');


function parseMonedaToNumero(textoMoneda: string): number {
  if (!textoMoneda) return 0;

  let limpio = textoMoneda.trim();

  // 1. Detectar si es un número negativo contable (ej: entre paréntesis "(100)" o con signo "-")
  const esNegativo = limpio.startsWith('-') || (limpio.startsWith('(') && limpio.endsWith(')'));

  // 2. Remover todo lo que no sea número, coma o punto
  limpio = limpio.replace(/[^0-9,.]/g, '');

  // 3. Si el formato es español (usa puntos para miles y coma para decimal):
  //    Ejemplo: "1.500,50" -> quitamos el punto -> "1500,50" -> cambiamos coma por punto -> "1500.50"
  if (limpio.includes(',') && limpio.includes('.')) {
    limpio = limpio.replace(/\./g, '').replace(',', '.');
  } else if (limpio.includes(',')) {
    // Si solo tiene comas, asumimos que es el separador decimal (ej: "1500,50")
    limpio = limpio.replace(',', '.');
  }

  // 4. Convertir a número float
  const resultado = parseFloat(limpio);
  
  if (isNaN(resultado)) return 0;

  return esNegativo ? -resultado : resultado;
}

/**
 Creando ruta con los siguientes datos: {
  routeDate: '2026-11-08',
  destinationCity: 'Azul',
  vehicleKmStart: 2,
  vehicleKmEnd: 3,
  notes: null,
  companies: [
    {
      companyId: 'aa51cdbd-d17b-4a84-b3ce-35fb604236a6',
      packagesReceived: 2,
      packagesUndelivered: 2,
      routingType: 'ROUTE',
      rateAmount: 58500,
      routeRateAmount: 58500,
      routeRateId: 'b781837c-ff85-4c54-86c8-772f10bef1e5',
      routeTypeId: '6c1efe90-1073-4e42-a186-1686f2d85404'
    },
    {
      companyId: '5ff59e50-09a4-4c10-8c15-9c4a4757bab5',
      packagesReceived: 2,
      packagesUndelivered: 2,
      routingType: 'PACKAGE',
      rateAmount: 1840,
      packageAmount: 1840,
      companyRateId: '2a97efdc-a35b-4279-9854-3ac6e48aa622'
    }
  ]
}
 */
// 2. Crear el stream de lectura e inyectarlo en csv-parser
fs.createReadStream(csvFilePath)
  .pipe(
    csvParser({
      // 1. Fuerza el separador a punto y coma (muy común en Excel en español)
      separator: ',', 
      
      // 2. Limpia espacios en blanco alrededor de los nombres de las columnas
      mapHeaders: ({ header }) => header.trim() 
    })
  ) // Convierte automáticamente cada fila en un objeto JS
  .on('data', (row: Usuario) => {
    console.log('Fila leída del CSV:', getRouteTypeByDate(row['Fecha'], row['Ruta']))
    /*
    const route = {
      routeDate: row['Fecha'],
      destinationCity: row['Ciudad'],
      vehicleKmStart: row['Kilometros iniciales'],
      vehicleKmEnd: row['Kilometros finales'],
      notes: null,
      companies: [{
        companyId: 'aa51cdbd-d17b-4a84-b3ce-35fb604236a6',
        packagesReceived: row['Paquetes ML'],
        packagesUndelivered: row['Paquetes devueltos'],
        routingType: 'ROUTE',
        rateAmount: parseMonedaToNumero(row['Tarifa/ruta']),
        routeRateAmount: getRouteTypeByDate(row['Fecha'], row['Ruta'])[0]?.amount || 0,
        routeRateId: getRouteTypeByDate(row['Fecha'], row['Ruta'])[0]?.route_rate_id || null,
      }]
    }

    if (row['Paquetes SP'] > 0) {
      route.companies.push({
        companyId: '5ff59e50-09a4-4c10-8c15-9c4a4757bab5',
        packagesReceived: row['Paquetes SP'],
        packagesUndelivered: 0,
        routingType: 'PACKAGE',
        rateAmount: 1800,
        packageAmount: 1800,
        companyRateId: '2a97efdc-a35b-4279-9854-3ac6e48aa622'
      });
    }

    console.log('Creando ruta con los siguientes datos:', route)
    */
  })
  .on('end', () => {
    console.log('Análisis del archivo CSV finalizado con éxito.');
  })
  .on('error', (error) => {
    console.error('Ocurrió un error al leer el archivo:', error);
  });
