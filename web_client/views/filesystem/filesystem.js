import View from 'girder/views/View';
import ItemView from '../widgets/ItemView';
import filesystemTemplate from '../../templates/filesystem/filesystem.pug';
import '../../stylesheets/filesystem/filesystem.styl';
import BrowserWidget from 'girder/views/widgets/BrowserWidget';
import HierarchyWidget from 'girder/views/widgets/HierarchyWidget';
import FileListWidget from 'girder/views/widgets/FileListWidget';
import ItemModel from 'girder/models/ItemModel';
import CollectionModel from 'girder/models/CollectionModel';
import UserModel from 'girder/models/UserModel';
import { restRequest } from 'girder/rest';
import analysis from '../analysis/analysis';
import { fetchCurrentUser, setCurrentUser, getCurrentUser } from 'girder/auth';
import 'datatables.net';
import 'datatables.net-buttons';
import events from '../../events';
var filesystem = View.extend({
	events:{
		'click a.g-folder-list-link':'SelectTmpFolder'
	},
	initialize(){

		this.$el.html(filesystemTemplate());
		this.listenTo(events, 's:setSEG', this.setSEG);
		restRequest({
			url:'collection/5b33a1c9372ec3acf88d27b7'	
		}).then((col)=>{
			this.collection = new CollectionModel(col);
			this.widget = new HierarchyWidget({
		        el: $('#selectedFile'),
		        parentView: this,
		        parentModel:this.collection,
	            checkboxes: false,
	            routing: false,
	            showActions: false,
	            showItems: true,
	            showMetadata: false,
	            onItemClick:_.bind(this.SelectItem, this)
		    });
		});
		
		restRequest({
			url:'user/'+getCurrentUser().id	
		}).then((user)=>{
			this.User = new UserModel(user);
			this.widget = new HierarchyWidget({
		        el: $('#selectedTmpFolder'),
		        parentView: this,
		        parentModel:this.User,
	            checkboxes: false,
	            routing: false,
	            showActions: false,
	            showItems: false,
	            selectItem:false,
	            showMetadata: false,
	            onFolderSelect:_.bind(this.SelectTmpFolder,this)
		    });
		});
		
		restRequest({
			url:'collection/5b33a1c9372ec3acf88d27b7'	
		}).then((col)=>{
			this.collection = new CollectionModel(col);
			this.widget = new HierarchyWidget({
		        el: $('#selectedSEG'),
		        parentView: this,
		        parentModel:this.collection,
	            checkboxes: false,
	            routing: false,
	            showActions: false,
	            showItems: true,
	            showMetadata: false,
	            onItemClick:_.bind(this.SelectSEG, this)
		    });
		});

	},
	ORI(){
		this.dialog = null;
		console.log(this.collection)
		if (!this.dialog) {
		    	
		        this.dialog = this.createORIDialog();
		    }
		    
	    this.dialog.setElement('#g-dialog-container').render();
	},
	SEG(){
		this.dialog = null;
		if (!this.dialog) {
		    	
		        this.dialog = this.createSEGDialog();
		    }
		    
	    this.dialog.setElement('#g-dialog-container').render();
	},
	TmpFolder(){
		this.dialog = null;
		if (!this.dialog) {
		    	
		        this.dialog = this.createTmpDialog();
		    }
		    
	    this.dialog.setElement('#g-dialog-container').render();
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
	},
	SelectSEG(e){
		this.itemid=e.id
		restRequest({
			url:'item/'+this.itemid
		}).then((item)=>{
			this.item = new ItemModel(item)
			this.itemView = new ItemView({
	            el: this.$('#selectedSEG'),
	            item: this.item,
	            fileEdit: false,
	            upload: false,
	            parentView: this
	        });
		});
		//ItemView.fetchAndInit(this.itemid)
	},
	SelectTmpFolder(e){
		$('.tmpFolder_selected').html(e.get('name'))
		this.tmpFolderId = e.id

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
	},
	setSEG(id){
		this.SEG=id;
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

export default filesystem;