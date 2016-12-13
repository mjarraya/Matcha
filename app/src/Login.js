import React from 'react';
import { browserHistory, Link } from 'react-router';
import axios from 'axios';
import './App.css';

class LoginForm extends React.Component {
	state = {
		status: null,
	};

	componentWillMount() {
		if (localStorage.getItem('logToken')) {
			axios({
				url: 'http://montasar.me:8080/check',
				method: 'post',
				headers: { logToken: localStorage.getItem('logToken') },
			}).then((response) => {
				if (!response.data.error) browserHistory.push('/');
			});
		}
	};

	login = async (e) => {
		e.preventDefault();
		const response = await axios({
			method: 'post',
			url: 'http://montasar.me:8080/login',
			data: {
				username: e.target.username.value,
				password: e.target.password.value,
			},
		});
		if (response.headers.logtoken !== undefined) {
			localStorage.setItem('logToken', response.headers.logtoken);
			browserHistory.push('/');
		} else {
				this.setState({ status: response.data.details });
		};
	};

	clearstatus = (e) => {
		this.setState({status: null});
	};

	render() {
		return (
			<div>
			{this.state.status && <div onClick={this.clearstatus} className="alert alert-danger">{this.state.status}</div>}
						<div className="wrapper">
						<form onSubmit={this.login} className="form-signin">
					        <h2 className="form-signin-heading">Login</h2>
					        <input type="text" className="form-control" name="username" placeholder="Username" required=""/>
					        <input type="password" className="form-control" name="password" placeholder="Password" required=""/>
							<p><Link to="/register">Not registered yet?</Link> <Link to="/forgot">Forgot your password?</Link></p>
					        <input className="btn btn-lg btn-primary btn-block" type="submit" value="submit"/>
					      </form>
		    			</div>
			</div>
		);
	};
};

const Login = () => {
	return (
		<div className="login">
			<LoginForm />
		</div>
	);
};

export default Login;
