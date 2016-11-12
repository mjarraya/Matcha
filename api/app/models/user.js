import crypto from 'crypto';
import nodemailer from 'nodemailer';
import externalip from 'external-ip';
import geoip from 'geo-from-ip';
import geolib from 'geolib';
import moment from 'moment';
import _ from 'lodash';
import * as validate from './validate';
import * as auth from './auth';
import calcage from './functions';
import mongoConnect from './mongo';

const add = (req, res) => {
	const err = validate.register(req);
	if (err.error) return (res.send({ error: 'invalid request', details: err.error }));
	mongoConnect(res, async (db) => {
		const getIP = externalip();
		getIP(async (error, ip) => {
			if (error);
			const allData = geoip.allData(ip);
			const location = {
				lat: allData.location.latitude,
				lng: allData.location.longitude,
				addr: allData.city,
			};
			const user = db.collection('users');
			const { username, email, firstname, lastname, gender, birthdate } = req.body;
			const logToken = auth.generate();
			let info = {
				username,
				email,
				firstname,
				lastname,
				gender,
				orientation: 'any',
				sexualid: `${gender} any`,
				birthdate,
				age: calcage(birthdate),
				password: crypto.createHash('md5').update(req.body.password).digest('hex'),
				popscore: 0,
				likes: [],
				blocks: [],
				pictures: [],
				interests: [],
				location,
				logToken,
			};
			let exists = await user.findOne({ username });
			if (exists) return (res.send({ error: 'invalid request', details: 'user already exists' }));
			exists = await user.findOne({ email });
			if (exists) return (res.send({ error: 'invalid request', details: 'email already exists' }));
			user.insert(info);
			res.set('Access-Control-Expose-Headers', 'logtoken');
			res.set('logtoken', logToken);
			info = _.omit(info, ['password', 'crypted', 'email']);
			return (res.send(info));
		});
		return (false);
	});
	return (false);
};

const signin = async (req, res) => {
	const err = validate.login(req);
	if (err.error) return (res.send({ error: 'invalid request', details: err.error }));
	mongoConnect(res, async (db) => {
		const user = db.collection('users');
		const { username } = req.body;
		let exists = await user.findOne({ username });
		if (!exists) return (res.send({ error: 'invalid request', details: 'user not found' }));
		const password = crypto.createHash('md5').update(req.body.password).digest('hex');
		if (password !== exists.password) return (res.send({ error: 'invalid request', details: 'password does not match' }));
		const logToken = auth.generate();
		user.update({ username }, { $set: { logToken } });
		res.set('Access-Control-Expose-Headers', 'logToken');
		res.set('logToken', logToken);
		exists = _.omit(exists, ['password', 'crypted', 'email']);
		return (res.send(exists));
	});
	return (false);
};

const signout = async (req, res) => {
	mongoConnect(res, async (db) => {
		const user = db.collection('users');
		let online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		const username = online.username;
		user.update({ username }, { $unset: { logToken: '' }, $set: { lastOnline: moment().format() } });
		online = _.omit(online, ['password', 'crypted', 'email']);
		return (res.send(online));
	});
};

const modify = (req, res) => {
	const err = validate.edit(req);
	if (err.error) return (res.send({ error: 'invalid request', details: err.error }));
	mongoConnect(res, async (db) => {
		const user = db.collection('users');
		let online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		const info = { ...req.body };
		if (req.body.password) info.password = crypto.createHash('md5').update(req.body.password || '').digest('hex');
		const username = online.username;
		user.update({ username }, { $set: info });
		online = _.omit(online, ['password', 'crypted', 'email']);
		return (res.send(online));
	});
	return (false);
};

const drop = (req, res) => {
	if (!req.body.password) return (res.send({ error: 'invalid request', details: 'password is required' }));
	mongoConnect(res, async (db) => {
		const user = db.collection('users');
		let online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		const password = crypto.createHash('md5').update(req.body.password).digest('hex');
		if (password !== online.password) return (res.send({ error: 'invalid request', details: 'password does not match' }));
		const username = online.username;
		user.remove({ username });
		online = _.omit(online, ['password', 'crypted', 'email']);
		return (res.send(online));
	});
	return (false);
};

