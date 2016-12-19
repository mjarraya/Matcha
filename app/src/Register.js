import React from 'react';
import { browserHistory } from 'react-router';
import axios from 'axios';
import './App.css';

class RegisterForm extends React.Component {
	state = {
		status: null,
	};

	componentWillMount() {
		if (localStorage.getItem('logToken')) {
			axios({
				url: 'http://46.101.169.42:4433/check',
				method: 'post',
				headers: { logToken: localStorage.getItem('logToken') },
			}).then((response) => {
				if (this.unmounted) return ;
				if (!response.data.error) browserHistory.push('/');
			});
		}
	};

	componentWillUnmount() {
		this.unmounted = true;
	};

	register = async (e) => {
		e.preventDefault();
		const response = await axios({
			method: 'post',
			url: 'http://46.101.169.42:4433/register',
			data: {
				username: e.target.username.value,
				password: e.target.password.value,
				email: e.target.email.value,
				firstname: e.target.firstname.value,
				lastname: e.target.lastname.value,
				gender: e.target.gender.value,
				birthdate: e.target.birthdate.value,
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
			      <form onSubmit={this.register} className="form-signin">
			        <h2 className="form-signin-heading">Register</h2>
			        <input type="text" className="form-control" name="username" placeholder="Username" required=""/>
			        <input type="password" className="form-control" name="password" placeholder="Password" required=""/>
					<input type="text" className="form-control" name="email" placeholder="Email" required=""/>
					<input type="text" className="form-control" name="firstname" placeholder="Firstname" required=""/>
					<input type="text" className="form-control" name="lastname" placeholder="Lastname" required=""/>
					<div>

					<input type="radio" className="form-inline gender" name="gender" id="male" value="male"/>
					<label htmlFor="male">Male</label>

					<input type="radio" className="form-inline gender" name="gender" id="female" value="female"/>
					<label htmlFor="female">Female</label>

					</div>
					<input type="date" className="form-control" name="birthdate"></input>

					<br/>
			        <input className="btn btn-lg btn-primary btn-block" type="submit" value="submit"/>
			      </form>
    			</div>
				}
			</div>
		);
	};
};

const Register = () => {
	return (
		<div className="register">
			<RegisterForm />
		</div>
	);
};

export default Register;
