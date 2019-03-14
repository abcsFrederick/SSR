import View from 'girder/views/View';
import seriesTable from '../../templates/orthancDB/seriesTable.pug';
import SeriesCollection from '../../collections/OrthancSeries';
import analysis from '../analysis/analysis';
import 'datatables.net';
import 'datatables.net-buttons';
var seriesView = View.extend({
	events:{
		'click #seriesTable tbody tr':'analyeseRender'
	},
	initialize(setting){
		this.$el.html(seriesTable())
		this.seriesCollection = new SeriesCollection({
			id:setting.id
		});
		this.seriesRender();
	},
	seriesRender(){
		this.seriesCollection.fetch({
			/*xhrFields: {
				  withCredentials: true							// override ajax to send with credential
			},*/
			success:_.bind(function(res){
				console.log(res.toJSON())
				this.seriesTableView = $('#seriesTable').DataTable({
						data:res.toJSON(),
					    rowId: 'ID',
					    'createdRow': function( row, data, dataIndex ) {
						      $(row).attr('source', 'orthanc');
						},
					    columns: [
					    	{
					    		data:'MainDicomTags.SeriesDescription'
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
		return this;
	},
	analyeseRender(e){
		console.log(e.currentTarget.id);
		console.log($('#analysis'))
		if(this.analysisView){
			this.analysisView.destroy()	//prevent from zombie view
		}
		this.analysisView = new analysis({
			selectedImageQuery:e.currentTarget.id,
			parentView:this
		});
		$('.analysisContent').html(this.analysisView.el)
	}
});

export default seriesView;