const check = (req, res) => {
	if (!req.headers.logtoken) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
	mongoConnect(res, async (db) => {
		let valid = await auth.verify(req, db);
		if (!valid) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		valid = _.omit(valid, ['password', 'crypted', 'email']);
		return (res.send(valid));
	});
	return (false);
};

const forgot = (req, res) => {
	const err = validate.forgot(req);
	if (err.error) return (res.send({ error: 'invalid request', details: err.error }));
	mongoConnect(res, async (db) => {
		const user = db.collection('users');
		const { username } = req.body;
		let exists = await user.findOne({ username });
		if (!exists) return (res.send({ error: 'invalid request', details: 'user not found' }));
		const key = new Date().getMilliseconds().toString();
		const crypted = crypto.createHash('md5').update(key).digest('hex');
		const link = `${req.protocol}://localhost:3000/reset?key=${crypted}`;
		const transporter = nodemailer.createTransport('smtps://apimatcha@gmail.com:apiMatcha1212@smtp.gmail.com');
		const mailOptions = {
				from: '"MATCHA" <support@matcha.com>',
				to: exists.email,
				subject: 'Password reset',
				html: `Click <a href="${link}">here</a> to reset`,
		};
		user.update({ username }, { $set: { crypted } });
		transporter.sendMail(mailOptions, (mailerr) => {
			if (mailerr) exists = { error: 'invalid request', details: mailerr };
		});
		exists = _.omit(exists, ['password']);
		return (res.send(exists));
	});
	return (false);
};

const reset = (req, res) => {
	const err = validate.reset(req);
	if (err.error) return (res.send({ error: 'invalid request', details: err.error }));
	mongoConnect(res, async (db) => {
		const user = db.collection('users');
		const { crypted } = req.body;
		let exists = await user.findOne({ crypted });
		if (!exists) return (res.send({ error: 'invalid request', details: 'key not found' }));
		const logToken = auth.generate();
		const key = crypto.createHash('md5').update(new Date().getMilliseconds().toString()).digest('hex');
		const info = {
			password: crypto.createHash('md5').update(req.body.password).digest('hex'),
			crypted: key,
			logToken,
		};
		user.update({ crypted }, { $set: info });
		res.set('Access-Control-Expose-Headers', 'logToken');
		res.set('logToken', logToken);
		exists = _.omit(exists, ['password']);
		return (res.send(exists));
	});
	return (false);
};

const profile = (sockets) => (req, res) => {
	mongoConnect(res, async (db) => {
		let online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		const onlineusers = [];
		sockets.forEach((socket) => onlineusers.push(socket.username));
		online.onlineusers = onlineusers;
		online = _.omit(online, ['password', 'crypted']);
		return (res.send(online));
	});
};

const publicprofile = (sockets) => (req, res) => {
	mongoConnect(res, async (db) => {
		const online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		const username = req.params.user;
		let exists = await db.collection('users').findOne({ username });
		if (!exists) return (res.send({ error: 'invalid request', details: 'unknown user' }));
		if (online.username !== req.params.user) {
			db.collection('users').update({ username: req.body.visited }, { $addToSet: { visitors: online.username }, $inc: { popscore: 1 } });
			db.collection('users').update({ username: online.username }, { $addToSet: { visited: req.body.visited } });
			const message = {
				from: online.username,
				to: req.body.visited,
				content: 'has just visited your profile',
				key: auth.generate(),
			};
			const user = _.find(sockets, (el) => el.username === req.body.visited);
			if (user) user.socket.emit('notifications', message);
			db.collection('users').update({ username: req.body.visited }, { $addToSet: { notifications: message } });
		}
		// delete exists.password;
		// delete exists.crypted;
		// delete exists.email;
		exists.visitor = online.username !== exists.username;
		exists.liked = online.likes.indexOf(exists.username) !== -1;
		exists.blocked = online.blocks.indexOf(exists.username) !== -1;
		exists.querier = online.username;
		exists = _.omit(exists, ['password', 'crypted', 'email']);
		return (res.send(exists));
	});
};

