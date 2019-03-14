import View from 'girder/views/View';
import studiesTable from '../../templates/orthancDB/studiesTable.pug';
import StudyCollection from '../../collections/OrthancStudies.js';
import SeriesView from './seriesView'
import 'datatables.net';
import 'datatables.net-buttons';
var studiesView = View.extend({
	events:{
		'click #studiesTable tbody tr':'seriesRender'
	},
	initialize(setting){
		this.$el.html(studiesTable())
		this.studyCollection = new StudyCollection({
			id:setting.id
		});
		//this.seriesDom = setting.seriesDom;
		this.studiesRender();
	},
	studiesRender(){
		this.studyCollection.fetch({
			/*xhrFields: {
				  withCredentials: true							// override ajax to send with credential
			},*/
			success:_.bind(function(res){
				console.log(res.toJSON())
				this.studiesTableView = $('#studiesTable').DataTable({
						data:res.toJSON(),
					    rowId: 'ID',
					    columns: [
					    	{
					    		data:'MainDicomTags.StudyID'
					    	},
					    	{
					    		data:'MainDicomTags.StudyDescription'
					    	}
					    ],
					    destroy: true,
						"lengthMenu":[[-1],['ALL']],
						"scrollY": "60vh",
						"scrollCollapse": true,
						"dom":'rt'
				})
			},this)
		})
	},
	seriesRender(e){

		if(this.seriesView){
			this.seriesView.destroy()	//prevent from zombie view
		}
		this.seriesView = new SeriesView({
			id:e.currentTarget.id,
			parentView:this
		})
		$('#series').html(this.seriesView.el)
	}
});

export default studiesView;
