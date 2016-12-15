import React from 'react';
import { browserHistory, Link } from 'react-router';
import axios from 'axios';
import InputRange from 'react-input-range';
import './InputRange.css';
import './App.css';

class ListRender extends React.Component {
	state = {
		status: null,
		users: [],
		userscopy: [],
		agesort: null,
		distsort: null,
		popsort: null,
		tagsort: null,
		unsorted: [],
		agevalues: {
		  min: 18,
		  max: 100,
		},
		locationvalues: {
		  min: 0,
		  max: 100,
		},
		popvalues: {
		  min: 0,
		  max: 250,
		},
		commontagvalues: {
		  min: 0,
		  max: 20,
		},
	};

	getData = () => {
		if (!localStorage.getItem('logToken')) return (browserHistory.push('/login'));
		axios({
			method: 'get',
			url: 'http://46.101.246.154:8080/list',
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (this.unmounted) return ;
			if (data.error) return (browserHistory.push('/login'));
			this.setState({ users: data, unsorted: data, userscopy: data, status: 'success' });
		});
	};

	componentWillMount() {
		this.getData();
	};

	componentWillUnmount () {
		this.unmounted = true;
	};

	sortAge = () => {
		if (!this.state.agesort) {
			const users = this.state.users;
			const unsorted = users.slice(0);
			users.sort((a, b) => (a.age-b.age));
			this.setState({agesort: 'sorted', sortedAge: 'glyphicon glyphicon-triangle-top', unsorted});
		} else if (this.state.agesort === 'sorted'){
			const users = this.state.users;
			users.sort((a, b) => (b.age-a.age));
			this.setState({agesort: 'reversed', sortedAge: 'glyphicon glyphicon-triangle-bottom'});
		} else {
			const users = this.state.unsorted;
			this.setState({agesort: null, users, sortedAge: ''});
		}
		this.setState({distsort: null, popsort: null, tagsort: null, sortedTags: '', sortedDist: '', sortedPop: ''});
	};

	sortDistance = () => {
		if (!this.state.distsort) {
			const users = this.state.users;
			const unsorted = users.slice(0);
			users.sort((a, b) => (a.distance-b.distance));
			this.setState({distsort: 'sorted', sortedDist: 'glyphicon glyphicon-triangle-top', unsorted});
		} else if (this.state.distsort === 'sorted') {
			const users = this.state.users;
			users.sort((a, b) => (b.distance-a.distance));
			this.setState({distsort: 'reversed', sortedDist: 'glyphicon glyphicon-triangle-bottom'});
		} else {
			const users = this.state.unsorted;
			this.setState({distsort: null, users, sortedDist: ''});
		}
		this.setState({agesort: null, popsort: null, tagsort: null, sortedAge: '', sortedTags: '', sortedPop: ''});
	};

	sortPop = () => {
		if (!this.state.popsort) {
			const users = this.state.users;
			const unsorted = users.slice(0);
			users.sort((a, b) => (a.popscore-b.popscore));
			this.setState({popsort: 'sorted', sortedPop: 'glyphicon glyphicon-triangle-top', unsorted});
		} else if (this.state.popsort === 'sorted') {
			const users = this.state.users;
			users.sort((a, b) => (b.popscore-a.popscore));
			this.setState({popsort: 'reversed', sortedPop: 'glyphicon glyphicon-triangle-bottom'});
		} else {
			const users = this.state.unsorted;
			this.setState({popsort: null, users, sortedPop: ''});
		}
		this.setState({agesort: null, distsort: null, tagsort: null, sortedAge: '', sortedDist: '', sortedTags: ''});
	};

	sortTags = () => {
		if (!this.state.tagsort) {
			const users = this.state.users;
			const unsorted = users.slice(0);
			users.sort((a, b) => (a.common-b.common));
			this.setState({tagsort: 'sorted', sortedTags: 'glyphicon glyphicon-triangle-top', unsorted});
		} else if (this.state.tagsort === 'sorted') {
			const users = this.state.users;
			users.sort((a, b) => (b.common-a.common));
			this.setState({tagsort: 'reversed', sortedTags: 'glyphicon glyphicon-triangle-bottom'});
		} else {
			const users = this.state.unsorted;
			this.setState({tagsort: null, users, sortedTags: ''});
		}
		this.setState({agesort: null, distsort: null, popsort: null, sortedAge: '', sortedDist: '', sortedPop: ''});
	};

