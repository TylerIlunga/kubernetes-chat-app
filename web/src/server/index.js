const app = require('../../app');
const { port } = require('../config');
app.listen(port, error => {
  if (error) return console.error('Server init error: ', error);
  console.log('Listening on port', port);
});
