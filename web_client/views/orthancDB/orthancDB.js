import View from 'girder/views/View';
import overallTable from '../../templates/orthancDB/overallTable.pug';
import OrthancPatients from '../../collections/OrthancPatients';
import StudiesView from './studiesView'
import 'datatables.net';
import 'datatables.net-buttons';
var orthancView = View.extend({
	events:{
		'click #patientsTable tbody tr':'studiesRender'
	},
	initialize(){
		this.$el.html(overallTable())
		this.orthancPatients = new OrthancPatients();
		this.patientsRender();
	},
	patientsRender(){
		this.orthancPatients.fetch({
			/*xhrFields: {
				  withCredentials: true							// override ajax to send with credential
			},*/
			success:_.bind(function(res){
				console.log(res.toJSON());
				this.patientsTableView = $('#patientsTable').DataTable({
						data:res.toJSON(),
					    rowId: 'ID',
					    columns: [
					    	{
					    		data:'MainDicomTags.PatientName'
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
	studiesRender(e){
		console.log(e.currentTarget.id);
		if(this.studiesView){
			this.studiesView.destroy()	//prevent from zombie view
		}
		this.studiesView = new StudiesView({
			id:e.currentTarget.id,
			parentView:this,
		//	seriesDom:$('#series')
		})
		$('#studies').html(this.studiesView.el)
	}
})

export default orthancView;