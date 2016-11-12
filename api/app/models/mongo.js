import mongodb from 'mongodb';

const mongoConnect = (response, success) => {
	const mdb = mongodb.MongoClient;
	const url = 'mongodb://198.211.123.106/matcha';
	mdb.connect(url, (err, db) => {
		if (err) {
			response.send({
				status: false,
				details: 'mongodb connection error',
				err,
			});
		} else {
			success(db);
		}
	});
};

export default mongoConnect;
