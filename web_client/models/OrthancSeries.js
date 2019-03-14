import Backbone from 'backbone';


var OrthancSeries = Backbone.Model.extend({

	parse: function(response) {

		this.attributes=response
	  	return this.attributes;
	}
});

export default OrthancSeries;