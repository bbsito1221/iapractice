import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { getEntradas, createEntrada, updateEntrada, deleteEntrada } from './src/db/entradas.ts';
import {
  ENTRADAS_INICIALES_ESTUDIANTILES,
  USUARIOS_PREDEFINIDOS,
  EMPRESAS_PREDEFINIDAS,
  CONFIGURACION_TP_PREDEFINIDA,
} from './src/data/usuarios.ts';
import {
  enviarNotificacionValidacion,
  obtenerNotificacionesServidor,
  marcarNotificacionLeidaServidor,
} from './src/server/emailService.ts';

// Almacén en memoria del servidor con persistencia de sesión
let serverEntradas = [...ENTRADAS_INICIALES_ESTUDIANTILES];
let serverUsuarios = [...USUARIOS_PREDEFINIDOS];
let serverEmpresas = [...EMPRESAS_PREDEFINIDAS];
let serverConfiguracion = { ...CONFIGURACION_TP_PREDEFINIDA };

async function startServer() {
  const app = express();
  const portArgIndex = process.argv.indexOf('--port');
  const portArg = portArgIndex !== -1 ? process.argv[portArgIndex + 1] : undefined;
  const PORT = Number(portArg) || (process.env.PORT ? Number(process.env.PORT) : 3000);

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // User synchronization endpoint with Firebase Auth
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid || !req.user.email) {
        return res.status(400).json({ error: 'Invalid user token credentials' });
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email);
      res.json(user);
    } catch (error: any) {
      console.error('Failed to sync user with database:', error);
      res.status(500).json({ error: 'Failed to sync user account' });
    }
  });

  // ==========================================
  // RUTAS API: BITÁCORAS DE PRÁCTICA
  // ==========================================

  // Listar entradas
  app.get('/api/entradas', async (req, res) => {
    try {
      if (process.env.SQL_HOST) {
        const data = await getEntradas();
        if (data && data.length > 0) {
          return res.json(data);
        }
      }
      res.json(serverEntradas);
    } catch (error: any) {
      console.error('Database query fallback, serving local memory store:', error);
      res.json(serverEntradas);
    }
  });

  // Crear entrada en bitácora
  app.post('/api/entradas', async (req, res) => {
    try {
      const {
        titulo,
        categoria,
        fecha,
        contenido,
        tags,
        estado,
        departamento,
        responsable,
        prioridad,
        turno,
        tiempoDedicado,
        accionesTomadas,
        observaciones,
        autorId,
        autorEmail,
        autorMatricula,
        rutAlumno,
        empresaNombre,
        rutEmpresa,
        horaEntrada,
        horaSalida,
        colacionMinutos,
        horasRegistradas,
        competenciasAplicadas,
        dificultadesSolucion,
        voboTutorEmpresa,
        tutorEmpresaNombre,
        fechaVoboEmpresa,
        comentarioTutorEmpresa,
        estadoVerificacion,
        verificadoPor,
        fechaVerificacion,
        comentarioDocente,
      } = req.body;

      if (!titulo || !contenido) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      let nuevaEntrada: any = {
        id: Date.now(),
        titulo,
        categoria: categoria || 'Jornada de Práctica',
        fecha: fecha || new Date().toISOString().split('T')[0],
        contenido,
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
        estado: estado || 'Completado',
        departamento,
        responsable,
        prioridad: prioridad || 'Media',
        turno: turno || 'Matutino',
        tiempoDedicado: tiempoDedicado || `${horasRegistradas || 8} horas`,
        accionesTomadas,
        observaciones,
        autorId,
        autorEmail,
        autorMatricula,
        rutAlumno,
        empresaNombre,
        rutEmpresa,
        horaEntrada: horaEntrada || '08:30',
        horaSalida: horaSalida || '17:30',
        colacionMinutos: typeof colacionMinutos === 'number' ? colacionMinutos : 60,
        horasRegistradas: typeof horasRegistradas === 'number' ? horasRegistradas : 8,
        competenciasAplicadas,
        dificultadesSolucion,
        voboTutorEmpresa: voboTutorEmpresa || 'Pendiente',
        tutorEmpresaNombre,
        fechaVoboEmpresa,
        comentarioTutorEmpresa,
        estadoVerificacion: estadoVerificacion || 'Pendiente',
        verificadoPor,
        fechaVerificacion,
        comentarioDocente,
        creadoEn: new Date().toISOString(),
      };

      if (process.env.SQL_HOST) {
        try {
          const entry = await createEntrada({
            titulo,
            categoria: categoria || 'Jornada de Práctica',
            fecha: fecha || new Date().toISOString().split('T')[0],
            contenido,
            tags: Array.isArray(tags) ? tags.join(', ') : tags,
            estado: estado || 'Completado',
            departamento,
            responsable,
            prioridad: prioridad || 'Media',
            turno,
            tiempoDedicado,
            accionesTomadas,
            observaciones,
            autorId,
            autorEmail,
            autorMatricula,
            rutAlumno,
            empresaNombre,
            rutEmpresa,
            horaEntrada,
            horaSalida,
            colacionMinutos,
            horasRegistradas,
            competenciasAplicadas,
            dificultadesSolucion,
            voboTutorEmpresa,
            tutorEmpresaNombre,
            fechaVoboEmpresa,
            comentarioTutorEmpresa,
            estadoVerificacion,
            verificadoPor,
            fechaVerificacion,
            comentarioDocente,
          });
          if (entry && entry.id) {
            nuevaEntrada = { ...nuevaEntrada, id: entry.id };
          }
        } catch (dbErr) {
          console.warn('SQL Insert failed, keeping memory persistence:', dbErr);
        }
      }

      serverEntradas = [nuevaEntrada, ...serverEntradas];
      res.status(201).json(nuevaEntrada);
    } catch (error: any) {
      console.error('Failed to save entry:', error);
      res.status(200).json({ id: Date.now(), ...req.body });
    }
  });

  // Actualizar entrada en bitácora
  app.put('/api/entradas/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updateData = req.body;

      if (process.env.SQL_HOST) {
        try {
          await updateEntrada(id, updateData);
        } catch (dbErr) {
          console.warn('SQL Update fallback to memory:', dbErr);
        }
      }

      serverEntradas = serverEntradas.map((item) =>
        item.id === id ? { ...item, ...updateData } : item
      );

      const updated = serverEntradas.find((item) => item.id === id) || { id, ...updateData };
      res.json(updated);
    } catch (error: any) {
      console.error('Failed to update entry:', error);
      res.json({ id: parseInt(req.params.id, 10), ...req.body });
    }
  });

  // Eliminar entrada
  app.delete('/api/entradas/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (process.env.SQL_HOST) {
        try {
          await deleteEntrada(id);
        } catch (dbErr) {
          console.warn('SQL Delete fallback to memory:', dbErr);
        }
      }
      serverEntradas = serverEntradas.filter((item) => item.id !== id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to delete entry:', error);
      res.status(500).json({ error: 'Failed to delete entry' });
    }
  });

  // ==========================================
  // RUTAS API: GESTIÓN DE USUARIOS
  // ==========================================

  app.get('/api/usuarios', (req, res) => {
    res.json(serverUsuarios);
  });

  app.post('/api/usuarios', (req, res) => {
    const nuevo = req.body;
    if (!nuevo.id) {
      nuevo.id = `usr-${Date.now()}`;
    }
    serverUsuarios = [...serverUsuarios, nuevo];
    res.status(201).json(nuevo);
  });

  app.put('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    serverUsuarios = serverUsuarios.map((u) => (u.id === id ? { ...u, ...data } : u));
    res.json({ id, ...data });
  });

  app.delete('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    serverUsuarios = serverUsuarios.filter((u) => u.id !== id);
    res.json({ success: true });
  });

  // ==========================================
  // RUTAS API: GESTIÓN DE EMPRESAS
  // ==========================================

  app.get('/api/empresas', (req, res) => {
    res.json(serverEmpresas);
  });

  app.post('/api/empresas', (req, res) => {
    const nueva = req.body;
    if (!nueva.id) {
      nueva.id = `emp-${Date.now()}`;
    }
    serverEmpresas = [...serverEmpresas, nueva];
    res.status(201).json(nueva);
  });

  app.put('/api/empresas/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    serverEmpresas = serverEmpresas.map((e) => (e.id === id ? { ...e, ...data } : e));
    res.json({ id, ...data });
  });

  app.delete('/api/empresas/:id', (req, res) => {
    const { id } = req.params;
    serverEmpresas = serverEmpresas.filter((e) => e.id !== id);
    res.json({ success: true });
  });

  // ==========================================
  // RUTAS API: PARÁMETROS Y ESTRUCTURA TP (MINEDUC)
  // ==========================================

  app.get('/api/configuracion', (req, res) => {
    res.json(serverConfiguracion);
  });

  app.put('/api/configuracion', (req, res) => {
    serverConfiguracion = { ...serverConfiguracion, ...req.body };
    res.json(serverConfiguracion);
  });

  // ==========================================
  // RUTAS API: NOTIFICACIONES POR EMAIL
  // ==========================================

  // Listar historial de notificaciones enviadas
  app.get('/api/notificaciones', (req, res) => {
    try {
      const notifs = obtenerNotificacionesServidor();
      res.json(notifs);
    } catch (error: any) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
  });

  // Enviar nueva notificación por email a profesores y tutores
  app.post('/api/notificaciones/email', async (req, res) => {
    try {
      const notificacion = await enviarNotificacionValidacion(req.body);
      res.status(201).json(notificacion);
    } catch (error: any) {
      console.error('Error al despachar notificación por email:', error);
      res.status(500).json({ error: 'Error al enviar notificación por email' });
    }
  });

  // Marcar notificación como leída
  app.post('/api/notificaciones/:id/marcar-leido', (req, res) => {
    try {
      const { id } = req.params;
      const { usuarioIdOEmail } = req.body;
      const exito = marcarNotificacionLeidaServidor(id, usuarioIdOEmail || 'anon');
      res.json({ success: exito });
    } catch (error: any) {
      console.error('Error al marcar notificación:', error);
      res.status(500).json({ error: 'Error al actualizar notificación' });
    }
  });

  // Reenviar notificación de validación
  app.post('/api/notificaciones/reenviar/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const existente = obtenerNotificacionesServidor().find((n) => n.id === id);
      if (!existente) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }

      const reenviada = await enviarNotificacionValidacion({
        entradaId: existente.entradaId,
        tipo: 'recordatorio_validacion',
        alumnoNombre: existente.alumnoNombre,
        alumnoEmail: existente.alumnoEmail,
        alumnoRut: existente.alumnoRut,
        empresaNombre: existente.empresaNombre,
        carrera: existente.carrera,
        jornadaFecha: existente.jornadaFecha,
        horasRegistradas: existente.horasRegistradas,
        tituloEntrada: existente.tituloEntrada,
        contenido: existente.resumenContenido,
      });

      res.json(reenviada);
    } catch (error: any) {
      console.error('Error al reenviar notificación:', error);
      res.status(500).json({ error: 'Error al reenviar notificación' });
    }
  });

  // Vite middleware for development / static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server error:', err);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
