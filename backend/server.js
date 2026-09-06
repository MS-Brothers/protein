require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Production Server] Server is running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection Error]:', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception Error]:', err);
});
