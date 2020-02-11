import View from 'girder/views/View';

import { restRequest } from 'girder/rest';
import { getCurrentUser } from 'girder/auth';
import { splitRoute, parseQueryString } from 'girder/misc';
import CollectionModel from 'girder/models/CollectionModel';
import FolderModel from 'girder/models/FolderModel';
import ItemModel from 'girder/models/ItemModel';
import FileModel from 'girder/models/FileModel';
import UserModel from 'girder/models/UserModel';
import HierarchyWidget from 'girder/views/widgets/HierarchyWidget';
// import SAIPHierarchyBreadcrumbView from 'girder_plugins/SAIP/views/SAIPHierarchyBreadcrumbView';
import FolderCollection from 'girder/collections/FolderCollection';
import ItemCollection from 'girder/collections/ItemCollection';
import FileCollection from 'girder/collections/FileCollection';

import events from '../../events';
import PreviewTemplate from '../../templates/preview/preview.pug';
import PreviewPrepareTemplate from '../../templates/preview/previewPrepareTemplate.pug';
import router from '../../router';
import dataSourceTemplate from '../../templates/dataSource/dataSource.pug';
import '../../stylesheets/dataSource/dataSource.styl';
import UsersView from '../widgets/UsersViewWidget';
import CollectionsView from '../widgets/CollectionsViewWidget';
import SaipView from '../widgets/SaipViewWidget';

import AnnotationSelector from '../widgets/AnnotationSelectorWidget';
import ImageActions from './imageActions';

import ArchiveView from 'girder_plugins/Archive/views/ArchiveView';
import AmiViewerSEG from 'girder_plugins/AMI_plugin/views/AMIViewerSEG';
import UserView from 'girder_plugins/SSR_task/views/widgets/UserViewWidget';
import CollectionView from 'girder_plugins/SSR_task/views/widgets/CollectionViewWidget';

