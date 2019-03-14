import View from 'girder/views/View';
import { restRequest } from 'girder/rest';
import events from '../../events';
import router from '../../router';
import VisualizationSelectionTemplate from '../../templates/workflow/VisualizationSelection.pug';
import '../../stylesheets/workflow/VisualizationSelection.styl';
var VisualizationSelection = View.extend({
	events:{
		'click #d3Visualizer':'d3viewer',
		'click #amiVisualizer':'amiviewer'
	},
	initialize(setting){
		this.$el.html(VisualizationSelectionTemplate())
		this.jobId= setting.jobId
		restRequest({
            url: 'SSR/',
            data:{jobId:this.jobId}
        }).then((e) => {
        	this.ext = e[0].task.outputs.exts[0];
        	this.inputs=e[0].task.inputs;
        	this.outputs = e[0].task.outputs;
        });
        //For final Visualizer
        //this.listenTo(events, 'query:Visualizer', this.Visualizer);
        //For Visualizer panel in workflow
	},
	render(){
		return this;
	},
	d3viewer(){
		$('#d3Visualizer').addClass('active');
		let combie={inputs:this.inputs,outputs:this.outputs}
		let query = this.outputs._id
		restRequest({
			method:'PUT',
            url: 'SSR/Visualizer/'+this.jobId,
            data:{VisualizerName: 'd3Visualizer',VisualizerTarget: query}
        });
		router.setQuery('d3Visualizer', query, {trigger: true});
	},
	amiviewer(){
		router.setQuery('amiVisualizer', target.api, {trigger: true});
	}

});
export default VisualizationSelection;
