import Backbone from 'backbone';
import orthancSeries from '../models/OrthancSeries';

var OrthancSeries = Backbone.Collection.extend({
	model:orthancSeries,
	username:'admin',
	password:'adminPassword',
	url:function(){
		return 'http://admin:adminPassword@ivg-boxx/Orthanc/studies/'+this.id+'/series'
	},
	initialize(setting){
		this.id = setting.id
	},

});

export default OrthancSeries;