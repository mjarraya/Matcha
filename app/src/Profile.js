import React from 'react';
import { browserHistory, Link } from 'react-router';
import axios from 'axios';
import Geosuggest from 'react-geosuggest';
import './App.css';

class ProfileRender extends React.Component {
	state = {
		status: null,
		username: undefined,
		popscore: 0,
		firstname: undefined,
		lastname: undefined,
		email: undefined,
		bio: undefined,
		gender: undefined,
		orientation: undefined,
		location: undefined,
		interests: [],
		pictures:[],
		visitors: [],
		liked: [],
		likes: [],
		birthdate: false,
		editModeMail: false,
		editModePw: false,
		editModeFN: false,
		editModeLN: false,
		editModeBio: false,
		editModeInterest: false,
		editModeLoc: false,
		editModeDate: false,
		loaded: false,
	};

	getData = () => {
		if (!localStorage.getItem('logToken')) return (browserHistory.push('/login'));
		axios({
			method: 'get',
			url: 'https://46.101.169.42:4433/profile',
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (this.unmounted) return ;
			if (data.error) return (browserHistory.push('/login'));
			this.setState({ username: data.username,
				firstname: data.firstname,
				lastname: data.lastname,
				email: data.email,
				popscore: data.popscore,
				bio: data.bio,
				interests: data.interests,
				gender: data.gender,
				orientation: data.orientation,
				visitors: data.visitors ? data.visitors.reverse() : data.visitors,
				liked: data.liked ? data.liked.reverse() : data.liked,
				likes: data.likes ? data.likes.reverse() : data.likes,
				fullocation: data.location,
				location: data.location.addr,
				pictures: data.pictures,
				birthdate: data.birthdate,
				loaded: true,
			 });
		});
	}

	componentWillMount() {
		this.getData();
	};

	componentWillUnmount () {
		this.unmounted = true;
	};

	upload = async (file) => {
		const data = new FormData();
		data.append('photo', file);
		const response = await axios({
			method: 'put',
			url: 'https://46.101.169.42:4433/upload',
			data,
			headers: {
				'Content-Type': 'multipart/form-data',
				logToken: localStorage.getItem('logToken'),
			},
		});
		this.getData();
		if (response.data.error) this.setState({ status: response.data.details });
		browserHistory.push('/profile')
	};

	addImage = (e) => {
		e.preventDefault();
		const file = e.target.files[0];
		const img = new Image();
		const _URL = window.URL || window.webkitURL;
		img.onload = () => this.upload(file);
		if (_URL && file) img.src = _URL.createObjectURL(file);
	};

	delImage = async (e) => {
		e.preventDefault();
		const imgid = e.target.id;
		const response = await axios({
			method: 'delete',
			url: 'https://46.101.169.42:4433/remove',
			data: { imgid },
			headers: { logToken: localStorage.getItem('logToken') },
		});
		this.getData();
		if (response.data.error) this.setState({ status: response.data.details });
		browserHistory.push('/profile')
	};

	delInterest = async (e) => {
		e.preventDefault();
		const interests = this.state.interests;
		const newInterests = [];
		interests.forEach((interest) => {
			if (interest !== e.target.innerHTML) newInterests.push(interest);
		});
		const response = await axios ({
			method: 'put',
			url: 'https://46.101.169.42:4433/edit',
			data: { interests: newInterests },
			headers: { logToken: localStorage.getItem('logToken') },
		});
		this.getData();
		this.setState({ status: response.data.details });
		browserHistory.push('/profile');
	};

	editMail = (e) => {
		e.preventDefault();
		this.setState({ editModeMail: true });
	};

	editFN = (e) => {
		e.preventDefault();
		this.setState({ editModeFN: true });
	};

	editLN = (e) => {
		e.preventDefault();
		this.setState({ editModeLN: true });
	};

	editBio = (e) => {
		e.preventDefault();
		this.setState({ editModeBio: true });
	};

	editInterest = (e) => {
		e.preventDefault();
		this.setState({ editModeInterest: true });
	};

	editLoc = (e) => {
		e.preventDefault();
		this.setState({ editModeLoc: true });
	};

