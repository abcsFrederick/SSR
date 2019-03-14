import Backbone from 'backbone';


var OrthancPatients = Backbone.Model.extend({

	parse: function(response) {

		this.attributes=response
	  	return this.attributes;
	}
});

export default OrthancPatients;