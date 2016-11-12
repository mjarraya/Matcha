const calcage = (birthdate) => {
	const birthday = new Date(birthdate);
	const today = new Date();
	let age = today.getFullYear() - birthday.getFullYear();
	birthday.setFullYear(today.getFullYear());
	if (today < birthday) age--;
	return age;
};

export default calcage;
