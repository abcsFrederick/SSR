import View from 'girder/views/View';
import dataSourceTemplate from '../../templates/dataSource/dataSource.pug'
// import filesystem from '../filesystem/filesystem';
import '../../stylesheets/dataSource/dataSource.styl';
import { restRequest } from 'girder/rest';
import { getCurrentUser } from 'girder/auth';
import CollectionModel from 'girder/models/CollectionModel';
import FolderModel from 'girder/models/FolderModel';
import ItemModel from 'girder/models/ItemModel';
import FileModel from 'girder/models/FileModel';

import UserModel from 'girder/models/UserModel';
import HierarchyWidget from 'girder/views/widgets/HierarchyWidget';
// import SAIPHierarchyBreadcrumbView from 'girder_plugins/SAIP/views/SAIPHierarchyBreadcrumbView';
import SAIPProjectsView from 'girder_plugins/Archive/views/SAIPProjects';
import FolderCollection from 'girder/collections/FolderCollection';
import ItemCollection from 'girder/collections/ItemCollection';
import FileCollection from 'girder/collections/FileCollection';
import events from '../../events';
import AmiViewerSEG from 'girder_plugins/AMI_plugin/views/AMIViewerSEG';
import PreviewTemplate from '../../templates/preview/preview.pug';
import PreviewPrepareTemplate from '../../templates/preview/previewPrepareTemplate.pug';
// import ImageNameWidget from '../../templates/widgets/ImageName.pug';
import router from '../../router';
// import UserView from 'girder/views/body/UserView';
// import UserFoldersWidget from '../widgets/userFoldersWidget';
import UsersView from '../widgets/UsersViewWidget';
import CollectionsView from '../widgets/CollectionsViewWidget';
import SaipView from '../widgets/SaipViewWidget';
import { splitRoute, parseQueryString } from 'girder/misc';

import AnnotationSelector from '../widgets/AnnotationSelectorWidget';
import ImageActions from './imageActions';

