import { PrismaClient } from '@prisma/client';
import { logger } from '../src/config/logger';

const prisma = new PrismaClient();

/**
 * Script de seed para inicializar la base de datos con datos de ejemplo
 * Útil para desarrollo y testing
 */
async function main() {
  logger.info('🌱 Iniciando seed de base de datos...');

  try {
    // Limpiar datos existentes en desarrollo
    if (process.env.NODE_ENV === 'development') {
      logger.info('🧹 Limpiando datos existentes...');
      await prisma.auditLog.deleteMany();
      await prisma.processingJob.deleteMany();
      await prisma.document.deleteMany();
      await prisma.template.deleteMany();
      await prisma.user.deleteMany();
      await prisma.tenant.deleteMany();
    }

    // Crear tenant de ejemplo
    const demoTenant = await prisma.tenant.create({
      data: {
        name: 'Demo Company',
        hubspotPortalId: '12345678',
        isActive: true,
        settings: {
          timezone: 'America/Mexico_City',
          dateFormat: 'DD/MM/YYYY',
          language: 'es',
        },
      },
    });

    logger.info('✅ Tenant creado:', demoTenant.name);

    // Crear usuario administrador de ejemplo
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@democompany.com',
        firstName: 'Admin',
        lastName: 'Demo',
        tenantId: demoTenant.id,
        isActive: true,
        preferences: {
          language: 'es',
          theme: 'light',
        },
      },
    });

    logger.info('✅ Usuario administrador creado:', adminUser.email);

    // Crear template de ejemplo - Contrato de servicios
    const contractTemplate = await prisma.template.create({
      data: {
        name: 'Contrato de Servicios',
        description: 'Template para contratos de servicios con clientes',
        content: `
          <h1>CONTRATO DE SERVICIOS</h1>
          
          <p><strong>Fecha:</strong> {{current_date}}</p>
          
          <h2>DATOS DEL CLIENTE</h2>
          <p><strong>Nombre:</strong> {{contact.firstname}} {{contact.lastname}}</p>
          <p><strong>Email:</strong> {{contact.email}}</p>
          <p><strong>Teléfono:</strong> {{contact.phone}}</p>
          <p><strong>Empresa:</strong> {{company.name}}</p>
          
          <h2>DATOS DEL PROYECTO</h2>
          <p><strong>Nombre del Proyecto:</strong> {{deal.dealname}}</p>
          <p><strong>Valor del Contrato:</strong> ${{deal.amount}} {{deal.deal_currency_code}}</p>
          <p><strong>Fecha de Inicio:</strong> {{deal.closedate}}</p>
          
          <h2>TÉRMINOS Y CONDICIONES</h2>
          <p>Este contrato establece los términos y condiciones para la prestación de servicios...</p>
          
          <div style="margin-top: 50px;">
            <p>_______________________</p>
            <p>Firma del Cliente</p>
          </div>
        `,
        variables: [
          {
            name: 'contact.firstname',
            label: 'Nombre del contacto',
            type: 'contact.property',
            required: true,
          },
          {
            name: 'contact.lastname',
            label: 'Apellido del contacto',
            type: 'contact.property',
            required: true,
          },
          {
            name: 'contact.email',
            label: 'Email del contacto',
            type: 'contact.property',
            required: true,
          },
          {
            name: 'contact.phone',
            label: 'Teléfono del contacto',
            type: 'contact.property',
            required: false,
          },
          {
            name: 'company.name',
            label: 'Nombre de la empresa',
            type: 'company.property',
            required: true,
          },
          {
            name: 'deal.dealname',
            label: 'Nombre del deal',
            type: 'deal.property',
            required: true,
          },
          {
            name: 'deal.amount',
            label: 'Valor del deal',
            type: 'deal.property',
            required: true,
          },
          {
            name: 'deal.deal_currency_code',
            label: 'Moneda del deal',
            type: 'deal.property',
            required: false,
            defaultValue: 'MXN',
          },
          {
            name: 'deal.closedate',
            label: 'Fecha de cierre',
            type: 'deal.property',
            required: false,
          },
          {
            name: 'current_date',
            label: 'Fecha actual',
            type: 'custom',
            required: false,
          },
        ],
        tenantId: demoTenant.id,
        createdById: adminUser.id,
        isDefault: true,
      },
    });

    logger.info('✅ Template de contrato creado:', contractTemplate.name);

    // Crear template de ejemplo - Propuesta comercial
    const proposalTemplate = await prisma.template.create({
      data: {
        name: 'Propuesta Comercial',
        description: 'Template para propuestas comerciales a prospectos',
        content: `
          <div style="text-align: center; margin-bottom: 30px;">
            <h1>PROPUESTA COMERCIAL</h1>
            <p style="color: #666;">Propuesta para {{company.name}}</p>
          </div>
          
          <h2>Estimado(a) {{contact.firstname}},</h2>
          
          <p>Gracias por su interés en nuestros servicios. A continuación presentamos nuestra propuesta:</p>
          
          <h3>RESUMEN DEL PROYECTO</h3>
          <p><strong>Proyecto:</strong> {{deal.dealname}}</p>
          <p><strong>Descripción:</strong> {{deal.description}}</p>
          
          <h3>INVERSIÓN</h3>
          <p><strong>Valor Total:</strong> ${{deal.amount}} {{deal.deal_currency_code}}</p>
          <p><strong>Fecha estimada de inicio:</strong> {{deal.closedate}}</p>
          
          <h3>CONTACTO</h3>
          <p>Para cualquier consulta, no dude en contactarnos:</p>
          <p><strong>Email:</strong> contacto@empresa.com</p>
          <p><strong>Teléfono:</strong> +52 55 1234 5678</p>
          
          <p style="margin-top: 40px;">Esperamos poder trabajar juntos.</p>
          <p><strong>Atentamente,</strong></p>
          <p>El equipo de ventas</p>
        `,
        variables: [
          {
            name: 'contact.firstname',
            label: 'Nombre del contacto',
            type: 'contact.property',
            required: true,
          },
          {
            name: 'company.name',
            label: 'Nombre de la empresa',
            type: 'company.property',
            required: true,
          },
          {
            name: 'deal.dealname',
            label: 'Nombre del deal',
            type: 'deal.property',
            required: true,
          },
          {
            name: 'deal.description',
            label: 'Descripción del deal',
            type: 'deal.property',
            required: false,
          },
          {
            name: 'deal.amount',
            label: 'Valor del deal',
            type: 'deal.property',
            required: true,
          },
          {
            name: 'deal.deal_currency_code',
            label: 'Moneda del deal',
            type: 'deal.property',
            required: false,
            defaultValue: 'MXN',
          },
          {
            name: 'deal.closedate',
            label: 'Fecha de cierre',
            type: 'deal.property',
            required: false,
          },
        ],
        tenantId: demoTenant.id,
        createdById: adminUser.id,
      },
    });

    logger.info('✅ Template de propuesta creado:', proposalTemplate.name);

    // Crear documento de ejemplo
    const sampleDocument = await prisma.document.create({
      data: {
        name: 'Contrato - Demo Client',
        templateId: contractTemplate.id,
        status: 'COMPLETED',
        variables: {
          'contact.firstname': 'Juan',
          'contact.lastname': 'Pérez',
          'contact.email': 'juan.perez@example.com',
          'contact.phone': '+52 55 9876 5432',
          'company.name': 'Ejemplo S.A. de C.V.',
          'deal.dealname': 'Proyecto Website Corporativo',
          'deal.amount': '50000',
          'deal.deal_currency_code': 'MXN',
          'deal.closedate': '2024-02-15',
          'current_date': new Date().toLocaleDateString('es-MX'),
        },
        hubspotObjectType: 'DEAL',
        hubspotObjectId: 'demo-deal-123',
        tenantId: demoTenant.id,
        createdById: adminUser.id,
      },
    });

    logger.info('✅ Documento de ejemplo creado:', sampleDocument.name);

    // Crear log de auditoría de ejemplo
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'template',
        entityId: contractTemplate.id,
        newValues: {
          name: contractTemplate.name,
          description: contractTemplate.description,
        },
        userId: adminUser.id,
        userEmail: adminUser.email,
        tenantId: demoTenant.id,
      },
    });

    logger.info('✅ Log de auditoría creado');

    logger.info('🎉 Seed completado exitosamente!');
    logger.info(`
    📊 Datos creados:
    - 1 Tenant: ${demoTenant.name}
    - 1 Usuario: ${adminUser.email}
    - 2 Templates: Contrato y Propuesta
    - 1 Documento de ejemplo
    - 1 Log de auditoría
    `);

  } catch (error) {
    logger.error('❌ Error en seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
