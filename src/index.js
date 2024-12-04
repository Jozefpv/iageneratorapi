import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import { createImageData } from './queries/query.js';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://jozefpv.github.io', 'http://localhost:4200'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
});

const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cookieParser())

const corsOptions = {
  origin: ['https://jozefpv.github.io', 'http://localhost:4200'],
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
};

app.use(cors(corsOptions));

app.use('/auth', authRoutes)

app.post('/getImages', async (req, res) => {
  const promptText = `Black and white line art of ${req.body.prompt}, no colors, clear bold black outlines, no shading, white background, high resolution, designed for kids to color, simple but detailed enough for creativity `;
  const userGuid = req.body.userGuid
    try {
      const response = await fetch('https://cl.imagineapi.dev/items/images/', {
          method: 'POST',
          headers: {
              'Authorization': 'Bearer yQrrja14kwacTQgnMCtmj05tp7K_9PqL',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({prompt: promptText})
      });

      const responseData = await response.json();
      console.log(responseData);

    const imageId = responseData.data.id;
    const imageStatus = response.data.status;

    const image = await createImageData(imageId, userGuid, imageStatus)

    return res.status(200).json({ image: image });
  } catch (error) {
    console.error('Error al solicitar la imagen:', error);
    res.status(500).send('Hubo un error al generar la imagen');
  }
});

app.post('/webhook', (req, res) => {
  try {
    const { event, payload } = req.body;
    console.log('Webhook recibido:', event, payload);

    const { status, id, upscaled_urls, error, progress, url } = payload;

    if (status === 'completed' && upscaled_urls) {
      io.emit('imageReady', { id, upscaledUrls: upscaled_urls });
      console.log('Imagen generada y lista:', upscaled_urls);
    } else if (status === 'failed') {
      io.emit('imageError', { id, error });
      console.log('Error en la generación de la imagen:', error);
    } else if (status === 'in-progress') {
      io.emit('imageProgress', { id, progress });
      console.log(`Imagen en progreso: ${progress}%`);
    } else if (status === 'pending') {
      io.emit('imagePending', { id, url });
      console.log('Generación de imagen pendiente...');
    }

    res.status(200).send('Webhook recibido');
  } catch (err) {
    console.error('Error en el webhook:', err);
    res.status(500).send('Hubo un error procesando el webhook');
  }
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});