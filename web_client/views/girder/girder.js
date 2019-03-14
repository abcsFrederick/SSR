import View from 'girder/views/View';
import girderTemplate from '../../templates/girder/girder.pug';
import '../../stylesheets/filesystem/filesystem.styl';
import HierarchyWidget from 'girder/views/widgets/HierarchyWidget';
import UsersViewWidget from '../widgets/UsersViewWidget';
import CollectionModel from 'girder/models/CollectionModel';
import { restRequest } from 'girder/rest';
import analysis from '../analysis/analysis';
import { fetchCurrentUser, setCurrentUser, getCurrentUser } from 'girder/auth';
import 'datatables.net';
import 'datatables.net-buttons';
import events from '../../events';
var girderDB = View.extend({
	events:{
		'click a.g-folder-list-link':'SelectTmpFolder'
	},
	initialize(){

		this.$el.html(girderTemplate());
		restRequest({
			url:'user'	
		}).then((col)=>{
			this.collection = new CollectionModel(col);
			this.widget = new UsersViewWidget({
		        el: $('#selectedFile'),
		        parentView: this,
		    });
		});
	},
	SelectItem(e){
		$('.image_selected').html(e.get('name'))
		this.ORIid=e.id
		if(this.analysisView){
			this.analysisView.destroy()	//prevent from zombie view
		}
		this.analysisView = new analysis({
			selectedImage:this.ORIid,
			selectedSEG:this.SEG,
			selectedTmpFolder:this.tmpFolderId,
			parentView:this
		});
		$('.analysisContent').html(this.analysisView.el)
	}
});

export default girderDB;