const like = (sockets) => (req, res) => {
	mongoConnect(res, async (db) => {
		const online = await auth.verify(req, db);
		if (online.pictures.length < 1) return (res.send({ error: 'invalid request', details: 'need to have an active pic to like users' }));
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		let exists = await db.collection('users').findOne({ username: online.username });
		if (!exists) return (res.send({ error: 'invalid request', details: 'unknown user' }));
		db.collection('users').update({ username: online.username }, { $addToSet: { likes: req.body.liked } });
		db.collection('users').update({ username: req.body.liked }, { $addToSet: { liked: online.username }, $inc: { popscore: 10 } });
		const likeback = await db.collection('users').findOne({ username: req.body.liked });
		const message = {
			from: online.username,
			to: req.body.liked,
			content: likeback.likes.indexOf(online.username) !== -1 ? `has liked your profile back! You can now chat with ${online.username}` : 'has liked your profile',
			key: auth.generate(),
		};
		const user = _.find(sockets, (el) => el.username === req.body.liked);
		if (user) user.socket.emit('notifications', message);
		db.collection('users').update({ username: req.body.liked }, { $addToSet: { notifications: message } });
		exists = _.omit(exists, ['password', 'crypted', 'email']);
		return (res.send(exists));
	});
};

const unlike = (sockets) => (req, res) => {
	mongoConnect(res, async (db) => {
		const online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		let exists = await db.collection('users').findOne({ username: online.username });
		if (!exists) return (res.send({ error: 'invalid request', details: 'unknown user' }));
		db.collection('users').update({ username: online.username }, { $pull: { likes: req.body.liked } });
		db.collection('users').update({ username: req.body.liked }, { $pull: { liked: online.username }, $inc: { popscore: -10 } });
		const likeback = await db.collection('users').findOne({ username: req.body.liked });
		const message = {
			from: online.username,
			to: req.body.liked,
			content: likeback.likes.indexOf(online.username) !== -1 ? 'has unliked your profile and is no longer connected with you' : 'has unliked your profile',
			key: auth.generate(),
		};
		const user = _.find(sockets, (el) => el.username === req.body.liked);
		if (user) user.socket.emit('notifications', message);
		db.collection('users').update({ username: req.body.liked }, { $addToSet: { notifications: message } });
		exists = _.omit(exists, ['password', 'crypted', 'email']);
		return (res.send(exists));
	});
};

const block = (req, res) => {
	mongoConnect(res, async (db) => {
		const online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		let exists = await db.collection('users').findOne({ username: online.username });
		if (!exists) return (res.send({ error: 'invalid request', details: 'unknown user' }));
		db.collection('users').update({ username: online.username }, { $addToSet: { blocks: req.body.blocked } });
		db.collection('users').update({ username: req.body.blocked }, { $inc: { popscore: -50 } });
		exists = _.omit(exists, ['password', 'crypted', 'email']);
		return (res.send(exists));
	});
};

const unblock = (req, res) => {
	mongoConnect(res, async (db) => {
		const online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		let exists = await db.collection('users').findOne({ username: online.username });
		if (!exists) return (res.send({ error: 'invalid request', details: 'unknown user' }));
		db.collection('users').update({ username: online.username }, { $pull: { blocks: req.body.blocked } });
		db.collection('users').update({ username: req.body.blocked }, { $inc: { popscore: 50 } });
		exists = _.omit(exists, ['password', 'crypted', 'email']);
		return (res.send(exists));
	});
};

