import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';

import { corsOptions, ioCorsOptions } from './config/corsConfig.js';
import { createImageData, getUserDataByImageGuid, updateUserImageCount } from './controllers/imagesController.js';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, ioCorsOptions);

const PORT = process.env.PORT || 3000;

//Middlewares para configurar las cors, las cookies y el formato json
app.use(express.json());
app.use(cookieParser())
app.use(cors(corsOptions));

//Rutas relacionadas con la autenticación
app.use('/auth', authRoutes)

const userSockets = new Map();

app.post('/getImages', async (req, res) => {
  console.log(req.body)
  const promptText = `Black and white line art of ${req.body.prompt}, no colors, clear bold black outlines, no shading, white background, high resolution, designed for kids to color, simple but detailed enough for creativity `;
  const userGuid = req.body.userGuid
    try {
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

    const image = await createImageData(imageId, userGuid, imageStatus)

    return res.status(200).json({ image: image });
  } catch (error) {
    console.error('Error al solicitar la imagen:', error);
    res.status(500).send('Hubo un error al generar la imagen');
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const { event, payload } = req.body;
    console.log('Webhook recibido:', event, payload);

    const { status, id, upscaled_urls, error, progress, url } = payload;

    const userData = await getUserDataByImageGuid(id);
    console.log(userData, "depuracion 1")
    if (userData && userData.imageCount <= 5) {

     //await updateUserImageCount(userData.userGuid, userData.imageCount + 1);

      const userSocketId = userSockets.get(userData.userGuid);
      console.log(userSocketId, "depuracion 2")

      if (userSocketId) {
        const socket = io.sockets.sockets.get(userSocketId);
        console.log('Status recibido:', status); 
        if (status === 'completed' && upscaled_urls) {
          socket.emit('imageReady', { id, upscaledUrls: upscaled_urls });
          //console.log('Imagen generada y lista:', upscaled_urls);
        } else if (status === 'failed') {
          socket.emit('imageError', { id, error });
          //console.log('Error en la generación de la imagen:', error);
        } else if (status === 'in-progress') {
          socket.emit('imageProgress', { id, progress });
          //console.log(`Imagen en progreso: ${progress}%`);
        } else if (status === 'pending') {
          socket.emit('imagePending', { id, url });
          //console.log('Generación de imagen pendiente...');
        }
      }
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
      console.log(userSockets)
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
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
