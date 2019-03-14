import Backbone from 'backbone';


var OrthancStudies = Backbone.Model.extend({

	parse: function(response) {

		this.attributes=response
	  	return this.attributes;
	}
});

export default OrthancStudies;