const report = (req, res) => {
	mongoConnect(res, async (db) => {
		const online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		let exists = await db.collection('users').findOne({ username: online.username });
		if (!exists) return (res.send({ error: 'invalid request', details: 'unknown user' }));
		const transporter = nodemailer.createTransport('smtps://apimatcha@gmail.com:apiMatcha1212@smtp.gmail.com');
		const mailOptions = {
				from: '"MATCHA" <support@matcha.com>',
				to: 'montajarraya@gmail.com',
				subject: 'Reported user',
				html: `User <a href="http://localhost:3000/profile/${req.body.reported}">${req.body.reported}</a> has been reported as fake by <a href="http://localhost:3000/profile/${online.username}">${online.username}</a>`,
		};
		transporter.sendMail(mailOptions, (mailerr) => {
			if (mailerr) exists = { error: 'invalid request', details: mailerr };
		});
		exists = _.omit(exists, ['password', 'crypted', 'email']);
		return (res.send(exists));
	});
};

const suggGeoFilter = async (users, querier) => {
	const result = await users.filter((user) => {
		const distance = geolib.getDistance({
			latitude: querier.lat,
			longitude: querier.lng,
		}, {
			latitude: user.location.lat,
			longitude: user.location.lng,
		});
		const km = distance / 1000;
		return (km <= 50);
	});
	return result;
};

const suggTagFilter = async (users, querier) => {
	const result = await users.filter((user) => {
		const common = user.interests.filter((tag) => querier.indexOf(tag) !== -1);
		return (common.length > 0); // 1 tag en commun mini
	});
	return result;
};

const suggPopFilter = async (users) => {
	const result = await users.filter((user) => {
		const { popscore } = user;
		return (popscore > 10);
	});
	return result;
};

const suggSexFilter = (querier) => {
	if (querier.gender === 'male') {
		if (querier.orientation === 'male') return (['male male', 'male any']);
		if (querier.orientation === 'female') return (['female male', 'female any']);
		return (['female male', 'female any', 'male any', 'male male']);
	}
	if (querier.orientation === 'male') return (['male female', 'male any']);
	if (querier.orientation === 'female') return (['female female', 'female any']);
	return (['male female', 'male any', 'female female', 'female any']);
};

const list = (req, res) => {
	mongoConnect(res, async (db) => {
		const online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		const sexFilter = suggSexFilter(online);
		const querierLocation = online.location;
		const querierTags = online.interests;
		let users = await db.collection('users').find({ sexualid: { $in: sexFilter }, username: { $ne: online.username, $nin: [...online.blocks, ...online.likes] } }).toArray();
		let tmp = await suggTagFilter(users, querierTags);
		users = tmp.length > 0 ? tmp : users;
		tmp = await suggPopFilter(users);
		users = tmp.length > 0 ? tmp : users;
		tmp = await suggGeoFilter(users, querierLocation);
		users = tmp.length > 0 ? tmp : users;
		users.forEach((user) => {
			const distance = geolib.getDistance({
				latitude: querierLocation.lat,
				longitude: querierLocation.lng,
			}, {
				latitude: user.location.lat,
				longitude: user.location.lng,
			});
			const common = user.interests.filter((tag) => online.interests.indexOf(tag) !== -1);
			user.common = common.length; // eslint-disable-line no-param-reassign
			user.distance = distance / 1000; // eslint-disable-line no-param-reassign
			user.compatibility = (user.popscore - (distance / 1000)) * common.length; // eslint-disable-line no-param-reassign
			// delete user.password;// eslint-disable-line no-param-reassign
			// delete user.logToken;// eslint-disable-line no-param-reassign
			// delete user.crypted;// eslint-disable-line no-param-reassign
			// delete user.email;// eslint-disable-line no-param-reassign
			user = _.omit(user, ['password', 'crypted', 'email', 'logToken']); // eslint-disable-line no-param-reassign
		});
		users.sort((a, b) => (b.compatibility - a.compatibility)).splice(20);
		return (res.send(users));
	});
};

