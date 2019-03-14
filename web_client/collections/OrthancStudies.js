import Backbone from 'backbone';
import orthancStudies from '../models/OrthancStudies';

var OrthancStudies = Backbone.Collection.extend({
	model:orthancStudies,
	username:'admin',
	password:'adminPassword',
	url:function(){
		return 'http://admin:adminPassword@ivg-boxx/Orthanc/patients/'+this.id+'/studies'
	},
	initialize(setting){
		this.id = setting.id
	},

});

export default OrthancStudies;