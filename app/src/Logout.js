import React from 'react';
import { browserHistory } from 'react-router';
import axios from 'axios';
import './App.css';
import keys from './keys/keys.json';

class LogoutForm extends React.Component {
	state = {
		status: null,
	};

	logout = async () => {
		const response = await axios({
			method: 'post',
			key: keys.key,
			cert: keys.cert,
			ca: keys.ca,
			url: 'https://montasar.me:4433/logout',
			headers: { logToken: localStorage.getItem('logToken') },
		});
		localStorage.setItem('logToken', response.headers.logtoken);
		delete localStorage['logToken'];
		browserHistory.push('/login');
	};

	render() {
		this.logout();
		return (
			<div className="wrapper">
			</div>
		);
	};
};

LogoutForm.contextTypes = {
  socket: React.PropTypes.object
};

const Logout = () => {
	return (
		<div className="logout">
			<LogoutForm />
		</div>
	);
};

export default Logout;
