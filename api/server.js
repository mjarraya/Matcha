import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import socketIo from 'socket.io';
import _ from 'lodash';
import moment from 'moment';
import mongoConnect from './app/models/mongo';
import * as user from './app/models/user';
import * as avi from './app/models/avi';

const users = [];
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
	socket.on('auth', (logToken) => {
		mongoConnect(null, async (db) => {
			const log = await db.collection('users').findOne({ logToken });
			if (!log) return socket.emit('connection status', false);
			db.collection('users').update({ logToken }, { $set: { lastOnline: 'now' } });
			if (!_.find(users, (el) => el.username === log.username)) users.push({ username: log.username, socket });
			return socket.emit('connection status', true);
		});
	});
	socket.on('disconnect', () => {
		mongoConnect(null, async (db) => {
			const username = await _.find(users, { socket }).username;
			db.collection('users').update({ username }, { $set: { lastOnline: moment().format() } });
			_.remove(users, { socket });
		});
	});
	// socket.on('notifications', (message) => {
	// });
});

app.use('/media', express.static('media'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.post('/register', user.add);
app.post('/login', user.signin);
app.post('/forgot', user.forgot);
app.post('/reset', user.reset);
app.post('/check', user.check);
app.post('/logout', user.signout);
app.put('/edit', user.modify);
app.post('/deactivate', user.drop);
app.put('/upload', avi.imgupload);
app.delete('/remove', avi.imgremove);
app.get('/profile', user.profile(users));
app.put('/profile/:user', user.publicprofile(users));
app.post('/like', user.like(users));
app.post('/unlike', user.unlike(users));
app.post('/block', user.block);
app.post('/unblock', user.unblock);
app.post('/report', user.report);
app.get('/list', user.list);
app.post('/search', user.search);
app.post('/unnotify', user.unnotify);
app.post('/chat', user.chat(users));

server.listen(8080);
