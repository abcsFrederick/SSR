import Backbone from 'backbone';
import orthancPatients from '../models/OrthancPatients';

var OrthancPatients = Backbone.Collection.extend({
	model:orthancPatients,
	username:'admin',
	password:'adminPassword',
	url:function(){
		return 'http://admin:adminPassword@ivg-boxx/Orthanc/patients?expand=true'
	},
	initialize(setting){
		this.setting = setting
	},

});

export default OrthancPatients;