	editDate = (e) => {
		e.preventDefault();
		this.setState({ editModeDate: true });
	};

	updateMail = (e) => {
		e.preventDefault();
		e.persist();
		axios({
			method: 'put',
			url: 'https://46.101.169.42:4433/edit',
			data: {
				email: e.target.email.value,
			},
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (data.error) {
				this.setState({ editModeMail: false, status: data.details });
			} else {
				this.setState({ email: e.target.email.value, editModeMail: false, status: data.details });
			}
		});
	};

	updateFN = (e) => {
		e.preventDefault();
		e.persist();
		axios({
			method: 'put',
			url: 'https://46.101.169.42:4433/edit',
			data: {
				firstname: e.target.firstname.value,
			},
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (data.error) {
				this.setState({ editModeFN: false, status: data.details });
			} else {
				this.setState({ firstname: e.target.firstname.value, editModeFN: false, status: data.details });
			}
		});
	};

	updateLN = (e) => {
		e.preventDefault();
		e.persist();
		axios({
			method: 'put',
			url: 'https://46.101.169.42:4433/edit',
			data: { lastname: e.target.lastname.value },
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (data.error) {
				this.setState({ editModeLN: false, status: data.details });
			} else {
				this.setState({ lastname: e.target.lastname.value, editModeLN: false, status: data.details });
			}
		});
	};

	updateBio = (e) => {
		e.preventDefault();
		e.persist();
		if (e.target.bio.value.length > 1000) {
			(e.target.bio.value = "");
			return ;
		}
		axios({
			method: 'put',
			url: 'https://46.101.169.42:4433/edit',
			data: { bio: e.target.bio.value },
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (data.error) {
				this.setState({ editModeBio: false, status: data.details });
			} else {
				this.setState({ bio: e.target.bio.value, editModeBio: false, status: data.details });
			}
		});
	};

	updateGender = (e) => {
		e.preventDefault();
		const gender = e.target.id;
		axios({
			method: 'put',
			url: 'https://46.101.169.42:4433/edit',
			data: {
				gender,
				sexualid: `${gender} ${this.state.orientation}`
			 },
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (data.error) {
				this.setState({ status: data.details });
			} else {
				this.setState({ status: data.details, gender });
			}
		});
	};

	updateOrientation = (e) => {
		e.preventDefault();
		const orientation = e.target.id;
		axios({
			method: 'put',
			url: 'https://46.101.169.42:4433/edit',
			data: {
				orientation,
				sexualid: `${this.state.gender} ${orientation}`
			 },
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (data.error) {
				this.setState({ status: data.details });
			} else {
				this.setState({ status: data.details, orientation });
			}
		});
	};

	updateInterest = async (e) => {
		e.preventDefault();
		const interest = e.target.interest.value;
		const newInterests = this.state.interests;
		newInterests.push(interest);
		const response = await axios({
			method: 'put',
			url: 'https://46.101.169.42:4433/edit',
			data: { interests: newInterests },
			headers: { logToken: localStorage.getItem('logToken') },
		});
		this.getData();
		if (response.data.error) {
			this.setState({ status: response.data.details });
		} else {
			this.setState({ status: response.data.details, interests: newInterests, editModeInterest: false });
		}
		browserHistory.push('/profile');
	};

