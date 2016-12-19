import React from 'react';
import { browserHistory, Link } from 'react-router';
import axios from 'axios';
import './App.css';

class ForgotForm extends React.Component {
	state = {
		status: null,
		success: null,
	};

	componentWillMount() {
		if (localStorage.getItem('logToken')) {
			axios({
				url: 'https://46.101.169.42:4433/check',
				method: 'post',
				headers: { logToken: localStorage.getItem('logToken') },
			}).then((response) => {
				if (!response.data.error) browserHistory.push('/');
			});
		}
	};

	forgot = async (e) => {
		e.preventDefault();
		this.setState({ success: null });
		const response = await axios({
			method: 'post',
			url: 'https://46.101.169.42:4433/forgot',
			data: {
				username: e.target.username.value,
			},
		});
		if (response.headers.logtoken !== undefined) {
			localStorage.setItem('logToken', response.headers.logtoken);
			browserHistory.push('/');
		} else {
			this.setState({ status: response.data.details });
			if (response.data.username) {
				let email = response.data.email;
				email = email.substring(email.lastIndexOf("@") +1);
				this.setState({ success: `Check your email @${email}` });
				setTimeout(() => browserHistory.push('/login'), 3500);
			}
		};
	};

	clearstatus = (e) => {
		this.setState({status: null});
	};

	render() {
		return (
			<div>
			{(this.state.status) && <div onClick={this.clearstatus} className="alert alert-danger">
			<div className="neg-server-response">{this.state.status}</div>
			</div>}
			{this.state.success && <div className="alert alert-success">
			<div className="pos-server-response">{this.state.success}</div>
			</div>}

						<div className="wrapper">
					      <form onSubmit={this.forgot} className="form-signin">
					        <h2 className="form-signin-heading">Forgot</h2>
					        <input type="text" className="form-control" name="username" placeholder="Username" required=""/>
							<p><Link to="/register">Not registered yet?</Link></p>
					        <input className="btn btn-lg btn-primary btn-block" type="submit" value="submit"/>
					      </form>
		    			</div>

				</div>
					);
				};
}
const Forgot = () => {
	return (
		<div className="forgot">
			<ForgotForm />
		</div>
	);
};

export default Forgot;
