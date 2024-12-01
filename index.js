const express = require('express');
const axios = require('axios');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:4200",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

app.post('/getImages', async (req, res) => {
  const prompt = req.body;
  console.log('Recibiendo solicitud para generar imagen con:', req.body);

  try {
    const response = await axios.post(
      'https://cl.imagineapi.dev/items/images/',
      prompt,
      {
        headers: {
          'Authorization': 'f64psixY348VEyeVVf6RoZNK40H-9kK9',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Respuesta de la API externa:', response.data);

    const imageId = response.data.id;

    return res.status(200).json({ imageId });
  } catch (error) {
    console.error('Error al solicitar la imagen:', error);
    res.status(500).send('Hubo un error al generar la imagen');
  }
});

app.post('/webhook', (req, res) => {
  const { imageId, status, upscaledUrl } = req.body;

  console.log('Webhook recibido:', req.body);

  if (status === 'completed') {
    io.emit('imageReady', { imageId, upscaledUrl });
    console.log('Imagen lista. Enviando a los clientes...');
  }

  res.status(200).send('Webhook recibido');
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
