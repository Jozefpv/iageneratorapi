import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';


import { corsOptions, ioCorsOptions } from './config/corsConfig.js';
import { createImageData, getImageCountByUserGuid, getUserDataByImageGuid, updateUserImageCount } from './controllers/imagesController.js';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, ioCorsOptions);

const PORT = process.env.PORT || 3000;
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  message: 'Demasiadas solicitudes desde esta IP, intenta nuevamente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

//Middlewares para configurar las cors, las cookies y el formato json
app.use(express.json());
app.use(cookieParser())
app.use(cors(corsOptions));
app.use(apiLimiter);

//Rutas relacionadas con la autenticación
app.use('/auth', authRoutes)

const userSockets = new Map();

app.post('/getImages', async (req, res) => {
  console.log(req.body)
  const promptText = `Black and white line art of ${req.body.prompt}, no colors, clear bold black outlines, no shading, white background, high resolution, designed for kids to color, simple but detailed enough for creativity `;
  const userGuid = req.body.userGuid
    try {
      const test = await getImageCountByUserGuid(userGuid)
      console.log("aqui, " , test)

      if(test.imageCount > 4){
        res.status(401).json({counter: -1})
      }

      const newCounter = test.imageCount + 1
      updateUserImageCount(userGuid,  newCounter)

      const response = await fetch('https://cl.imagineapi.dev/items/images/', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${process.env.AUTH}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({prompt: promptText})
      });

      const responseData = await response.json();
      console.log(responseData);

    const imageId = responseData.data.id;
    const imageStatus = responseData.data.status;

    const image = await createImageData(imageId, userGuid, imageStatus);

    return res.status(200).json({ image });
  } catch (error) {
    console.error('Error en /getImages:', error);
    return res.status(500).json({ message: 'Error al procesar la solicitud', error });
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const { event, payload } = req.body;
    console.log('Webhook recibido:', event, payload);

    const { status, id, upscaled_urls, error, progress, url } = payload;

    const userData = await getUserDataByImageGuid(id);
    console.log('Resultado de Supabase (userData):', userData);

    if (userData) {
      const userGuid = userData.userGuid;
      console.log('Buscando userGuid en userSockets:', userGuid);

      const userSocketId = userSockets.get(userGuid);
      console.log('userSocketId encontrado:', userSocketId);

      if (userSocketId) {
        const socket = io.sockets.sockets.get(userSocketId);
        console.log('Socket encontrado:', socket);

        if (status === 'completed' && upscaled_urls) {
          socket.emit('imageReady', { id, upscaledUrls: upscaled_urls });
        } else if (status === 'failed') {
          socket.emit('imageError', { id, error });
        } else if (status === 'in-progress') {
          socket.emit('imageProgress', { id, progress });
        } else if (status === 'pending') {
          socket.emit('imagePending', { id, url });
        }
      } else {
        console.warn('No se encontró un socket para el userGuid:', userGuid);
      }
    } else {
      console.warn('No se encontró userData para el id:', id);
    }

    res.status(200).send('Webhook recibido');
  } catch (err) {
    console.error('Error en el webhook:', err);
    res.status(500).send('Hubo un error procesando el webhook');
  }
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('userGuid', (userGuid) => {
    if(userGuid){
      userSockets.set(userGuid, socket.id)
    }
  })

  socket.on('logout', (data) => {
    const userGuid = data.userGuid;
    if (userGuid) {
      // Realiza alguna acción adicional al logout, si es necesario
      console.log(`Cerrando sesión para el userGuid: ${userGuid}`);
      userSockets.delete(userGuid);
      console.log(`userGuid ${userGuid} eliminado del mapa`);
    }
  })

  socket.on('disconnect', () => {
    for (let [userGuid, socketId] of userSockets) {
      if (socketId === socket.id) {
        userSockets.delete(userGuid);
        console.log(`userGuid ${userGuid} desconectado y eliminado`);
        break;
      }
    }
  })
});

app.get('/cron-endpoint', (req, res) => {
  res.status(200).json({ message: 'Cron ejecutado correctamente' });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
