import multer from 'multer';
import mongoConnect from './mongo';
import * as auth from './auth';
import * as validate from './validate';

const upload = multer({ dest: 'media/' }).single('photo');

const imgupload = (req, res) => {
	upload(req, res, (err) => {
		let error = err;
		if (error) return (res.send({ error: 'invalid request', details: error }));
		error = validate.upload(req);
		if (error.error) return (res.send({ error: 'invalid request', details: error.error }));
		mongoConnect(res, async (db) => {
			const online = await auth.verify(req, db);
			const user = db.collection('users');
			// const ext = req.file.originalname.split('.').pop().toLowerCase();
			const path = `/${req.file.path}`;
			if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
			const username = online.username;
			if (online.pictures.length > 4) return (res.send({ error: 'invalid request', details: '5 images max' }));
			user.update({ username }, { $push: { pictures: path } });
			return (res.send(online));
		});
		return (false);
	});
};

const imgremove = (req, res) => {
	const error = validate.remove(req);
	if (error.error) return (res.send({ error: 'invalid request', details: error.error }));
	mongoConnect(res, async (db) => {
		const user = db.collection('users');
		const online = await auth.verify(req, db);
		if (!online) return (res.send({ error: 'invalid request', details: 'unauthorized' }));
		const id = Number(req.body.imgid);
		if (online.pictures.length === 0) return (res.send({ error: 'invalid request', details: 'no image to remove' }));
		if (id > online.pictures.length) return (res.send({ error: 'invalid request', details: 'unexpected image id' }));
		const username = online.username;
		const imgArray = [];
		online.pictures.forEach((picture) => {
			if (online.pictures.indexOf(picture) !== id) imgArray.push(picture);
		});
		user.update({ username }, { $set: { pictures: imgArray } });
		return (res.send(online));
	});
	return (false);
};

export { imgupload, imgremove };