var dataSource =  View.extend({
	events:{
    'click .s-nav-siderBar':'_collaspeSideBar',
		'click .ds-Girder':function(e){

      // this.deactivateAll();
      let link = $(e.currentTarget);
      // if(link.parent().hasClass('g-active')){
      //   link.parent().removeClass('g-active');
      // }else{
      //   link.parent().addClass('g-active');
      // }
      // if($(e.target).hasClass('icon-left-dir')){
      //   $('.ds-Girder > .icon-right-dir').show();
      //   $('.ds-Girder > .icon-left-dir').hide();
      //   $('.selectionDom').css('display','none');
      //   link.parent().addClass('g-active');
      // }
      // else if($(e.target).hasClass('icon-right-dir')){
      //   $('.ds-Girder > .icon-left-dir').show();
      //   $('.ds-Girder > .icon-right-dir').hide();
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
        // router.enabled(1);
        // console.log(curRoute);
        router.navigate('view/user/' + link.attr('g-id') + unparsedQueryString, {trigger: true});
        // $('.selectionDom').collapse('toggle');
        
        // if(link.parent().hasClass('g-active')){
        //   link.parent().removeClass('g-active');
        // }else{
          // $('.ds-Girder > .icon-right-dir').hide();
          // $('.ds-Girder > .icon-left-dir').show();
          // link.parent().addClass('g-active');
        // }
        // console.log(link.parent().hasClass('g-active'))
        // if(link.parent().hasClass('g-active')){
        //   $('.selectionDom').css('display','inline-block');
        //   $('.selectionDom').css('height','inherit');
        // }else{
        //   $('.selectionDom').css('display','none');
        // }
      // }
			
      
		},
    'click .ds-Filesystem':function(e){
 
      // this.deactivateAll();
      let link = $(e.currentTarget);
      // if(link.parent().hasClass('g-active')){
      //   link.parent().removeClass('g-active');
      // }else{
      //   link.parent().addClass('g-active');
      // }
      // if($(e.target).hasClass('icon-left-dir')){
      //   $('.ds-Filesystem > .icon-right-dir').show();
      //   $('.ds-Filesystem > .icon-left-dir').hide();
      //   $('.selectionDom').css('display','none');
      //   link.parent().addClass('g-active');
      // }
      // else if($(e.target).hasClass('icon-right-dir')){
      //   $('.ds-Filesystem > .icon-left-dir').show();
      //   $('.ds-Filesystem > .icon-right-dir').hide();
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
        // router.enabled(1);
        // router.navigate('view/collections' + unparsedQueryString, {trigger: true});
        router.navigate('view/collection/' + link.attr('g-id') + unparsedQueryString, {trigger: true});

      //   $('.ds-Filesystem > .icon-left-dir').show();
      //   link.parent().addClass('g-active');
      //   if(link.parent().hasClass('g-active')){
      //     $('.selectionDom').css('display','inline-block');
      //     $('.selectionDom').css('height','inherit');
      //   }else{
      //     $('.selectionDom').css('display','none');
      //   }
      // }
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
        // router.enabled(1);
        router.navigate('view/saip' + unparsedQueryString, {trigger: true});

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
		'click #sidebarCollapse':'dataSourceCollapse',
		'click #preview':'prepareInput',
		// 'click #processingPreview':'previewSelection',
    'click #startView':'startView',
		// 'click #forward':'forward',
		// 'click #backward':'backward',
		'click .cancel':'closePreviewModal',
		'click .close':'closePreviewModal'
	},
	initialize(setting){
		this.init=true;
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

		this.totalSeriesPath=[];
		this.totalSeriesId=[];
		this.totalSeriesIdentity=[];

		this.totalSeriesPathInit=[];
		this.totalSeriesIdInit=[];
		this.totalSeriesIdentityInit=[];
    // this.controlPanel = setting.controlPanel;
    this.SSR_ProjectCollection = setting.SSR_ProjectCollection
		this.currentUser = setting.currentUser;
		this.itemsCollection = new ItemCollection();
		this.filesCollection = new FileCollection();

    // console.log(getCurrentUser())
    this.$el.html(dataSourceTemplate({
      SSR_Project:this.SSR_ProjectCollection,
      user:getCurrentUser()
    }))
		
		this.SAIPHierarchyBreadcrumbObjects=[{'object':{'name':'SAIP'},'type':'SAIP'}];
		
		// this.listenTo(events,'preview:selectionWindow',this.selectionWindow);
		// this.listenTo(events,'ssr:chooseFolderItem',this.findPath)
		// this.listenTo(events,'query:PreviewFile', this.PreviewFile);
		// this.listenTo(events,'query:PreviewFileAndSEG', this.PreviewFile);

    this.listenTo(this.SSR_ProjectCollection, "change", this._addSSRProjectNav);
    this.listenTo(events, 'query:mode', this.changeMode);
		this.listenTo(events, 'preview:forward', this.forward);
		this.listenTo(events, 'preview:backward', this.backward);
		this.listenTo(events, 'preview:imageSelected', this.selectRandom);

		this.listenTo(events, 'ds:selectUsers', this.selectUsers);
    this.listenTo(events, 'ds:selectCollections', this.selectCollections);

    this.listenTo(events, 'ds:selectSAIP', this.selectSAIP);
    /*Set visualized item's parent folder (not workspace folder)*/
    this.listenTo(events, 'query:filesystemFolder', this.filesystemFolder);
    // console.log('registor ds:navigateTo')
		events.on('ds:navigateTo', this.navigateTo, this);
    events.on('ds:highlightItem', this.selectForView, this);
    
    this.listenTo(events, 'query:PreviewFileItem', this.PreviewFileItem);
    this.listenTo(events, 'query:editSegmentationFolderId', this.editSegmentationFolderId);
    this.listenTo(events, 'query:cursorSize', this.setCursorSize);
    this.listenTo(events, 'query:labelColor', this.setLabelColor);

    this.listenTo(events, 'ami:overlaySelectedAnnotation', this.overlaySelectedAnnotation);
    this.listenTo(events, 'ami:removeSelectedAnnotation', this.removeSelectedAnnotation);
    this.listenTo(events, 'ds:saveAnnotationAlert', this.saveAnnotationAlert);

	},
	navigateTo: function (view, settings, opts) {
      // router.enabled(1);

      settings = settings || {};
      opts = opts || {};

      if (view) {
        if(settings.viewName=='dsUsersView')
        { 

          if (this.dsUserView) {
              this.dsUserView.destroy();
          }
          if (this.dsCollectionsView) {
              this.dsCollectionsView.destroy();
              this.dsCollectionsView = null;
          }
          this.fromFilesystem = true;
          this.fromSaipArchive = false;
          settings = _.extend(settings, {
              parentView: this,
              brandName: this.brandName,
              baseRoute:'view/user'
          });

          /* We let the view be created in this way even though it is
           * normally against convention.
           */
          this.dsUserView = new view(settings); // eslint-disable-line new-cap

          if (opts.renderNow) {
              this.dsUserView.render();
          }
          $('#SAIPArch').collapse('hide');
          $('#SSRArch').collapse('hide');
          $('#USERArch').collapse('show');
        }
        if(settings.viewName=='dsSSRProjectView')
        {
          if (this.dsCollectionsView) {
              this.dsCollectionsView.destroy();
          }
          if (this.dsUserView) {
              this.dsUserView.destroy();
              this.dsUserView = null;
          }
          this.fromFilesystem = true;
          this.fromSaipArchive = false;
          settings = _.extend(settings, {
              parentView: this,
              brandName: this.brandName,
              baseRoute:'view/collection'
          });

          /* We let the view be created in this way even though it is
           * normally against convention.
           */
          this.dsCollectionsView = new view(settings); // eslint-disable-line new-cap

          if (opts.renderNow) {
              this.dsCollectionsView.render();
          }
          $('#SAIPArch').collapse('hide');
          $('#SSRArch').collapse('show');
          $('#USERArch').collapse('hide');
        }

        if(settings.viewName=='dsSAIPProjectView')
        {
          if (this.dsSaipView) {
              this.dsSaipView.destroy();
          }

          this.fromFilesystem = false;
          this.fromSaipArchive = true;
          settings = _.extend(settings, {
            parentView:this,
            currentUser:this.currentUser
          });

          /* We let the view be created in this way even though it is
           * normally against convention.
           */
          this.dsSaipView = new view(settings); // eslint-disable-line new-cap

          // if (opts.renderNow) {
          //     this.dsSaipView.render();
          // }
          $('#SAIPArch').collapse('show');
          $('#SSRArch').collapse('hide');
          $('#USERArch').collapse('hide');
        }
        this.selectForView(settings.viewName)
        // console.log(settings.viewName)
      } else {
          console.error('Undefined page.');
      }
      return this;
  },
  // selectSAIP(params){

  //   this.fromFilesystem = false;
  //   this.fromSaipArchive = true;
  //   if(params.el =='.selectionDom')
  //   {
  //     params = _.extend(params,{
  //       parentView:this,
  //       currentUser:this.currentUser
  //     })
  //     if (this.dsSaipView) {
  //       this.dsSaipView.destroy();
  //     }
  //     this.dsSaipView = new SaipView(params);

  //     // this.dsSaipView.render()
  //   }
  // },
  // selectCollections(params){
  //   this.fromFilesystem = true;
  //   this.fromSaipArchive = false;
  //   if(params.el =='.selectionDom')
  //   {
  //     params = _.extend(params,{
  //       parentView:this,
  //       currentUser:this.currentUser
  //     })
  //     if (this.dsCollectionsView) {
  //       this.dsCollectionsView.destroy();
  //     }
  //     this.dsCollectionsView = new CollectionsView(params);

  //     this.dsCollectionsView.render()
  //   }
  // },
  // selectUsers(params){

  //   this.fromFilesystem = true;
  //   this.fromSaipArchive = false;
  //   if(params.el == '.selectionDom')
  //   {
  //     params = _.extend(params,{
  //       parentView:this,
  //       currentUser:this.currentUser
  //     })
  //     if (this.dsUsersView) {
  //       this.dsUsersView.destroy();
  //     }
  //     this.dsUsersView = new UsersView(params);

  //     this.dsUsersView.render()
  //   }
  // },
	// selectionWindow(e){
	// 	console.log('selectionWindow')
	// 	console.log(e)
	// },
  overlaySelectedAnnotation(annotationItemId){
    console.log('overlaySelectedAnnotation: ' + annotationItemId);
    this.getImageFilesFromItemPromise(annotationItemId).then((files)=>{
      if(files[0].exts[0]==='nrrd'){
        let referenceAnnotation_url ='api/v1/file/'+files[0]['_id']+'/download?contentDisposition=attachment&contentType=application%2Fnrrd';
        this.amiDisplayPreview.drawAnnotation(referenceAnnotation_url, false , true, annotationItemId);
      }else{
        let referenceAnnotation_url = _.map(files,function(eachFile){
             return 'api/v1/file/'+eachFile['_id']+'/download?contentDisposition=attachment';
        });
      }
    });
  },
  removeSelectedAnnotation(annotationItemId){
    // console.log('removeSelectedAnnotation: ' + annotationItemId);
    this.getImageFilesFromItemPromise(annotationItemId).then((files)=>{
      if(files[0].exts[0]==='nrrd'){
        let referenceAnnotation_url ='api/v1/file/'+files[0]['_id']+'/download?contentDisposition=attachment&contentType=application%2Fnrrd';
        this.amiDisplayPreview.removeAnnotation(referenceAnnotation_url, annotationItemId);
      }else{
        let referenceAnnotation_url = _.map(files,function(eachFile){
             return 'api/v1/file/'+eachFile['_id']+'/download?contentDisposition=attachment';
        });
      }
    });
  },
	PreviewFileItem(e){
    let curRoute = Backbone.history.fragment,
    nav = splitRoute(curRoute).base.split('/')[0];
		// if(router.getQuery('step') === 'dataSource'){
  //     console.log('true');
  //   }else{
  //     console.log('false');
  //   }
    // console.log('412');
    // console.log(router.flag)
    if(nav === 'view'){
    // if(router.flag || parseQueryString(splitRoute(Backbone.history.fragment).name)['step'] === 'View'){
      this.currentImageId = e;
      if(this._openId !== this.currentImageId || this._mode !== this.mode){
        this._mode = this.mode;
  			this._openId=this.currentImageId;
  	  	this.getImageFilesFromItemPromise(e).then((files)=>{
  	  		// console.log('oriFile id ')
  	  		// console.log(files[0]['_id'])
  	  		let displayUrl;
  	      // console.log(files[0].exts[0])
  	      if(files[0].exts[0]==='nrrd'){
  	          displayUrl ='api/v1/file/'+files[0]['_id']+'/download?contentDisposition=attachment&contentType=application%2Fnrrd';
  	      }else{
  	          displayUrl = _.map(files,function(eachFile){
  	               return 'api/v1/file/'+eachFile['_id']+'/download?contentDisposition=attachment';
  	      	});
  	      }
  	      // $('#PreviewSelection').hide();
  					if (this.amiDisplayPreview) {
  	          this.init=false;
              console.log(this.amiDisplayPreview.annotationNeedsUpdate);
              if(this.amiDisplayPreview.annotationNeedsUpdate){
                this.saveAnnotationAlert(this.amiDisplayPreview.currentAnnotationItemId);
              }
  	        }else{
  	          this.amiDisplayPreview = new AmiViewerSEG({
  	              el:'.ssrVisualizer',
  	              parentView:this
  	          });
  	        }
  					this.amiDisplayPreview.render(this.init, displayUrl);
  					this.amiDisplayPreview.once('g:imageRendered', () => {
  						restRequest({
  			        url: 'SSR/segmentationCheck/' + this.currentImageId,
  			      }).then(_.bind((items) => {
  			      	// console.log(items.length);
                
  			      	if(typeof(items) !== 'string'){

                  let SegItem, SegItemModel;
                  if(this.mode === 'view' || 'undefined'){
                    SegItem = items[items.length-1];
                    SegItemModel = new ItemModel(SegItem);
                  }
  			      		if(this.mode === 'edit'){

                    SegItem = items.filter((x) => { if(x.folderId === this.editSegmentationFolderId){return this}});
                    SegItemModel = new ItemModel(SegItem[0]);
                  }

  				      	this.getImageFilesFromItemPromise(SegItemModel.get('_id')).then((files)=>{
  				      		// console.log('segFile id ')
  				      		// console.log(files[0]['_id'])
  				      		if(files[0].exts[0]==='nrrd'){
  					          let referenceAnnotation_url ='api/v1/file/'+files[0]['_id']+'/download?contentDisposition=attachment&contentType=application%2Fnrrd';
  					          if(this.mode === 'edit'){
                        console.log(this.labelColor, this.cursorSize)
                        this.amiDisplayPreview.drawAnnotation(referenceAnnotation_url, true, true, SegItemModel.get('_id'), this.mode, this.labelColor, this.cursorSize);
                        this.amiDisplayPreview.currentAnnotationItemId = SegItemModel.get('_id');
                      }
                      if(this.mode === 'view' || 'undefined'){
                        this.amiDisplayPreview.drawAnnotation(referenceAnnotation_url, true, true, SegItemModel.get('_id'), this.mode, this.labelColor, this.cursorSize);
                      }
  						      }else{
  					          let referenceAnnotation_url = _.map(files,function(eachFile){
  					               return 'api/v1/file/'+eachFile['_id']+'/download?contentDisposition=attachment';
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
                  // console.log(this.amiDisplayPreview.edit);
                  this.amiDisplayPreview.annotationSelector(items, this.mode, this.editSegmentationFolderId, this.labelColor, this.cursorSize);
                  // console.log('507');
                  // console.log(this.amiDisplayPreview.edit);

  			      	}
  			      },this))
  					});
  	  	});
  	  }
    }
	},
  editSegmentationFolderId(editSegmentationFolderId){
    // console.log('editSegmentationFolderId:')
    // console.log(editSegmentationFolderId)
    this.editSegmentationFolderId = editSegmentationFolderId;
  },
	getImageFilesFromItemPromise(e){
		return new Promise(_.bind(function(resolve,reject){
			restRequest({
        url: 'item/' + e + '/files?limit=1000',
      }).then((files) => {    //files object
      	resolve(files)
      })
		},this))
	},
	// PreviewFile(e){
	// 	// e ORI item id
	// 	console.log('trigger PreviewFile');
	// 	if(e.indexOf('@')!==-1)
	// 	{
	// 		this.currentImageId = e.slice(0,e.indexOf('@'));
	// 		this.SEGid = e.slice(e.indexOf('@')+1);
	// 	}else{
	// 		this.currentImageId = e
	// 	}

	// 	if(this._openId!==this.currentImageId){
	// 		this._openId=this.currentImageId;
	// 		restRequest({
 //        url: 'item/' + this.currentImageId + '/files?limit=1000',
 //      }).then((files) => {    //files object
 //        if (!files.length) {
 //            throw new Error('Item does not contain a file.');
 //        }
 //        var displayUrl;
 //        console.log(files[0].exts[0])
 //        if(files[0].exts[0]==='nrrd'){
 //            displayUrl ='api/v1/file/'+files[0]['_id']+'/download?contentDisposition=attachment&contentType=application%2Fnrrd';
 //        }else{
 //            displayUrl = _.map(files,function(eachFile){
 //                 return 'api/v1/file/'+eachFile['_id']+'/download?contentDisposition=attachment';
 //            });
 //        }
 //        $('#PreviewSelection').hide();
	// 			if (this.amiDisplayPreview) {
 //          this.init=false;
 //        }else{
 //          this.amiDisplayPreview = new AmiViewerSEG({
 //              el:'.visualizer',
 //              parentView:this
 //          });
 //        }
	// 			this.amiDisplayPreview.render(this.init,displayUrl);
	// 			this.amiDisplayPreview.once('g:imageRendered', () => {
	// 				if(this.SEGid){
	// 					let referenceAnnotation_url='api/v1/file/'+this.SEGid+'/download?contentDisposition=attachment&contentType=application%2Fnrrd';
	// 					this.amiDisplayPreview.drawAnnotation(referenceAnnotation_url, true, true);
	// 				}
	// 			});
 //    	});
	// 	}
	// },
	render(){
		return this;
	},
	dataSourceCollapse(){
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
    preview is click
  */
	prepareInput(){
		// if(this.totalSeriesId.length){
		// 	this.fromFilesystem = false;
		// 	this.fromSaipArchive = true;
		// }else{
		// 	this.fromFilesystem = true;
		// 	this.fromSaipArchive = false;
		// }
    // console.log('prepareInput')
		let folderModels=[];
		let itemModels=[];
		this.allSEGId=[];
		this.allImageId=[];
		/*Two methods for selection*/

    this.itemsCollection = new ItemCollection();
		if(this.fromFilesystem){

			$('#PreviewSelection .modal-body').html(PreviewPrepareTemplate())
			$('#PreviewSelection').show();

      /*
        White Go is click
      */
			$('#startPrepare').on('click',_.bind(function(){
				restRequest({
						method:'POST',
						url:'/SSR/folder/',
						data:{'name':$('#userDefinedProjectName').val()}
					}).then(_.bind((newFolder)=>{
						let taskFolder = new FolderModel(newFolder);
            /*folders should be limited as only one*/
            this.oriCurrentView = this.dsUserView||this.dsCollectionsView;
						let folders = this.oriCurrentView.hierarchyWidget.folderListView.checked;
			      this.itemListsFromFolder=[];
			      for(let a=0;a<folders.length;a++){

			          let folderModel = this.oriCurrentView.hierarchyWidget.folderListView.collection.get(this.oriCurrentView.hierarchyWidget.folderListView.checked[a]);
			          restRequest({
									method:'GET',
									url:'/item',
									data:{'folderId':folderModel.get('_id')}
								}).then(_.bind((items)=>{
									this.itemListsFromFolder = this.itemListsFromFolder.concat(items);
									this.itemsCollection.set(this.itemListsFromFolder);
                  // console.log(folderModel.get('_id'))
                  // router.enabled(1);
                  router.setQuery('filesystemFolder', folderModel.get('_id'), {trigger: true});
                  // this.controlPanel.currentViewItemId = this.itemsCollection.models[0].get('_id');

                  /*workSpaceFolder should receive `input images' parent folder id` here*/
                  // router.setQuery('workSpaceFolder', folderModel.get('_id'), {trigger: true})
								},this))
			      }

            /*workSpaceFolder should receive input `workspace folder id` here*/
            router.setQuery('setupOutputFolder', taskFolder.get('_id'), {replace: true})
					},this))
			},this))
		}
		else if(this.fromSaipArchive){
			// this.folderCollection = new FolderCollection();
			$('#PreviewSelection .modal-body').html(PreviewPrepareTemplate())
			$('#PreviewSelection').show();
			// console.log(this.totalSeriesId)
			// $('#startPrepare').on('click',_.bind(function(){
			// 	restRequest({
			// 		url:'/SSR/prepareInputs/',
			// 		data:{'OriImageArr':JSON.stringify(this.totalSeriesId),'name':$('#userDefinedProjectName').val()}
			// 	}).then((newFolders)=>{
			// 		let originalFolderUnderTask = new FolderModel(newFolders.originalFolderUnderTask);
			// 		let newTaskFolder = new FolderModel(newFolders.newTaskFolder)
			// 		this.folderCollection.set(originalFolderUnderTask);
			// 		$('.stepTwoField').html(PreviewTemplate({
			// 			folders:this.folderCollection.models
			// 		}));
			// 		events.trigger('ds:setupOutputFolder',newTaskFolder,{trigger: true})
			// 	})
			// },this));
      $('#startPrepare').on('click',_.bind(function(){
        restRequest({
          method:'POST',
          url:'/SSR/folder/',
          data:{'name':$('#userDefinedProjectName').val()}
        }).then(_.bind((newFolder)=>{
          let taskFolder = new FolderModel(newFolder);
          let studyId = this.dsSaipView.saipProjectsView.saipExperimentsView.saipPatientsView.saipStudiesView.selectecStudyId;
          this.itemListsFromFolder=[];
          restRequest({
            method:'GET',
            url:'SAIP/' + studyId + '/SAIPExistingValidation'
          }).then(_.bind((res)=>{
            let folderModel = new FolderModel(res);
            
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
            },this))
          },this))
            /*workSpaceFolder should receive input `workspace folder id` here*/
            router.setQuery('setupOutputFolder',taskFolder.get('_id'),{trigger: true})
        },this));
      },this));
		}

	},
	setFolderCollection(itemsCollection){

		//this.allImageId=[];
		
		$('#PreviewSelection .modal-body').html(PreviewTemplate({
			folders:this.folderCollection.models,
			items:this.itemCollection.models
		}))
 		if(itemsCollection.models.length){
 			for(let a=0;a<itemsCollection.models.length;a++){
	 			this.allImageId.push(itemsCollection.models[a].id)
	 		}
 		}
	 	
	},
	setItemCollection(filesCollection){
		if(filesCollection.models.length){
 			for(let a=0;a<filesCollection.models.length;a++){
	 			this.allSEGId.push(filesCollection.models[a].id)
	 		}
 		}
	},
  /*
    Green GO is click
  */
	previewSelection(){

    // console.log(this.itemsCollection.models);
		if(this.fromFilesystem){
			// router.enabled(1);

			router.setQuery('PreviewFileItem',this.itemsCollection.models[0].get('_id'), {trigger: true});

		}
    else if(this.fromSaipArchive){
      // router.enabled(1);

      router.setQuery('PreviewFileItem',this.itemsCollection.models[0].get('_id'), {trigger: true});
   //  	$('.image_name').html(ImageNameWidget({
   //    	allImagesName:this.totalSeriesIdentity,
   //    	currentImage:this.totalSeriesIdentity[0],
   //    	SeriesId:this.totalSeriesId,
   //    	fromFileSystem:this.fromFileSystem,
   //    	fromSaipArchive:this.fromSaipArchive
   //    }))
   //  	//Only ORI
   //  	console.log(this.totalSeriesId);
   //  	console.log(this.allSEGId);
			// if(this.totalSeriesId&&!this.allSEGId.length){
			// 	this.currentImageId = this.totalSeriesId[0];

			// 	router.setQuery('PreviewFile',this.totalSeriesId[0], {trigger: true});
			// 	// Only support single folder batch processing for now
			// 	router.setQuery('PreviewFolder',this.folderCollection.models[0].id, {trigger: true});
			// }
			//ORI with SEG
    }
		
		this.selectorSelection();
	},
  /*
    Green View is click
  */
  startView(){
    // console.log('873');
    this.itemsCollection = new ItemCollection();
    if(this.fromFilesystem){
      /*folders should be limited as only one*/
      this.oriCurrentView = this.dsUserView||this.dsCollectionsView;
      let folders = this.oriCurrentView.hierarchyWidget.folderListView.checked;
      this.itemListsFromFolder=[];
      for(let a=0;a<folders.length;a++){

          let folderModel = this.oriCurrentView.hierarchyWidget.folderListView.collection.get(this.oriCurrentView.hierarchyWidget.folderListView.checked[a]);
          this.currentViewFolder = folderModel;
          restRequest({
            method:'GET',
            url:'/item',
            data:{'folderId':folderModel.get('_id')}
          }).then(_.bind((items)=>{
            this.itemListsFromFolder = this.itemListsFromFolder.concat(items);
            this.itemsCollection.set(this.itemListsFromFolder);
            // console.log(folderModel.get('_id'))
            // router.enabled(1);
            router.setQuery('mode','view');
            router.setQuery('filesystemFolder', folderModel.get('_id'));
            // this.controlPanel.currentViewItemId = this.itemsCollection.models[0].get('_id');
            router.setQuery('PreviewFileItem',this.itemsCollection.models[0].get('_id'), {trigger: true, replace: true});
            
            this.mode = 'view';
            /*workSpaceFolder should receive `input images' parent folder id` here*/
            // router.setQuery('workSpaceFolder', folderModel.get('_id'), {trigger: true})
          },this))
      }
      
    }
    else if(this.fromSaipArchive){
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
        },this))
      },this))
    }
    else{
      events.trigger('g:alert', {
          type: 'warning',
          text: 'Please select a dataset to visualize',
          icon: 'info',
          timeout: 5000
      });
      return;
    }
    this.selectorSelection();
  },

  filesystemFolder(sourceFolderId){
    // console.log('filesystemFolder');
    // console.log(sourceFolderId);
    this.itemListsFromFolder = [];
    this.itemsCollectionIds = [];
    this.sourceFolderId = sourceFolderId;
    // this.fromFilesystem = true;
    // this.fromSaipArchive = false;
    restRequest({
      method:'GET',
      url:'/item',
      data:{'folderId': this.sourceFolderId}
    }).then(_.bind((items)=>{
      this.itemListsFromFolder = this.itemListsFromFolder.concat(items);
      this.itemsCollection.set(this.itemListsFromFolder);

      // window.itemsCollection = this.itemsCollection;
      // window.currentImageId = this.currentImageId;
      this.currentImage = this.itemsCollection.get(this.currentImageId);
      if(!this.currentImage){
        this.currentImage = this.itemsCollection.models[0];
      }

      for(let a = 0; a < this.itemsCollection.models.length; a++)
      {
        // window.js = this.itemsCollection.models[a]
        // console.log(this.itemsCollection.models[a])
        this.itemsCollectionIds.push(this.itemsCollection.models[a].get('_id')) 
      }
      this.currentImageId = this.currentImage.get('_id');
      this.selectorSelection();

    },this));
  },
  selectorSelection(){
    $('#forward').on('click',function(){

      events.trigger('preview:forward',null)
    });
    $('#backward').on('click',function(){
      events.trigger('preview:backward',null)
    });
    $('.imageSelected').on('click',function(e){
      events.trigger('preview:imageSelected',e)
    });
  },
	// forward(){
		
	// 	// if(this.fromFilesystem){
 //      console.log(this.currentImageId);
	// 		let nextImageId;
	// 		let nextImageIndex = this.itemsCollectionIds.indexOf(this.currentImageId)+1;
	// 		if(nextImageIndex === this.itemsCollectionIds.length){
	// 			nextImageIndex = 0;
	// 			nextImageId = this.itemsCollectionIds[nextImageIndex];
	// 		}
	// 		else{
	// 			nextImageId = this.itemsCollectionIds[nextImageIndex];
	// 		}
	// 		this.currentImageId = nextImageId;
	// 		// $('.preview-allImages-dropdown-link').html(this.itemsCollection.models[nextImageIndex].get('name'));
	// 		router.setQuery('PreviewFileItem',this.currentImageId, {trigger: true});
	// 	// }else if(this.fromSaipArchive){
	// 	// 	//Only ORI
	// 	// 	if(this.totalSeriesId.length&&!this.allSEGId.length){
	// 	// 		let nextImageId;
	// 	// 		let nextImageIndex=this.totalSeriesId.indexOf(this.currentImageId)+1;
	// 	// 		if(nextImageIndex===this.totalSeriesId.length){
	// 	// 			nextImageIndex = 0;
	// 	// 			nextImageId = this.totalSeriesId[nextImageIndex];
	// 	// 		}
	// 	// 		else{
	// 	// 			nextImageId = this.totalSeriesId[nextImageIndex];
	// 	// 		}
	// 	// 		this.currentImageId = nextImageId;
	// 	// 		console.log(this.currentImageId);
	// 	// 		// $('.preview-allImages-dropdown-link').html(this.totalSeriesIdentity[nextImageIndex]);
	// 	// 		router.setQuery('PreviewFile',this.currentImageId, {trigger: true});
	// 	// 	}
	// 	// }
	// },
	// backward(){
	// 	// if(this.fromFilesystem)
	// 	// {	
	// 		let nextImageId;
	// 		let nextImageIndex = this.itemsCollectionIds.indexOf(this.currentImageId) - 1;
	// 		if(nextImageIndex < 0){
	// 			nextImageIndex = this.itemsCollectionIds.length - 1;
	// 			nextImageId = this.itemsCollectionIds[nextImageIndex];
	// 		}
	// 		else{
	// 			nextImageId = this.itemsCollectionIds[nextImageIndex];
	// 		}
	// 		this.currentImageId = nextImageId;
	// 		// $('.preview-allImages-dropdown-link').html(this.itemsCollection.models[nextImageIndex].get('name'));
	// 		router.setQuery('PreviewFileItem',this.currentImageId, {trigger: true});

	// 		// }
	// 	// }else if(this.fromSaipArchive){
	// 	// 	//Only ORI
	// 	// 	if(this.totalSeriesId.length&&!this.allSEGId.length){
	// 	// 		let nextImageId;
	// 	// 		let nextImageIndex=this.totalSeriesId.indexOf(this.currentImageId)-1;
	// 	// 		if(nextImageIndex<0){
	// 	// 			nextImageIndex = this.totalSeriesId.length - 1;
	// 	// 			nextImageId = this.totalSeriesId[nextImageIndex];
	// 	// 		}
	// 	// 		else{
	// 	// 			nextImageId = this.totalSeriesId[nextImageIndex];
	// 	// 		}
	// 	// 		this.currentImageId = nextImageId;
	// 	// 		// $('.preview-allImages-dropdown-link').html(this.totalSeriesIdentity[nextImageIndex]);
	// 	// 		router.setQuery('PreviewFile',this.currentImageId, {trigger: true});
	// 	// 	}
	// 	// }
	// },
	// /*
	// 	User select particular image as they wish from preloaded dataset for viewing
	// */
	// selectRandom(e){
	// 	// if(this.fromFilesystem){
	// 		this.currentImageId = e.currentTarget.id
	// 		// $('.preview-allImages-dropdown-link').html(e.currentTarget.textContent);
	// 		router.setQuery('PreviewFileItem',this.currentImageId, {trigger: true});

	// 	// }
	// 	// else if(this.fromSaipArchive){
	// 	// 	//Only ORI
	// 	// 	if(this.totalSeriesId.length&&!this.allSEGId.length){
	// 	// 		this.currentImageId = e.currentTarget.id
	// 	// 		// $('.preview-allImages-dropdown-link').html(e.currentTarget.textContent);
	// 	// 		router.setQuery('PreviewFile',this.currentImageId, {trigger: true});
	// 	// 	}
	// 	// }
	// },
	closePreviewModal(){
		$('#PreviewSelection').hide();
	},
	autoParseOriAndSEG(selectFolderModel){


		// auto find 
		// Segmentation item under selected folder

		// Three possible conditions 
		// + Case I:
		// +	One subfolder and one item ---> original + segmentation

		// + Case II:
		// + Cannot be only One folder ( if thas folder there must be an item in the same level
		// + and cannot be 2 or more folders restricted from upload)

		// + Case III:
		// + Only One item ( Could not be 2 or more items restricted from upload)
		// + item will be treated as original

		// + Case IV:
		// + Only multiple items
		// + items will be treated as originals
		/*
			First calucate number of subfolders and items to determine cases
		*/
		let getNumberOfItems = () => {
			return restRequest({
				url:'/item?folderId='+selectFolderModel.id//item.id
			}).then((segImageitems)=>{
				return segImageitems;
			})
		}

		let getNumberOfFolders = () => {
			return restRequest({
				url:'/folder',
				data:{'parentType':'folder','parentId':selectFolderModel.id}
			}).then((subfolders)=>{
				return subfolders;
			})
		}
		/*
			First calucate all seg and ori just for preparing, order not in consider
		*/
		let getFilesUnderTask = (Items, Subfolders)=>{
			/*
				Auto find item which contents segmentation
			*/
			// console.log(Items, Subfolders);

			// Case I
			if (Items.length === 1 && Subfolders.length === 1){
				this.itemCollection = new ItemCollection();
				this.itemCollection.models=[]
				this.itemCollection.set(Items)
 
				restRequest({
					url:'/item/'+Items[0]['_id']+'/files',
					data:{'sort':'name'}
				}).then((files)=>{
					// this.filesCollection.set(files)
					// console.log(selectFolderModel)
					// this.setItemCollection(this.filesCollection)
					if(files.length){
			 			for(let a=0;a<files.length;a++){
				 			this.allSEGId.push(files[a]['_id'])
				 		}
			 		}
				})
			}
			// Case III / VI
			else if(Items.length >= 1 && Subfolders.length === 0){
	 			console.log('getFilesUnderTask do nothing because all items are treated as original');
			}
			// console.log(this.allSEGId);
			// return restRequest({
			// 	url:'/item?folderId='+selectFolderModel.id//item.id
			// }).then((segImageitems)=>{
			// 	this.itemCollection = new ItemCollection();
			// 	this.itemCollection.models=[]
			// 	this.itemCollection.set(segImageitems)
			// 	/*
			// 		Should only have one single item for all segmentations' file
			// 	*/
			// 	if(segImageitems.length<=1){
			// 		restRequest({
			// 			url:'/item/'+segImageitems[0]['_id']+'/files',
			// 			data:{'sort':'name'}
			// 		}).then((files)=>{
			// 			// this.filesCollection.set(files)
			// 			console.log(selectFolderModel)
			// 			// this.setItemCollection(this.filesCollection)
			// 			if(files.length){
			// 	 			for(let a=0;a<files.length;a++){
			// 		 			this.allSEGId.push(files[a]['_id'])
			// 		 		}
			// 	 		}
			// 		})
			// 	}
				/*
					Should response something to force user modify 
				*/
			// })
		}
		// Auto find 
		// Original image item under selected folder/original image folder
		let getItemsUnderTask = (Items, Subfolders)=>{
			/*
				Auto find folder which contents original item(file) 
			*/

			// Case I
			if (Items.length === 1 && Subfolders.length === 1){
				let folderUnderTask = new FolderModel(Subfolders[0]);
				this.folderCollection.set(folderUnderTask)
				restRequest({
					url:'/item?folderId='+Subfolders[0]['_id'],//item.id
					data:{'sort':'name'}
				}).then((oriImageItems)=>{
					if(oriImageItems.length){
			 			for(let a=0;a<oriImageItems.length;a++){
				 			this.allImageId.push(oriImageItems[a]['_id'])
				 		}
			 		}
				})
			}
			// Case III / VI
			else if(Items.length >= 1 && Subfolders.length === 0){
	 			for(let a=0;a<Items.length;a++){
		 			this.allImageId.push(Items[a]['_id'])
		 		}
			}
			// console.log(this.allSEGId);
			// return restRequest({
			// 	url:'/folder',
			// 	data:{'parentType':'folder','parentId':selectFolderModel.id}
			// }).then((subfolders)=>{
			// 	/*
			// 		Should only have one single folder for all originals' file
			// 	*/
			// 	if(subfolders.length<=1){
			// 		let folderUnderTask = new FolderModel(subfolders[0]);
			// 		this.folderCollection.set(folderUnderTask)
			// 		restRequest({
			// 			url:'/item?folderId='+subfolders[0]['_id'],//item.id
			// 			data:{'sort':'name'}
			// 		}).then((oriImageItems)=>{
			// 			if(oriImageItems.length){
			// 	 			for(let a=0;a<oriImageItems.length;a++){
			// 		 			this.allImageId.push(oriImageItems[a]['_id'])
			// 		 		}
			// 	 		}
			// 		})
			// 	}
			// 	/*	
			// 		Should response something to force user modify 
			// 	*/
			// })
			// console.log(Items, Subfolders);
		}
		let promise;
  	return promise = $.when(getNumberOfItems(),getNumberOfFolders()).then((Items, Subfolders)=>{
			$.when(getItemsUnderTask(Items, Subfolders),getFilesUnderTask(Items, Subfolders)).then(()=>{
				return null
			})
		})
	},
  selectForView: function (viewName) {

    this.deactivateAll(viewName);

    if(viewName == 'dsUsersView')
    {
      // console.log(this.$('.g-ds-nav-container [g-name='+viewName.slice(0,-4)+']'))
      this.$('.g-ds-nav-container [g-name='+viewName.slice(0,-4)+']').parent().addClass('g-active');
      // $('.ds-Girder > .icon-left-dir').show();
    }
    if(viewName == 'dsSSRProjectView')
    {
      this.$('.g-ds-nav-container [g-name='+viewName.slice(0,-4)+']').parent().addClass('g-active');
      // $('.ds-Filesystem > .icon-left-dir').show();
    }
    if(viewName == 'dsSAIPProjectView')
    {
      this.$('.g-ds-nav-container [g-name='+viewName.slice(0,-4)+']').parent().addClass('g-active');
      // $('.ds-SAIP > .icon-left-dir').show();
    }
  },
  deactivateAll(){
    // this.$('.icon-left-dir').hide();
    // this.$('.icon-right-dir').hide();
    this.$('.g-global-nav-li').removeClass('g-active');
  },
  updateFile(targetFileId){
    restRequest({
      method:'GET',
      url:'file/'+targetFileId
    }).then((file)=>{
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
      if(arr.BYTES_PER_ELEMENT === 1){
        headerArray = this.nrrdHeaderToUint8Array(nrrdHeaderInfo);
        entire = new Uint8Array(headerArray.length + arr.length);
      }else if(arr.BYTES_PER_ELEMENT === 2){
        headerArray = this.nrrdHeaderToUint16Array(nrrdHeaderInfo);
        entire = new Uint16Array(headerArray.length + arr.length);
      }
      // let headerUint16Array = this.nrrdHeaderToUint16Array(nrrdHeaderInfo);
      // let headerUint8Array = this.nrrdHeaderToUint8Array(nrrdHeaderInfo);
      
      // let entire = new Uint16Array(headerUint16Array.length + arr.length);
      // let entire = new Uint8Array(headerUint8Array.length + arr.length);

      // entire.set(headerUint16Array);
      // entire.set(arr, headerUint16Array.length);
      entire.set(headerArray);
      entire.set(arr, headerArray.length);

      // var files = document.getElementById('filesTest').files;
      // window.arr = arr;
      // window.arr2 = arr2;
      // window.arr3 = arr3;
      // window.files = files;
      // window.headerUint16Array = new Uint16Array(headerUint16Array);

      // console.log(arr);
      // console.log(arr2);
      // console.log(arr3);
      // console.log(entire);
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
      this.targetTestFile.updateContents(entire)
    })
  },
  nrrdHeaderToUint8Array(headerString){
    let binaryArr = [];
    let Uint8Arr = [];
    let tmp, tmp8bit;
    for (let i=0; i < headerString.length; i++) {
      tmp8bit = headerString[i].charCodeAt(0)
      binaryArr.push(parseInt(tmp8bit));
    }
    // console.log(binaryArr);
    // window.binaryArr = binaryArr;
    let significant, octInDecimal;
    for (let j=0; j < binaryArr.length; j++) {
      significant = parseInt(binaryArr[j]);
      octInDecimal = significant;
      Uint8Arr.push(octInDecimal)
    }
    return Uint8Arr;
  },
  nrrdHeaderToUint16Array(headerString){
    let binaryArr = [];
    let Uint16Arr = [];
    let tmp, tmp8bit;
    for (let i=0; i < headerString.length; i++) {
      tmp8bit = headerString[i].charCodeAt(0)
      binaryArr.push(parseInt(tmp8bit));
    }
    // console.log(binaryArr);
    // window.binaryArr = binaryArr;
    let least_significant, most_significant, hexInDecimal;
    for (let j=0; j < binaryArr.length; j=j+2) {
      least_significant = parseInt(binaryArr[j]);
      most_significant = parseInt(binaryArr[j+1]);
      hexInDecimal = ((most_significant & 0xFF) << 8) | (least_significant & 0xFF);
      Uint16Arr.push(hexInDecimal)
    }
    return Uint16Arr;
  },
  saveAnnotationAlert(annotationId){
    if(confirm('Do you want to save annotation change?')){
      this.getImageFilesFromItemPromise(annotationId).then((files)=>{
        if(files[0].exts[0]==='nrrd'){

          this.updateFile(files[0]['_id']);
        }else{
          console.error(files[0].exts[0] + ' type annotation is not supported yet');
        }
      })
    }else{
      console.log('Do not save change');
    }
  },
  changeMode(e){
    this.mode = e;
  },
  setCursorSize(e){
    this.cursorSize = e;
  },
  setLabelColor(e){
    this.labelColor = e;
  },
  _collaspeSideBar(e){

    $(e.target).children()[0].classList.toggle('collapsein'); 
    if($(e.target).children().hasClass('collapsein')){
      this.$('.g-ds-nav-container').css('left','calc(-40vw + 20px)');
      this.$('.g-ds-nav-container').css('marginLeft','0vw');
      this.$('.ssrVisualizer').css('width','calc(100vw - 20px)');
      this.$('.ssrVisualizer').css('marginLeft','0');
    }else{
      this.$('.g-ds-nav-container').css('left','0vw');
      this.$('.g-ds-nav-container').css('marginLeft','0vw');
      this.$('.ssrVisualizer').css('width','60vw');
      this.$('.ssrVisualizer').css('marginLeft','0');
    }
  },
  _addSSRProjectNav(e){
    this.$el.html(dataSourceTemplate({
      SSR_Project:this.SSR_ProjectCollection,
      user:getCurrentUser()
    }));
  }
})

export default dataSource