const unnotify = (req, res) => {
	mongoConnect(res, async (db) => {
		let online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		const notifications = online.notifications.filter((notif) => notif.key !== req.body.key);
		db.collection('users').update({ username: online.username }, { $set: { notifications } });
		online = _.omit(online, ['password', 'crypted', 'email']);
		return (res.send(online));
	});
};

const chat = (sockets) => (req, res) => {
	mongoConnect(res, async (db) => {
		const err = validate.message(req);
		if (err.error) return (res.send({ error: 'invalid request', details: err.error }));
		const online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		if (req.body.message) {
			const message = {
				from: online.username,
				to: req.body.recipient,
				content: 'has just sent you a message!',
				key: auth.generate(),
			};
			const user = _.find(sockets, (el) => el.username === req.body.recipient);
			if (user) user.socket.emit('notifications', message);
			// if (!user)
			db.collection('users').update({ username: req.body.recipient }, { $addToSet: { notifications: message } });
			const chatmessage = {
				message: req.body.message,
				recipient: req.body.recipient,
				sender: req.body.sender,
				date: req.body.date,
			};
			if (user) user.socket.emit('message', chatmessage);
			db.collection('chat').insert(chatmessage);
		}
		if (req.body.clearnotif) {
			const recipient = await db.collection('users').findOne({ username: req.body.recipient });
			const notifications = recipient.notifications.filter((notif) => notif.from !== online.username || notif.content !== 'has just sent you a message!');
			db.collection('users').update({ username: req.body.recipient }, { $set: { notifications } });
		}
		const history = await db.collection('chat').find({ $and: [{ recipient: { $in: [req.body.recipient, req.body.sender] } }, { sender: { $in: [req.body.recipient, req.body.sender] } }] }).toArray();
		return (res.send(history));
	});
};

const search = (req, res) => {
	mongoConnect(res, async (db) => {
		const err = validate.search(req);
		if (err.error) return (res.send({ error: 'invalid request', details: err.error }));
		const online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		const sexFilter = suggSexFilter(online);
		const users = await db.collection('users').find({ sexualid: { $in: sexFilter }, username: { $ne: online.username, $nin: online.blocks } }).toArray();
		const newUsers = [];
		users.forEach((user) => {
			const distance = geolib.getDistance({
				latitude: online.location.lat,
				longitude: online.location.lng,
			}, {
				latitude: user.location.lat,
				longitude: user.location.lng,
			});
			if (req.body.tags && req.body.tags.length > 0) {
				const length = req.body.tags.length;
				const common = user.interests.filter((tag) => req.body.tags.indexOf(tag) !== -1);
				if (length === common.length) newUsers.push(user);
				user.common = common.length; // eslint-disable-line no-param-reassign
				user.compatibility = (user.popscore - (distance / 1000)) * common.length; // eslint-disable-line no-param-reassign
			} else {
				newUsers.push(user);
				const common = user.interests.filter((tag) => online.interests.indexOf(tag) !== -1);
				user.common = common.length; // eslint-disable-line no-param-reassign
				user.compatibility = (user.popscore - (distance / 1000)) * common.length; // eslint-disable-line no-param-reassign
			}
			user.distance = distance / 1000; // eslint-disable-line no-param-reassign
			// delete user.password;// eslint-disable-line no-param-reassign
			// delete user.logToken;// eslint-disable-line no-param-reassign
			// delete user.crypted;// eslint-disable-line no-param-reassign
			// delete user.email;// eslint-disable-line no-param-reassign
			user = _.omit(user, ['password', 'crypted', 'email', 'logToken']); // eslint-disable-line no-param-reassign
		});
		// users.sort((a, b) => (b.compatibility - a.compatibility));
		newUsers.sort((a, b) => (b.compatibility - a.compatibility));
		return (res.send(newUsers));
	});
};

export { add, modify, drop, signin, signout, check, forgot, reset, profile, publicprofile, list, like, unlike, block, unblock, report, suggSexFilter, suggGeoFilter, suggTagFilter, suggPopFilter, search, unnotify, chat };
