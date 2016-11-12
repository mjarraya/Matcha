import _ from 'lodash';
import * as pattern from './schema';

const login = (req) => {
	if (pattern.username(req.body.username) !== undefined) return ({ error: pattern.username(req.body.username) });
	if (pattern.password(req.body.password) !== undefined) return ({ error: pattern.password(req.body.password) });
	return ({ error: undefined });
};

const register = (req) => {
	if (login(req).error !== undefined) return ({ error: login(req).error });
	if (pattern.email(req.body.email) !== undefined) return ({ error: pattern.email(req.body.email) });
	if (pattern.firstname(req.body.firstname) !== undefined) return ({ error: pattern.firstname(req.body.firstname) });
	if (pattern.lastname(req.body.lastname) !== undefined) return ({ error: pattern.lastname(req.body.lastname) });
	if (pattern.gender(req.body.gender)) return ({ error: pattern.gender(req.body.gender) });
	if (pattern.gender(req.body.birthdate)) return ({ error: pattern.birthdate(req.body.birthdate) });
	return ({ error: undefined });
};

const edit = (req) => {
	if (_.has(req.body, 'email') && pattern.email(req.body.email)) return ({ error: pattern.email(req.body.email) });
	if (_.has(req.body, 'password') && pattern.password(req.body.password)) return ({ error: pattern.password(req.body.password) });
	if (_.has(req.body, 'firstname') && pattern.firstname(req.body.firstname)) return ({ error: pattern.firstname(req.body.firstname) });
	if (_.has(req.body, 'lastname') && pattern.lastname(req.body.lastname)) return ({ error: pattern.lastname(req.body.lastname) });
	if (_.has(req.body, 'gender') && pattern.gender(req.body.gender)) return ({ error: pattern.gender(req.body.gender) });
	if (_.has(req.body, 'orientation') && pattern.orientation(req.body.orientation)) return ({ error: pattern.orientation(req.body.orientation) });
	if (_.has(req.body, 'bio') && pattern.bio(req.body.bio)) return ({ error: pattern.bio(req.body.bio) });
	if (_.has(req.body, 'interests') && pattern.interests(req.body.interests)) return ({ error: pattern.interests(req.body.interests) });
	if (_.has(req.body, 'birthdate') && pattern.birthdate(req.body.birthdate)) return ({ error: pattern.birthdate(req.body.birthdate) });
	if (_.has(req.body, 'location') && pattern.location(req.body.location)) return ({ error: pattern.location(req.body.location) });
	return ({ error: undefined });
};

const upload = (req) => {
	if (!req.file) return ({ error: 'file required' });
	return ({ error: undefined });
};

const remove = (req) => {
	if (!req.body || !req.body.imgid) return ({ error: 'img id required' });
	if (req.body.imgid > 4 || req.body.imgid < 0) return ({ error: 'unexpected img id' });
	return ({ error: undefined });
};

const forgot = (req) => {
	if (pattern.username(req.body.username) !== undefined) return ({ error: pattern.username(req.body.username) });
	return ({ error: undefined });
};

const reset = (req) => {
	if (pattern.password(req.body.password) !== undefined) return ({ error: pattern.password(req.body.password) });
	return ({ error: undefined });
};


const search = (req) => {
	if (req.body.tags && pattern.tags(req.body.tags)) return ({ error: pattern.tags(req.body.tags) });
	return ({ error: undefined });
};

const message = (req) => {
	if (req.body.message && req.body.message === '') return ({ error: 'empty message' });
	return ({ error: undefined });
};

export { login, register, edit, upload, remove, forgot, reset, search, message };
