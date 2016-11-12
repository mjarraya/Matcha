import React from 'react';
import { browserHistory } from 'react-router';
import axios from 'axios';
// import Home from './Home';
import './App.css';

class ResetForm extends React.Component {
	state = {
		status: null,
		loggedIn: false,
		loaded: false
	};

	componentWillMount() {
		if (localStorage.getItem('logToken')) {
			axios({
				url: 'http://localhost:8080/check',
				method: 'post',
				headers: { logToken: localStorage.getItem('logToken') },
			}).then((response) => {
				if (!response.data.error){
					this.setState({ loggedIn: true, loaded: true });
					browserHistory.push('/reset?logged=true');
				} else {
					this.setState({ loggedIn: false, loaded: true });
					if (this.props.location.query.logged) browserHistory.push('/');
				}
			});
		}
		else {
			this.setState({ loggedIn: false, loaded: true });
			if (this.props.location.query.logged) browserHistory.push('/login');
		}

	};

	reset = async (e) => {
		e.preventDefault();
		if (this.props.location.query.logged) {
			const response = await axios({
				method: 'put',
				url: 'http://localhost:8080/edit',
				data: {
					password: e.target.password.value,
				},
				headers: { logToken: localStorage.getItem('logToken') },
			});
			if (response.data.error) return this.setState({ status: response.data.details });
			this.setState({ success: 'You just changed your password, you may now log with it next time' });
			setTimeout(() => browserHistory.push('/'), 3500);
		} else {
			const response = await axios({
				method: 'post',
				url: 'http://localhost:8080/reset',
				data: {
					password: e.target.password.value,
					crypted: this.props.location.query.key,
				},
			});
			if (response.headers.logtoken !== undefined) {
				this.setState({ success: 'Your password has been successfully changed!' });
				setTimeout(() => {
					localStorage.setItem('logToken', response.headers.logtoken);
					browserHistory.push('/');
				}, 3500);
			} else {
					this.setState({ status: response.data.details });
			};
		}
	};

	clearstatus = (e) => {
		this.setState({status: null});
	};

	render() {
		if (!this.state.loaded) return (<div>LOADING</div>);
		return (
			<div>
			{(this.state.status) && <div onClick={this.clearstatus} className="alert alert-danger">
			<div className="neg-server-response">{this.state.status}</div>
			</div>}
			{this.state.success && <div className="alert alert-success">
			<div className="pos-server-response">{this.state.success}</div>
			</div>}
						<div className="wrapper">
					      <form onSubmit={this.reset} className="form-signin">
					        <h2 className="form-signin-heading">Reset</h2>
					        <input type="password" className="form-control" name="password" placeholder="Password" required=""/>
					        <input className="btn btn-lg btn-primary btn-block" type="submit" value="submit"/>
					      </form>
		    			</div>
			</div>
		);
	};
};

const Reset = ({ location }) => {
	return (
		<div className="reset">
			<ResetForm location={ location }/>
		</div>
	);
};

export default Reset;