	updateLoc = (e) => {
	    if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(async (position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;
				const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}`);
				if (response.data.status === 'OK') {
					const addr = response.data.results[3].formatted_address;
					const Location = {};
					Location.lat = lat;
					Location.lng = lng;
					Location.addr = addr;
					axios({
						method: 'put',
						url: 'https://46.101.169.42:4433/edit',
						data: { location: Location },
						headers: { logToken: localStorage.getItem('logToken') },
					}).then(({ data }) => {
						if (data.error) {
							this.setState({ status: data.details });
						} else {
							this.setState({ status: data.details, location: addr });
						}
					});
				}
			});
	    }
	};

	mansetLoc = async (e) => {
		let addr = e.label;
		if (addr) {
			const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${addr}`);
			if (response.data.status === 'OK') {
				addr = response.data.results[0].formatted_address;
				const Location = {};
				Location.lat = response.data.results[0].geometry.location.lat;
				Location.lng = response.data.results[0].geometry.location.lng;
				Location.addr = addr;
				axios({
					method: 'put',
					url: 'https://46.101.169.42:4433/edit',
					data: { location: Location },
					headers: { logToken: localStorage.getItem('logToken') },
				}).then(({ data }) => {
					if (data.error) {
						this.setState({ status: data.details, editModeLoc: false });
					} else {
						this.setState({ status: data.details, location: addr, editModeLoc: false });
					}
				});
			}
		}
	};

	updateDate = async (e) => {
		e.preventDefault();
		const birthdate = e.target.birthdate.value;
		const birthday = new Date(birthdate);
		const today = new Date();
		let age = today.getFullYear() - birthday.getFullYear();
		birthday.setFullYear(today.getFullYear());
		if (today < birthday) age--;
		axios({
			method: 'put',
			url: 'https://46.101.169.42:4433/edit',
			data: {
				birthdate,
				age,
			},
			headers: { logToken: localStorage.getItem('logToken') },
		}).then(({data}) => {
			if (data.error) {
				this.setState({ editModeDate: false, status: data.details });
			} else {
				this.setState({ birthdate, editModeDate: false, status: data.details });
			}
		});
	};

	clearstatus = (e) => {
		this.setState({status: null});
	};

	render() {
		const { editModeMail, editModeFN, editModeLN, editModeBio, editModeInterest, editModeLoc, editModeDate } = this.state;
		if (!this.state.loaded) return (<div>loading</div>)
		return (
			<div>
			{this.state.status && <div onClick={this.clearstatus} className="alert alert-danger">{this.state.status}</div>}
				<div className="wrapper">
					{this.state.pictures[0] && (
						<div className="thumbnails">

						<div className="thumbnail">
							<img onDoubleClick={this.delImage} role="presentation" id={0} src={"https://46.101.169.42:4433" + this.state.pictures[0]} key={0} title="double-click to remove your photo"/>
						</div>
						</div>
					)}
					<p>{this.state.username}</p>
					<p>
						<i className="fa fa-fire" aria-hidden="true"></i>
						{this.state.popscore}
					</p>

					{(!editModeMail && (<p onDoubleClick={this.editMail}>{this.state.email}</p>)) || (
						<form onSubmit={this.updateMail}>
							<input type="submit" hidden={true} defaultValue={this.state.email} />
							<input type="text" name="email" defaultValue={this.state.email} />
						</form>
					)}

					{(!editModeFN && (<p onDoubleClick={this.editFN}>{this.state.firstname}</p>)) || (
						<form onSubmit={this.updateFN}>
							<input type="submit" hidden={true} defaultValue={this.state.firstname} />
							<input type="text" name="firstname" defaultValue={this.state.firstname} />
						</form>
					)}

					{(!editModeLN && (<p onDoubleClick={this.editLN}>{this.state.lastname}</p>)) || (
						<form onSubmit={this.updateLN}>
							<input type="submit" hidden={true} defaultValue={this.state.lastname} />
							<input type="text" name="lastname" defaultValue={this.state.lastname} />
						</form>
					)}

					<div className="profilefield">
					<div>
					<span className="sexualid-btn">you are a</span>
						{this.state.gender === 'male' ? (
							<label id="male" onClick={this.updateGender} className="active-gender">Male</label>
						) : (
							<label id="male" onClick={this.updateGender} className="inactive-gender">Male</label>
						)}
						{this.state.gender === 'female' ? (
							<label id="female" onClick={this.updateGender} className="active-gender">Female</label>
						) : (
							<label id="female" onClick={this.updateGender} className="inactive-gender">Female</label>
						)}
					</div>
					<div>
					<span className="sexualid-btn">looking for</span>
						{this.state.orientation === 'male' ? (

							<label id="male" onClick={this.updateOrientation} className="active-gender">men</label>
						) : (
							<label id="male" onClick={this.updateOrientation} className="inactive-gender">men</label>
						)}
						{this.state.orientation === 'female' ? (
							<label id="female" onClick={this.updateOrientation} className="active-gender">women</label>
						) : (
							<label id="female" onClick={this.updateOrientation} className="inactive-gender">women</label>
						)}
						{this.state.orientation === 'any' ? (
							<label id="any" onClick={this.updateOrientation} className="active-gender">both</label>
						) : (
							<label id="any" onClick={this.updateOrientation} className="inactive-gender">both</label>
						)}
					</div>
					</div>

					{(!editModeBio && (<p onClick={this.editBio}>{this.state.bio || <button className="btn btn-default btn-file">say a few words about you...</button>}</p>)) || (
						<form className="bio-tag-input" onSubmit={this.updateBio}>
							<input type="text" name="bio" defaultValue={this.state.bio} />
							<input type="submit" hidden={true} defaultValue={this.state.bio} />
						</form>
					)}
					<div>
					{this.state.interests.map((interest, i) =>
						<li className="btn btn-default btn-file" onClick={this.delInterest} key={i} id={i}>{interest}</li>
					)}
					{(!editModeInterest && (<p className="btn btn-default btn-file" onClick={this.editInterest}>{this.state.interests.length > 0 ? ('+') : ('add a tag')}</p>
)) || (
						<form className="bio-tag-input" onSubmit={this.updateInterest}>
							<input type="text" name="interest" />
							<input type="submit" hidden={true} />
						</form>
					)}
					</div>
					<div className="profilefield">
					<i className="fa fa-map-marker" aria-hidden="true"></i> {this.state.location}
					</div>
						<p><i onClick={this.updateLoc} className="fa fa-location-arrow pointer" aria-hidden="true"></i> locate me ?</p>
					{(!editModeLoc && (<p><i onClick={this.editLoc} className="fa fa-plane pointer" aria-hidden="true"></i> find hotties elsewhere ?</p>)) || (
						<Geosuggest
				          placeholder="find hotties elsewhere!"
						  onSuggestSelect={this.mansetLoc}
						/>
					)}
					<div className="profilefield">
					{(!editModeDate && (<p><i onClick={this.editDate} className="fa fa-calendar pointer" aria-hidden="true"></i> {this.state.birthdate}</p>)) || (
						<form onSubmit={this.updateDate}>
							<input type="date" name="birthdate" />
							<input type="submit" hidden={true} defaultValue={this.state.birthdate} />
						</form>
					)}
					</div>

					<div>
					<div className="thumbnails">
					{this.state.pictures.map((picture, i) => i !== 0 &&
						<div key={i} className="thumbnail">
							<img onDoubleClick={this.delImage} role="presentation" id={i} height="200px" src={"https://46.101.169.42:4433" + picture} key={i} title="double-click to remove your photo"/>
						</div>
					)}
					</div>

					{this.state.pictures.length < 5 &&
						(
							<form encType="multipart/form-data">
								<input className="defaultInput"  type="file" name="photo" id="photo" onChange={this.addImage} />
								<label className="btn btn-default btn-file" htmlFor="photo">add a pic</label>
							</form>
						)}
						</div>

					{this.state.visitors ? (
						<p> latest visitors: {this.state.visitors.map((visitor, i) => i < 10 &&
							<li className="btn btn-default" key={i} id={i}><Link to={`/profile/${visitor}`}>{visitor}</Link></li>
						)}</p>
					) : (<div>no one has visited your profile yet...</div>)}
					{this.state.liked ? (
						<p> latest people who liked: {this.state.liked.map((like, i) => i < 10 &&
							<li className="btn btn-default" key={i} id={i}><Link to={`/profile/${like}`}>{like}</Link></li>
						)}</p>
					) : (<div>no one has liked your profile yet...</div>)}
					{this.state.likes.length > 0 ? (
						<p> latest people you liked: {this.state.likes.map((like, i) => i < 10 &&
							<li className="btn btn-default" key={i} id={i}><Link to={`/profile/${like}`}>{like}</Link></li>
						)}</p>
					) : (<div>you liked no profile yet...</div>)}
				</div>
				<Link to="/reset">want to change your password?</Link>
			</div>
		);
	};
};

const Profile = () => {
	return (
		<div className="profile">
			<ProfileRender />
		</div>
	);
};

export default Profile;
