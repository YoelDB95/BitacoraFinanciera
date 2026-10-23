import { db } from '../prisma/db'; 

// 1. Cargar las variables de entorno de tu archivo .env
import 'dotenv/config'; 
// Si estás usando Node 22+, puedes usar Array.fromAsync, si no, usa una utilidad o for await

import { and } from "@prisma/orm-postgres/orm-client";

async function verificarSentencia() {
  try {
    console.log("🔄 Inicializando y conectando al driver de Postgres...");
    
    // 2. 💡 CONECTAR EL DRIVER EXPLÍCITAMENTE ANTES DE LA SENTENCIA
    // En Prisma 8, el cliente expone un método para instanciar la conexión
    await db.connect({
      url: process.env.DATABASE_URL
    }); 

    console.log("🚀 Ejecutando sentencia...");
    
    // 3. Ejecuta tu consulta individual
    const planDeConsulta = db.orm.public.Companies.select('routingType')
  .where((company) =>and(company.id.eq('5ff59e50-09a4-4c10-8c15-9c4a4757bab5'), company.active.eq(true)))
  .all()

    
const resultado = await Array.fromAsync(planDeConsulta);
    console.log("✅ Datos obtenidos con éxito:");
    console.dir(resultado, { depth: null });

  } catch (error) {
    console.error("❌ Error al ejecutar la sentencia:", error);
  } finally {
    // 5. 💡 Cerrar la conexión limpiamente al terminar
    await db.close();
    console.log("🔌 Conexión cerrada.");
  }
}

verificarSentencia();
    