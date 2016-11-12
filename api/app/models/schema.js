const username = (string) => {
	if (string === undefined || string === '') return ('username cannot be empty');
	const patt = /^[a-z0-9_-]{3,16}$/;
	if (patt.test(string) === false) return ('username is not properly formatted');
	return (undefined);
};

const password = (string) => {
	if (string === undefined || string === '') return ('password cannot be empty');
	const patt = /^(?=.*\d)(?=.*[a-zA-Z]).{8,16}$/;
	if (patt.test(string) === false) return ('password is not properly formatted');
	return (undefined);
};

const email = (string) => {
	if (string === undefined || string === '') return ('email cannot be empty');
	const patt = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
	if (patt.test(string) === false) return ('email is not properly formatted');
	return (undefined);
};

const firstname = (string) => {
	if (string === undefined || string === '') return ('firstname cannot be empty');
	const patt = /^[a-zA-Z|À-ÿ|-]{1,16}$/;
	if (patt.test(string) === false) return ('firstname is not properly formatted');
	return (undefined);
};

const lastname = (string) => {
	if (string === undefined || string === '') return ('lastname cannot be empty');
	const patt = /^[a-zA-Z|À-ÿ|-]{1,16}$/;
	if (patt.test(string) === false) return ('lastname is not properly formatted');
	return (undefined);
};

const birthdate = (date) => {
	if (date === undefined || date === '') return ('birthdate cannot be empty');
	const birthday = new Date(date);
	const today = new Date();
	let age = today.getFullYear() - birthday.getFullYear();
	birthday.setFullYear(today.getFullYear());
	if (today < birthday) {
		age--;
	}
	if (age < 18 || age > 100) return ('age must be > 18 & < 100');
	return (undefined);
};

const gender = (string) => {
	if (string !== 'male' && string !== 'female') return ('gender must be defined (male or female)');
	return (undefined);
};

const orientation = (string) => {
	if (string !== 'male' && string !== 'female' && string !== 'any') return ('orientation must be defined');
	return (undefined);
};

const bio = (string) => {
	if (string === undefined || string === '') return ('bio must be filled');
	if (string.length < 60) return ('bio must contain 60+ characters');
	return (undefined);
};

const interests = (arr) => {
	if (arr === undefined || !(arr instanceof Array)) return ('interests must be filled');
	if (arr.length < 1) return ('must fill in at least 1 tag');
	const string = arr.slice(-1)[0];
	const patt = /^[a-z0-9_-]{2,16}$/;
	if (patt.test(string) === false) return ('interest is not properly formatted');
	if (arr.filter((elem) => elem === string).length > 1) return ('interest already saved');
	return (undefined);
};

const tags = (arr) => {
	const string = arr.slice(-1)[0];
	const patt = /^[a-z0-9_-]{2,16}$/;
	if (patt.test(string) === false) return ('tag is not properly formatted');
	if (arr.filter((elem) => elem === string).length > 1) return ('tag already entered');
	return (undefined);
};

const location = (obj) => {
	if (obj === undefined || !(obj instanceof Object)) return ('location must be provided');
	if (Object.keys(obj).length !== 3) return ('wrong location info');
	return (undefined);
};
export { username, password, email, firstname, lastname, birthdate, gender, orientation, bio, interests, tags, location };
