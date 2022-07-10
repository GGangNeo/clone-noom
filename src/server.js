import express from 'express';

const app = express();
// set view engine as pus
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
// set public folder, expose for user
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
// catch all url
app.get('/*', (req, res) => res.redirect('/'));
const handleListen = () => console.log(`Listening on http://localhost:3000`);
app.listen(3000, handleListen);
