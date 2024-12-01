const express = require('express');
const axios = require('axios');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
require('dotenv').config();

const apiKey = process.env.AUTH;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://jozefpv.github.io',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
});

const PORT = process.env.PORT || 3000;
app.use(express.json());

const corsOptions = {
  origin: 'https://jozefpv.github.io',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization'
};

app.use(cors(corsOptions));

app.post('/getImages', async (req, res) => {
  const prompt = req.body;
  console.log('Recibiendo solicitud para generar imagen con:', req.body);

  try {
    const response = await axios.post(
      'https://cl.imagineapi.dev/items/images/',
      prompt,
      {
        headers: {
          'Authorization': 'yQrrja14kwacTQgnMCtmj05tp7K_9PqL',
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Respuesta de la API:', response.data); // Muestra el cuerpo de la respuesta
  } catch (error) {
    // Si hay un error, muestra toda la respuesta de la API, si está disponible
    if (error.response) {
      console.error('Error en la respuesta:', error.response.status);  // Código de estado
      console.error('Encabezados de la respuesta:', error.response.headers);  // Encabezados
      console.error('Cuerpo de la respuesta:', error.response.data);  // Cuerpo de la respuesta
    } else {
      console.error('Error al realizar la solicitud:', error.message);  // Si hay un error en la solicitud
    }
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
  
  socket.on('event', (message) => {
    console.log('Mensaje recibido:', message);
    io.emit('event', message);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