var dataSource =  View.extend({
	events: {
	    'click .s-nav-siderBar':'_collaspeSideBar',
		'click .ds-Girder':function(e){
	        let link = $(e.currentTarget);
	        let curRoute = Backbone.history.fragment,
	            routeParts = splitRoute(curRoute),
	            queryString = parseQueryString(routeParts.name);
	        let unparsedQueryString = $.param(queryString);
	        if (unparsedQueryString.length > 0) {
	            unparsedQueryString = '?' + unparsedQueryString;
	        }
	        this.fromFilesystem = true;
	        this.fromSaipArchive = false;
	        this.girderArchive = new UserView({
	            parentView: this,
	            viewName: 'dataUserView',
	            el: '#dataUSERArch',
	            id: link.attr('g-id')
	        });
		},
	    'click .ds-Filesystem':function(e){
	        let link = $(e.currentTarget);
	        let curRoute = Backbone.history.fragment,
	            routeParts = splitRoute(curRoute),
	            queryString = parseQueryString(routeParts.name);
	        let unparsedQueryString = $.param(queryString);
	        if (unparsedQueryString.length > 0) {
	            unparsedQueryString = '?' + unparsedQueryString;
	        }
	        this.fromFilesystem = true;
	        this.fromSaipArchive = false;
	        this.girderArchive = new CollectionView({
	            parentView: this,
	            viewName: 'dataCollectionView',
	            el: '#dataCollectionArch',
	            id: link.attr('g-id')
	        });
	    },
	    'click .ds-SAIP':function(e){

			// this.deactivateAll();

			let link = $(e.currentTarget);
			// if(link.parent().hasClass('g-active')){
			//   link.parent().removeClass('g-active');
			// }else{
			//   link.parent().addClass('g-active');
			// }
			// if($(e.target).hasClass('icon-left-dir')){
			//   $('.ds-SAIP > .icon-right-dir').show();
			//   $('.ds-SAIP > .icon-left-dir').hide();
			//   $('.selectionDom').css('display','none');
			//   link.parent().addClass('g-active');
			// }
			// else if($(e.target).hasClass('icon-right-dir')){
			//   $('.ds-SAIP > .icon-left-dir').show();
			//   $('.ds-SAIP > .icon-right-dir').hide();
			//   $('.selectionDom').css('display','inline-block');
			//   $('.selectionDom').css('height','inherit');
			//   link.parent().addClass('g-active');
			// }
			// else{
			let curRoute = Backbone.history.fragment,
			    routeParts = splitRoute(curRoute),
			    queryString = parseQueryString(routeParts.name);
			let unparsedQueryString = $.param(queryString);
		    if (unparsedQueryString.length > 0) {
		        unparsedQueryString = '?' + unparsedQueryString;
		    }
		    this.fromFilesystem = true;
	        this.fromSaipArchive = false;
	        this.saipArchive = new ArchiveView({
	            parentView: this,
	            el: '#dataSAIPArch',
	            id: link.attr('g-id')
	        });
	        // router.enabled(1);
	        // router.navigate('view/saip' + unparsedQueryString, {trigger: true});

			//   $('.ds-SAIP > .icon-left-dir').show();
			//   link.parent().addClass('g-active');
			//   if(link.parent().hasClass('g-active')){
			//     $('.selectionDom').css('display','inline-block');
			//     $('.selectionDom').css('height','inherit');
			//   }else{
			//     $('.selectionDom').css('display','none');
			//   }
			// }
	    },
		'click #sidebarCollapse': 'dataSourceCollapse',
		'click #startView': 'startView',
		'click .cancel': 'closePreviewModal',
		'click .close': 'closePreviewModal'
	},
	initialize(setting) {
		this.init = true;
		this._openId = null;
		Array.prototype.diff = function(a) {
		    return this.filter(function(i) {return a.indexOf(i) < 0;});
		};
		Array.prototype.same = function(a) {
		    return this.filter(function(i) {return a.indexOf(i) >= 0;});
		};
		Array.prototype.removeSame = function(a) {
		    return this.filter(function(i) {return a.indexOf(i) == -1;});
		};
		this.itemsCollectionIds = [];

		this.totalSeriesPath = [];
		this.totalSeriesId = [];
		this.totalSeriesIdentity = [];

		this.totalSeriesPathInit = [];
		this.totalSeriesIdInit = [];
		this.totalSeriesIdentityInit = [];

    	this.SSR_ProjectCollection = setting.SSR_ProjectCollection;
		this.currentUser = setting.currentUser;
		this.itemsCollection = new ItemCollection();
		this.filesCollection = new FileCollection();

		this.$el.html(dataSourceTemplate({
			SSR_Project: this.SSR_ProjectCollection,
			user: getCurrentUser()
		}))
		
		this.SAIPHierarchyBreadcrumbObjects = [{'object': {'name': 'SAIP'}, 'type': 'SAIP'}];

		// this.listenTo(events,'ssr:chooseFolderItem',this.findPath)

	    this.listenTo(this.SSR_ProjectCollection, "change", this._addSSRProjectNav);
	    this.listenTo(events, 'query:mode', this._changeMode);

	    /*Set visualized item's parent folder (not workspace folder)*/
	    this.listenTo(events, 'query:filesystemFolder', this.filesystemFolder);

	    // events.on('ds:highlightItem', this.selectForView, this);
	    
	    this.listenTo(events, 'query:currentItem', this.visualization);
	    this.listenTo(events, 'query:editSegmentationFolderId', this.editSegmentationFolderId);
	    this.listenTo(events, 'query:cursorSize', this._setCursorSize);
	    this.listenTo(events, 'query:labelColor', this._setLabelColor);

	    this.listenTo(events, 'ami:overlaySelectedAnnotation', this.overlaySelectedAnnotation);
	    this.listenTo(events, 'ami:removeSelectedAnnotation', this.removeSelectedAnnotation);
	    this.listenTo(events, 'ds:_saveAnnotationAlert', this._saveAnnotationAlert);
	},
	overlaySelectedAnnotation(annotationItemId) {
		this.getImageFilesFromItemPromise(annotationItemId).then((files) => {
		    if (files[0].exts[0] === 'nrrd') {
		        let referenceAnnotation_url = 'api/v1/file/' + files[0]['_id'] +
		                                      '/download?contentDisposition=attachment&contentType=application%2Fnrrd';
		        this.amiDisplayPreview.drawAnnotation(referenceAnnotation_url, false , true, annotationItemId);
		    } else {
		        let referenceAnnotation_url = _.map(files, function (eachFile) {
		             return 'api/v1/file/' + eachFile['_id'] +
		                    '/download?contentDisposition=attachment';
		        });
		    }
		});
	},
	removeSelectedAnnotation(annotationItemId) {
		this.getImageFilesFromItemPromise(annotationItemId).then((files) => {
		    if (files[0].exts[0] === 'nrrd') {
		        let referenceAnnotation_url = 'api/v1/file/' + files[0]['_id'] +
		                                      '/download?contentDisposition=attachment&contentType=application%2Fnrrd';
		        this.amiDisplayPreview.removeAnnotation(referenceAnnotation_url, annotationItemId);
		    } else {
		        let referenceAnnotation_url = _.map(files, function (eachFile) {
		             return 'api/v1/file/' + eachFile['_id'] +
		                    '/download?contentDisposition=attachment';
		        });
		    }
		});
	},
	visualization(e) {
	    let curRoute = Backbone.history.fragment,
	    nav = splitRoute(curRoute).base.split('/')[0];
	    // Make sure on view panel
	    if (nav === 'view') {
	      	this.currentImageId = e;
	      	if (this._openId !== this.currentImageId || this._mode !== this.mode) {
	        	this._mode = this.mode;
	  			this._openId = this.currentImageId;
	  	  		this.getImageFilesFromItemPromise(this.currentImageId).then((files) => {
	  	  			let displayUrl;
					if (files[0].exts[0] === 'nrrd') {
						displayUrl = 'api/v1/file/' + files[0]['_id'] +
									 '/download?contentDisposition=attachment&contentType=application%2Fnrrd';
					} else {
						displayUrl = _.map(files, function (eachFile) {
							return 'api/v1/file/' + eachFile['_id'] +
									'/download?contentDisposition=attachment';
						});
					}

  					if (this.amiDisplayPreview) {
	  	          		this.init = false;
						if (this.amiDisplayPreview.annotationNeedsUpdate) {
							this._saveAnnotationAlert(this.amiDisplayPreview.currentAnnotationItemId);
						}
	  	        	} else {
	  	          		this.amiDisplayPreview = new AmiViewerSEG({
		  	    			el: '.ssrVisualizer',
		  	                parentView: this
	  	          		});
	  	        	}
  					this.amiDisplayPreview.render(this.init, displayUrl);
  					this.amiDisplayPreview.once('g:imageRendered', () => {
  						// FIXME: query segmentation information 
  						// and render image header
						restRequest({
	  			        	url: 'SSR_task/link',
	  			        	data: {
	  			        		'originalId': this.currentImageId
	  			        	}
	  			      	}).then(_.bind((items) => {
	  			      		if (items.length) {
		            			let segmentationItemId = items[0]['segmentationId'];
		  				      	this.getImageFilesFromItemPromise(segmentationItemId).then((files) => {
		  				      		if (files[0].exts[0] === 'nrrd') {
		  					            let referenceAnnotation_url = 'api/v1/file/' + files[0]['_id'] +
		  					            							  '/download?contentDisposition=attachment&contentType=application%2Fnrrd';
		  					            if (this.mode === 'edit') {
					                        this.amiDisplayPreview.drawAnnotation(referenceAnnotation_url, true, true, segmentationItemId, this.mode, this.labelColor, this.cursorSize);
					                        this.amiDisplayPreview.currentAnnotationItemId = segmentationItemId;
		                      			}
				                        if (this.mode === 'view' || 'undefined') {
				                          this.amiDisplayPreview.drawAnnotation(referenceAnnotation_url, true, true, segmentationItemId, this.mode, this.labelColor, this.cursorSize);
				                        }
		  						    }else{
		  					            let referenceAnnotation_url = _.map(files, function(eachFile) {
		  					                return 'api/v1/file/' + eachFile['_id'] +
		  					                       '/download?contentDisposition=attachment';
		  						      	});
		  						    }
		  				      	});
			                    if(this.imageActions){
			                        this.imageActions.destroy();
			                    }
		                  
			                    this.imageActions = new ImageActions({
									el: $('#Actions'),
									mode: this.mode,
									currentViewFolderId: this.sourceFolderId,
									currentImageSegmentations: items,
									itemsCollectionIds: this.itemsCollectionIds,
									allImagesName: this.itemsCollection.models,
									currentImage: this.currentImage.get('name'),
									currentImageId:this.currentImage.get('_id'),
									fromFilesystem: this.fromFilesystem,
									fromSaipArchive: this.fromSaipArchive,
									parentView: this
			                    }).render();
	                  			this.amiDisplayPreview.annotationSelector(items, this.mode, this.editSegmentationFolderId, this.labelColor, this.cursorSize);
		  			      	} else {
		  			      	}
	  			        }, this));
  					});
	  	  		});
	  	    }
	    }
	},
	editSegmentationFolderId(editSegmentationFolderId) {
		this.editSegmentationFolderId = editSegmentationFolderId;
	},
	getImageFilesFromItemPromise(e) {
		return new Promise(_.bind(function (resolve, reject) {
			restRequest({
	        	url: 'item/' + e + '/files?limit=1000',
			}).then((files) => {    //files object
				resolve(files);
			})
		}, this));
	},
	render() {
		return this;
	},
	dataSourceCollapse() {
		$('.wrapper').toggleClass('active');
	},
	/*
		For SAIP archive selection
	*/
	// findPath(typeAndIdOrPath){

	// 	let type=typeAndIdOrPath.currentTarget.getAttribute('s-type');
	// 	let seriesPathDiff=[];
	// 	let seriesPathSame=[];

	// 	let seriesIdDiff=[];
	// 	let seriesIdSame=[];

	// 	let seriesIdentityDiff=[];
	// 	let seriesIdentitySame=[];

	// 	let query_id;
	// 	if(type==='project'){
	// 		query_id = typeAndIdOrPath.currentTarget.getAttribute('s-project-id');
	// 		restRequest({
	// 			url:'SAIP/'+query_id+'/rootpath/project'	
	// 		}).then(_.bind((col)=>{
	// 			seriesPathDiff=col.series_roots.diff(this.totalSeriesPath);
	// 			// console.log(seriesPathDiff)
	// 			this.totalSeriesPathInit = this.totalSeriesPath
	// 			// concat first to prevent after going upper level some inside already selected and forget to remove from list
	// 			this.totalSeriesPath=this.totalSeriesPath.concat(seriesPathDiff)
	// 			// and after adding all folder underneath folder then remove same which will make sure even if going up level all underneath clean up when uncheck checkbox
	// 			seriesPathSame=col.series_roots.same(this.totalSeriesPathInit);
	// 			this.totalSeriesPath=this.totalSeriesPath.removeSame(seriesPathSame)
	// 			console.log(this.totalSeriesPath)

	// 			seriesIdDiff=col.seriesId.diff(this.totalSeriesId);
	// 			this.totalSeriesIdInit = this.totalSeriesId;
	// 			this.totalSeriesId=this.totalSeriesId.concat(seriesIdDiff);
	// 			seriesIdSame=col.seriesId.same(this.totalSeriesIdInit);
	// 			this.totalSeriesId=this.totalSeriesId.removeSame(seriesIdSame);
	// 			console.log(this.totalSeriesId)

	// 			seriesIdentityDiff=col.identity.diff(this.totalSeriesIdentity);
	// 			this.totalSeriesIdentityInit = this.totalSeriesIdentity;
	// 			this.totalSeriesIdentity=this.totalSeriesIdentity.concat(seriesIdentityDiff);
	// 			seriesIdentitySame=col.identity.same(this.totalSeriesIdentityInit);
	// 			this.totalSeriesIdentity=this.totalSeriesIdentity.removeSame(seriesIdentitySame);
	// 			console.log(this.totalSeriesIdentity)
	// 		},this));
	// 	}else if(type==='experiment'){
	// 		query_id = typeAndIdOrPath.currentTarget.getAttribute('s-experiment-id');
	// 		restRequest({
	// 			url:'SAIP/'+query_id+'/rootpath/experiment'	
	// 		}).then((col)=>{
	// 			console.log(col.series_roots)
	// 			this.totalSeriesPathInit = this.totalSeriesPath
	// 			seriesPathDiff=col.series_roots.diff(this.totalSeriesPath);
	// 			this.totalSeriesPath=this.totalSeriesPath.concat(seriesPathDiff);
	// 			console.log(typeof(this.totalSeriesPath))
	// 			seriesPathSame=col.series_roots.same(this.totalSeriesPathInit);
	// 			this.totalSeriesPath=this.totalSeriesPath.removeSame(seriesPathSame)
	// 			console.log(this.totalSeriesPath)

	// 			seriesIdDiff=col.seriesId.diff(this.totalSeriesId);
	// 			this.totalSeriesIdInit = this.totalSeriesId;
	// 			this.totalSeriesId=this.totalSeriesId.concat(seriesIdDiff);
	// 			seriesIdSame=col.seriesId.same(this.totalSeriesIdInit);
	// 			this.totalSeriesId=this.totalSeriesId.removeSame(seriesIdSame);
	// 			console.log(this.totalSeriesId)

	// 			seriesIdentityDiff=col.identity.diff(this.totalSeriesIdentity);
	// 			this.totalSeriesIdentityInit = this.totalSeriesIdentity;
	// 			this.totalSeriesIdentity=this.totalSeriesIdentity.concat(seriesIdentityDiff);
	// 			seriesIdentitySame=col.identity.same(this.totalSeriesIdentityInit);
	// 			this.totalSeriesIdentity=this.totalSeriesIdentity.removeSame(seriesIdentitySame);
	// 			console.log(this.totalSeriesIdentity)
	// 		});
	// 	}else if(type==='patient'){
	// 		query_id = typeAndIdOrPath.currentTarget.getAttribute('s-patient-id');
	// 		restRequest({
	// 			url:'SAIP/'+query_id+'/rootpath/patient'	
	// 		}).then((col)=>{
	// 			this.totalSeriesPathInit = this.totalSeriesPath
	// 			seriesPathDiff=col.series_roots.diff(this.totalSeriesPath);
	// 			this.totalSeriesPath=this.totalSeriesPath.concat(seriesPathDiff)
	// 			seriesPathSame=col.series_roots.same(this.totalSeriesPathInit);
	// 			this.totalSeriesPath=this.totalSeriesPath.removeSame(seriesPathSame)
	// 			console.log(this.totalSeriesPath)

	// 			seriesIdDiff=col.seriesId.diff(this.totalSeriesId);
	// 			this.totalSeriesIdInit = this.totalSeriesId;
	// 			this.totalSeriesId=this.totalSeriesId.concat(seriesIdDiff);
	// 			seriesIdSame=col.seriesId.same(this.totalSeriesIdInit);
	// 			this.totalSeriesId=this.totalSeriesId.removeSame(seriesIdSame);
	// 			console.log(this.totalSeriesId);

	// 			seriesIdentityDiff=col.identity.diff(this.totalSeriesIdentity);
	// 			this.totalSeriesIdentityInit = this.totalSeriesIdentity;
	// 			this.totalSeriesIdentity=this.totalSeriesIdentity.concat(seriesIdentityDiff);
	// 			seriesIdentitySame=col.identity.same(this.totalSeriesIdentityInit);
	// 			this.totalSeriesIdentity=this.totalSeriesIdentity.removeSame(seriesIdentitySame);
	// 			console.log(this.totalSeriesIdentity)
	// 		});
	// 	}else if(type==='study'){
	// 		query_id = typeAndIdOrPath.currentTarget.getAttribute('s-study-id');
	// 		restRequest({
	// 			url:'SAIP/'+query_id+'/rootpath/study'	
	// 		}).then((col)=>{
	// 			this.totalSeriesPathInit = this.totalSeriesPath
	// 			seriesPathDiff=col.series_roots.diff(this.totalSeriesPath);
	// 			this.totalSeriesPath=this.totalSeriesPath.concat(seriesPathDiff)
	// 			seriesPathSame=col.series_roots.same(this.totalSeriesPathInit);
	// 			this.totalSeriesPath=this.totalSeriesPath.removeSame(seriesPathSame)
	// 			console.log(this.totalSeriesPath);

	// 			seriesIdDiff=col.seriesId.diff(this.totalSeriesId);
	// 			this.totalSeriesIdInit = this.totalSeriesId;
	// 			this.totalSeriesId=this.totalSeriesId.concat(seriesIdDiff);
	// 			seriesIdSame=col.seriesId.same(this.totalSeriesIdInit);
	// 			this.totalSeriesId=this.totalSeriesId.removeSame(seriesIdSame);
	// 			console.log(this.totalSeriesId);

	// 			seriesIdentityDiff=col.identity.diff(this.totalSeriesIdentity);
	// 			this.totalSeriesIdentityInit = this.totalSeriesIdentity;
	// 			this.totalSeriesIdentity=this.totalSeriesIdentity.concat(seriesIdentityDiff);
	// 			seriesIdentitySame=col.identity.same(this.totalSeriesIdentityInit);
	// 			this.totalSeriesIdentity=this.totalSeriesIdentity.removeSame(seriesIdentitySame);
	// 			console.log(this.totalSeriesIdentity)
	// 		});
	// 	}else if(type==='series'){
	// 		query_id = typeAndIdOrPath.currentTarget.getAttribute('s-series-id');
	// 		restRequest({
	// 			url:'SAIP/'+query_id+'/rootpath/series'	
	// 		}).then((col)=>{
	// 			this.totalSeriesPathInit = this.totalSeriesPath
	// 			seriesPathDiff=col.series_roots.diff(this.totalSeriesPath);
	// 			this.totalSeriesPath=this.totalSeriesPath.concat(seriesPathDiff)
	// 			seriesPathSame=col.series_roots.same(this.totalSeriesPathInit);
	// 			this.totalSeriesPath=this.totalSeriesPath.removeSame(seriesPathSame)
	// 			console.log(this.totalSeriesPath);

	// 			seriesIdDiff=col.seriesId.diff(this.totalSeriesId);
	// 			this.totalSeriesIdInit = this.totalSeriesId;
	// 			this.totalSeriesId=this.totalSeriesId.concat(seriesIdDiff);
	// 			seriesIdSame=col.seriesId.same(this.totalSeriesIdInit);
	// 			this.totalSeriesId=this.totalSeriesId.removeSame(seriesIdSame);
	// 			console.log(this.totalSeriesId);

	// 			seriesIdentityDiff=col.identity.diff(this.totalSeriesIdentity);
	// 			this.totalSeriesIdentityInit = this.totalSeriesIdentity;
	// 			this.totalSeriesIdentity=this.totalSeriesIdentity.concat(seriesIdentityDiff);
	// 			seriesIdentitySame=col.identity.same(this.totalSeriesIdentityInit);
	// 			this.totalSeriesIdentity=this.totalSeriesIdentity.removeSame(seriesIdentitySame);
	// 			console.log(this.totalSeriesIdentity)
	// 		});
	// 	}	
	// },
	/*
		Green View is click
	*/
	startView (e) {
		this.itemsCollection = new ItemCollection();
		if (this.fromFilesystem) {
			let folderView = this.girderArchive.hierarchyWidget.folderListView;
			let folders = folderView.checked;
			/* folders should be limited as only one for now */
			this.itemListsFromFolder = [];

	      	for (let a = 0; a < folders.length; a++) {
				let folderModel = folderView.collection.get(folders[a]);
				restRequest({
					method: 'GET',
					url: '/item',
					data: {'folderId': folderModel.get('_id')}
				}).then(_.bind((items) => {
					this.itemsCollection.set(items);
					router.setQuery('mode', 'view');
					router.setQuery('filesystemFolder', folderModel.get('_id'));
					router.setQuery('currentItem', this.itemsCollection.at(0).get('_id'), {trigger: true, replace: true});
					this.mode = 'view';
					/*workSpaceFolder should receive `input images' parent folder id` here*/
					// router.setQuery('workSpaceFolder', folderModel.get('_id'), {trigger: true})
				}, this));
	      	}
		} else if (this.fromSaipArchive) {
			// router.enabled(1);
			let studyId = this.dsSaipView.saipProjectsView.saipExperimentsView.saipPatientsView.saipStudiesView.selectecStudyId;
			this.itemListsFromFolder=[];
			restRequest({
				method:'GET',
				url:'SAIP/' + studyId + '/SAIPExistingValidation'
			}).then(_.bind((res)=>{
				let folderModel = new FolderModel(res);
				this.currentViewFolder = folderModel;
				restRequest({
					method:'GET',
					url:'/item',
					data:{'folderId':folderModel.get('_id')}
				}).then(_.bind((items)=>{
					this.itemListsFromFolder = this.itemListsFromFolder.concat(items);
					this.itemsCollection.set(this.itemListsFromFolder);
					// router.enabled(1);
					router.setQuery('filesystemFolder', folderModel.get('_id'), {trigger: true});
					// this.controlPanel.currentViewItemId = this.itemsCollection.models[0].get('_id');
					router.setQuery('PreviewFileItem',this.itemsCollection.models[0].get('_id'), {trigger: true});
				},this));
			},this));
		} else {
			events.trigger('g:alert', {
				type: 'warning',
				text: 'Please select a dataset to visualize',
				icon: 'info',
				timeout: 5000
			});
	  		return;
		}
	},
	filesystemFolder(sourceFolderId) {
		this.itemListsFromFolder = [];
		this.itemsCollectionIds = [];
		this.sourceFolderId = sourceFolderId;
		// this.fromFilesystem = true;
		// this.fromSaipArchive = false;
		restRequest({
			method: 'GET',
			url: '/item',
			data: {'folderId': this.sourceFolderId}
		}).then(_.bind((items) => {
			this.itemListsFromFolder = this.itemListsFromFolder.concat(items);
			this.itemsCollection.set(this.itemListsFromFolder);

			this.currentImage = this.itemsCollection.get(this.currentImageId);
			if (!this.currentImage) {
				this.currentImage = this.itemsCollection.models[0];
			}

			for(let a = 0; a < this.itemsCollection.models.length; a++) {
				this.itemsCollectionIds.push(this.itemsCollection.models[a].get('_id'));
			}
			this.currentImageId = this.currentImage.get('_id');
		}, this));
	},
	closePreviewModal() {
		$('#PreviewSelection').hide();
	},
	// selectForView: function (viewName) {

	//   this.deactivateAll(viewName);

	//   if(viewName == 'dsUsersView')
	//   {
	//     // console.log(this.$('.g-ds-nav-container [g-name='+viewName.slice(0,-4)+']'))
	//     this.$('.g-ds-nav-container [g-name='+viewName.slice(0,-4)+']').parent().addClass('g-active');
	//     // $('.ds-Girder > .icon-left-dir').show();
	//   }
	//   if(viewName == 'dsSSRProjectView')
	//   {
	//     this.$('.g-ds-nav-container [g-name='+viewName.slice(0,-4)+']').parent().addClass('g-active');
	//     // $('.ds-Filesystem > .icon-left-dir').show();
	//   }
	//   if(viewName == 'dsSAIPProjectView')
	//   {
	//     this.$('.g-ds-nav-container [g-name='+viewName.slice(0,-4)+']').parent().addClass('g-active');
	//     // $('.ds-SAIP > .icon-left-dir').show();
	//   }
	// },
	// deactivateAll(){
	//   // this.$('.icon-left-dir').hide();
	//   // this.$('.icon-right-dir').hide();
	//   this.$('.g-global-nav-li').removeClass('g-active');
	// },
	_updateFile(targetFileId) {
		restRequest({
			method: 'GET',
			url: 'file/' + targetFileId
		}).then((file) => {
			this.targetTestFile = new FileModel(file);
			// console.log(this.amiDisplayPreview.stack2.rawData[0])
			// var arr_test = new Uint8Array([32,31]);
			this.amiDisplayPreview.stack2.unPack(this.amiDisplayPreview.stack2.rawData[0]);

			// let arr = this.amiDisplayPreview.stack2.rawData[0];
			let arr = this.amiDisplayPreview.stack2.oriRawData[0];
			// var arr3 = this.amiDisplayPreview.stack2.frame[26].pixelData;

			let nrrdHeaderInfo = this.amiDisplayPreview.reconstructNrrdHeader;
			// window.nrrdHeaderInfo = nrrdHeaderInfo;

			let headerArray, entire;
			if (arr.BYTES_PER_ELEMENT === 1) {
				headerArray = this._nrrdHeaderToUint8Array(nrrdHeaderInfo);
				entire = new Uint8Array(headerArray.length + arr.length);
			} else if (arr.BYTES_PER_ELEMENT === 2) {
				headerArray = this._nrrdHeaderToUint16Array(nrrdHeaderInfo);
				entire = new Uint16Array(headerArray.length + arr.length);
			}
			// let headerUint16Array = this._nrrdHeaderToUint16Array(nrrdHeaderInfo);
			// let headerUint8Array = this._nrrdHeaderToUint8Array(nrrdHeaderInfo);

			// let entire = new Uint16Array(headerUint16Array.length + arr.length);
			// let entire = new Uint8Array(headerUint8Array.length + arr.length);

			// entire.set(headerUint16Array);
			// entire.set(arr, headerUint16Array.length);
			entire.set(headerArray);
			entire.set(arr, headerArray.length);

			// var files = document.getElementById('filesTest').files;

			// var blob = new Blob([headerUint16Array.buffer], {type: ''});
			var blob = new Blob([headerArray.buffer], {type: ''});
			// console.log(blob)
			// var arrayBuffer;
			// var fileReader = new FileReader();
			// fileReader.onload = function(event) {
			//     console.log(event.target.result);
			// };
			// fileReader.readAsArrayBuffer(files[0]['slice'](0,600));
			// console.log(file)
			this.targetTestFile.updateContents(entire);
		});
	},
	_nrrdHeaderToUint8Array(headerString) {
		let binaryArr = [];
		let Uint8Arr = [];
		let tmp, tmp8bit;
		for (let i = 0; i < headerString.length; i++) {
			tmp8bit = headerString[i].charCodeAt(0);
			binaryArr.push(parseInt(tmp8bit));
		}
		let significant, octInDecimal;
		for (let j = 0; j < binaryArr.length; j++) {
			significant = parseInt(binaryArr[j]);
			octInDecimal = significant;
			Uint8Arr.push(octInDecimal);
		}
		return Uint8Arr;
	},
	_nrrdHeaderToUint16Array(headerString) {
		let binaryArr = [];
		let Uint16Arr = [];
		let tmp, tmp8bit;
		for (let i = 0; i < headerString.length; i++) {
			tmp8bit = headerString[i].charCodeAt(0);
			binaryArr.push(parseInt(tmp8bit));
		}
		let least_significant, most_significant, hexInDecimal;
		for (let j = 0; j < binaryArr.length; j = j+2) {
			least_significant = parseInt(binaryArr[j]);
			most_significant = parseInt(binaryArr[j + 1]);
			hexInDecimal = ((most_significant & 0xFF) << 8) | (least_significant & 0xFF);
			Uint16Arr.push(hexInDecimal);
		}
		return Uint16Arr;
	},
	_saveAnnotationAlert(annotationId){
		if (confirm('Do you want to save annotation change?')) {
			this.getImageFilesFromItemPromise(annotationId).then((files) => {
				if (files[0].exts[0] === 'nrrd') {
					this._updateFile(files[0]['_id']);
				} else {
					console.error(files[0].exts[0] + ' type annotation is not supported yet');
				}
			});
		} else {
			console.log('Do not save change');
		}
	},
	_changeMode(e) {
		this.mode = e;
	},
	_setCursorSize(e) {
		this.cursorSize = e;
	},
	_setLabelColor(e) {
		this.labelColor = e;
	},
	_collaspeSideBar(e) {
		$(e.target).children()[0].classList.toggle('collapsein'); 
		if ($(e.target).children().hasClass('collapsein')) {
			this.$('.g-ds-nav-container').css('left', 'calc(-40vw + 20px)');
			this.$('.g-ds-nav-container').css('marginLeft', '0vw');
			this.$('.ssrVisualizer').css('width', 'calc(100vw - 20px)');
			this.$('.ssrVisualizer').css('marginLeft', '0');
		} else {
			this.$('.g-ds-nav-container').css('left', '0vw');
			this.$('.g-ds-nav-container').css('marginLeft', '0vw');
			this.$('.ssrVisualizer').css('width', '60vw');
			this.$('.ssrVisualizer').css('marginLeft', '0');
		}
	},
	_addSSRProjectNav(e) {
		this.$el.html(dataSourceTemplate({
			SSR_Project: this.SSR_ProjectCollection,
			user: getCurrentUser()
		}));
	}
})

export default dataSource