	handleAgeChange(component, agevalues) {
		const users = this.state.users;
		const locationvalues = this.state.locationvalues;
		const popvalues = this.state.popvalues;
		const commontagvalues = this.state.commontagvalues;
		let userscopy = users.slice(0);
		userscopy = this.state.userscopy.filter((user) => {
			return (user.age >= agevalues.min && user.age <= agevalues.max
				&& user.distance >= locationvalues.min && (user.distance <= locationvalues.max || locationvalues.max === 100)
				&& user.popscore >= popvalues.min && (user.popscore <= popvalues.max || popvalues.max === 250)
				&& user.common >= commontagvalues.min && (user.common <= commontagvalues.max || commontagvalues.max === 20)
			);
		});
		this.setState({agevalues, users: userscopy, locationvalues, popvalues, commontagvalues});
	};
	handleLocationChange(component, locationvalues) {
		const users = this.state.users;
		const agevalues = this.state.agevalues;
		const popvalues = this.state.popvalues;
		const commontagvalues = this.state.commontagvalues;
		let userscopy = users.slice(0);
		userscopy = this.state.userscopy.filter((user) => {
			return (user.distance >= locationvalues.min && (user.distance <= locationvalues.max || locationvalues.max === 100)
				&& user.age >= agevalues.min && user.age <= agevalues.max
				&& user.popscore >= popvalues.min && (user.popscore <= popvalues.max || popvalues.max === 250)
				&& user.common >= commontagvalues.min && (user.common <= commontagvalues.max || commontagvalues.max === 20)
			);
		});
		this.setState({locationvalues, users: userscopy, agevalues, popvalues, commontagvalues});
	};
	handlePopChange(component, popvalues) {
		const users = this.state.users;
		const agevalues = this.state.agevalues;
		const locationvalues = this.state.locationvalues;
		const commontagvalues = this.state.commontagvalues;
		let userscopy = users.slice(0);
		userscopy = this.state.userscopy.filter((user) => {
			return (user.popscore >= popvalues.min && (user.popscore <= popvalues.max || popvalues.max === 250)
			&& user.age >= agevalues.min && user.age <= agevalues.max
			&& user.distance >= locationvalues.min && (user.distance <= locationvalues.max || locationvalues.max === 100)
			&& user.common >= commontagvalues.min && (user.common <= commontagvalues.max || commontagvalues.max === 20)
			);
		});
		this.setState({popvalues, users: userscopy, agevalues, locationvalues, commontagvalues});
	};
	handleCommonTagChange(component, commontagvalues) {
		const users = this.state.users;
		const agevalues = this.state.agevalues;
		const locationvalues = this.state.locationvalues;
		const popvalues = this.state.popvalues;
		let userscopy = users.slice(0);
		userscopy = this.state.userscopy.filter((user) => {
			return (user.common >= commontagvalues.min && (user.common <= commontagvalues.max || commontagvalues.max === 20)
			&& user.age >= agevalues.min && user.age <= agevalues.max
			&& user.distance >= locationvalues.min && (user.distance <= locationvalues.max || locationvalues.max === 100)
			&& user.popscore >= popvalues.min && (user.popscore <= popvalues.max || popvalues.max === 250)
			);
		});
		this.setState({commontagvalues, users: userscopy, agevalues, locationvalues, popvalues});
	};

	render() {
		return (
			<div>
				<div className="wrapper">
				{/* <div className="server-response">{this.state.status}</div> */}
				{(!this.state.userscopy.length && this.state.status) ? (<div><p>We wouldnt want to suggest you someone we are not 100% sure you could match with...</p>
				<p>How about you <Link to="/profile">fill out more info</Link> or <Link to="/search">try our advanced search</Link> ?</p></div>
			) : (
				<div>
				<div className="sortbar">
					<button onClick={this.sortAge}><span className={this.state.sortedAge}></span>sort by age</button>
					<button onClick={this.sortDistance}><span className={this.state.sortedDist}></span>sort by distance</button>
					<button onClick={this.sortPop}><span className={this.state.sortedPop}></span>sort by popularity</button>
					<button onClick={this.sortTags}><span className={this.state.sortedTags}></span>sort by common tags</button>
				</div>

				<div className="filters">
				age
				<InputRange
				    maxValue={100}
				    minValue={18}
				    value={this.state.agevalues}
				    onChange={this.handleAgeChange.bind(this)}
				  />
				  location
				  <InputRange
					    maxValue={100}
					    minValue={0}
					    value={this.state.locationvalues}
					    onChange={this.handleLocationChange.bind(this)}
				  />
				  popularity
				  <InputRange
					    maxValue={250}
					    minValue={0}
					    value={this.state.popvalues}
					    onChange={this.handlePopChange.bind(this)}
				  />
				  common tags
				  <InputRange
					    maxValue={20}
					    minValue={0}
					    value={this.state.commontagvalues}
					    onChange={this.handleCommonTagChange.bind(this)}
				  />
				</div>
				</div>
			)}
				<div className="thumbnails">
				{this.state.users.length > 0 && this.state.users.map((user, i) =>
					<Link to={`/profile/${user.username}`} key={i}>
					<div className="thumbnail">
					<img role="presentation" id={i} src={`http://46.101.246.154:8080${user.pictures.length ? user.pictures[0] : '/media/stormtrooper.jpg'}`}/>
					{/* <li style={{color: 'green', fontSize:"20px", display: "inline-block", width: "220px", height: "220px", backgroundImage: `url(http://46.101.246.154:8080${user.pictures.length ? user.pictures[0] : '/media/stormtrooper.jpg'})`}} key={i}>
					{user.username}
					</li> */}
					<div className="userdetail">
					<div><i className="fa fa-user userdetail-art" aria-hidden="true"></i> {user.username}</div>
					<div><i className="fa fa-fire userdetail-art" aria-hidden="true"></i> {user.popscore}</div>
					<div><i className="fa fa-map-signs userdetail-art" aria-hidden="true"></i> {user.distance >= 1 ? `${Math.floor(user.distance)} km` : `${user.distance * 1000} m`}</div>
					<div><i className="fa fa-tags userdetail-art" aria-hidden="true"></i> {user.common}</div>
					</div>
					</div>
					</Link>
				)}
				</div>

				</div>
			</div>
		)
	};
};

const List = () => {
	return (
		<div className="profile">
			<ListRender />
		</div>
	);
}

export default List;
