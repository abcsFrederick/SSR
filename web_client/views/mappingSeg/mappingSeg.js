import View from 'girder/views/View';
import events from '../../events';
import { restRequest } from 'girder/rest';
import FolderModel from 'girder/models/FolderModel';

import MappingSegTemplate from '../../templates/mappingSeg/mappingSeg.pug';
import SelectionTemplates from '../../templates/widgets/SelectionTemplates.pug';

import UsersView from '../widgets/UsersViewWidget';
import CollectionsView from '../widgets/CollectionsViewWidget';

import router from '../../router';

import { getCurrentUser } from 'girder/auth';
// import LayoutGlobalNavView from '../widgets/GlobalNavViewWidget';
import $ from 'jquery';
import { Layout } from 'girder/constants';
import '../../stylesheets/mappingSeg/mappingSeg.styl';
import '../../stylesheets/widgets/selectionTemplates.styl';
import SaipView from '../widgets/SaipViewWidget';
// import SAIPHierarchyBreadcrumbView from 'girder_plugins/SAIP/views/SAIPHierarchyBreadcrumbView';
import { splitRoute, parseQueryString } from 'girder/misc';

var mappingSeg = View.extend({
  events: {
    'click #startLink':'linkOriAndSeg',
    'dragenter .g-drop-zone': function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'copy';

        $(e.currentTarget)
            .addClass('g-dropzone-show')
            .html('<i class="icon-bullseye"/> Drop folder here');
    },
    'dragleave .g-drop-zone': function (e) {
        e.stopPropagation();
        e.preventDefault();
        let selectedClass = e.currentTarget.classList[1];

        $(e.currentTarget)
          .removeClass('g-dropzone-show')
          .html('<i class="icon-docs"/> Drop ' + selectedClass + ' folder to here');

    },
    'dragover .g-drop-zone': function (e) {
        var dataTransfer = e.originalEvent.dataTransfer;
        if (!dataTransfer) {
            return;
        }
        // The following two lines enable drag and drop from the chrome download bar
        var allowed = dataTransfer.effectAllowed;
        dataTransfer.dropEffect = (allowed === 'move' || allowed === 'linkMove') ? 'move' : 'copy';

        e.preventDefault();
    },
    'drop .g-drop-zone': 'folderDropped',
    'click .g-ori-nav-container .qc-Girder': function (event) {
      console.log('28 click');
      let link = $(event.currentTarget);
      let curRoute = Backbone.history.fragment,
          routeParts = splitRoute(curRoute),
          queryString = parseQueryString(routeParts.name);
      let unparsedQueryString = $.param(queryString);
          if (unparsedQueryString.length > 0) {
              unparsedQueryString = '?' + unparsedQueryString;
          }

      router.navigate('qc_user/' + link.attr('g-id') + unparsedQueryString, {trigger: true});
    },
    // 'click .g-seg-nav-container .qc-Girder': function (event) {
    //   console.log('40 click');
    //   let link = $(event.currentTarget);
    //   let curRoute = Backbone.history.fragment,
    //       routeParts = splitRoute(curRoute),
    //       queryString = parseQueryString(routeParts.name);
    //   let unparsedQueryString = $.param(queryString);
    //       if (unparsedQueryString.length > 0) {
    //           unparsedQueryString = '?' + unparsedQueryString;
    //       }

    //   router.navigate('seg_user/' + link.attr('g-id') + unparsedQueryString, {trigger: true});

    // },
    'click .g-ori-nav-container .qc-Filesystem': function (event) {

      let link = $(event.currentTarget);
      let curRoute = Backbone.history.fragment,
          routeParts = splitRoute(curRoute),
          queryString = parseQueryString(routeParts.name);
      let unparsedQueryString = $.param(queryString);
          if (unparsedQueryString.length > 0) {
              unparsedQueryString = '?' + unparsedQueryString;
          }

      router.navigate('qc_collection/' + link.attr('g-id') + unparsedQueryString, {trigger: true});
    },
    // 'click .g-seg-nav-container .qc-Filesystem': function (event) {

    //   let link = $(event.currentTarget);
    //   let curRoute = Backbone.history.fragment,
    //       routeParts = splitRoute(curRoute),
    //       queryString = parseQueryString(routeParts.name);
    //   let unparsedQueryString = $.param(queryString);
    //       if (unparsedQueryString.length > 0) {
    //           unparsedQueryString = '?' + unparsedQueryString;
    //       }

    //   router.navigate('seg_collection/' + link.attr('g-id') + unparsedQueryString, {trigger: true});
    // },
    'click .g-ori-nav-container .qc-SAIP': function (event) {

      let link = $(event.currentTarget);
      let curRoute = Backbone.history.fragment,
          routeParts = splitRoute(curRoute),
          queryString = parseQueryString(routeParts.name);
      let unparsedQueryString = $.param(queryString);
          if (unparsedQueryString.length > 0) {
              unparsedQueryString = '?' + unparsedQueryString;
          }

      router.navigate('qc_saip' + unparsedQueryString, {trigger: true});
    },
    /*'click .checkLink':function (event) {
      console.log('checkLink')
      events.trigger('prepareLinkOri')  
      events.trigger('prepareLinkSeg')  
    }*/
  },
  initialize(setting){
    console.log(this)
    this.currentUser = setting.currentUser;
    this.SSR_ProjectCollection = setting.SSR_ProjectCollection;

    this.$el.html(MappingSegTemplate({
      SSR_Project:this.SSR_ProjectCollection,
      user:getCurrentUser()
    }));
    

    // if(this.SSR_ProjectCollection.id){
    //   this.globalNavView_ori = new LayoutGlobalNavView({
    //       parentView: this,
    //       navItems:[{
    //               name: 'SAIP',
    //               icon: 'icon-download-cloud',
    //               target: 'SAIPProject'
    //           },{
    //               name: this.SSR_ProjectCollection.get('name'),
    //               icon: 'icon-sitemap',
    //               target: 'collection',
    //               id: this.SSR_ProjectCollection.id
    //           }, {
    //               name: this.currentUser.name(),
    //               icon: 'icon-user',
    //               target: 'user',
    //               id: this.currentUser.id
    //           }],
    //       element:'ori'
    //   });
    //   this.globalNavView_seg = new LayoutGlobalNavView({
    //       parentView: this,
    //       navItems:[
    //           {
    //               name: this.SSR_ProjectCollection.get('name'),
    //               icon: 'icon-sitemap',
    //               target: 'collection',
    //               id: this.SSR_ProjectCollection.id
    //           }, {
    //               name: this.currentUser.name(),
    //               icon: 'icon-user',
    //               target: 'user',
    //               id: this.currentUser.id
    //           }],
    //       element:'seg'
    //   });
    // }else{
    //   this.globalNavView_ori = new LayoutGlobalNavView({
    //       parentView: this,
    //       navItems:[{
    //               name: 'SAIP',
    //               icon: 'icon-download-cloud',
    //               target: 'SAIPProject'
    //           }, {
    //               name: this.currentUser.name(),
    //               icon: 'icon-user',
    //               target: 'user',
    //               id: this.currentUser.id
    //           }],
    //       element:'ori'
    //   });
    //   this.globalNavView_seg = new LayoutGlobalNavView({
    //       parentView: this,
    //       navItems:[
    //            {
    //               name: this.currentUser.name(),
    //               icon: 'icon-user',
    //               target: 'users',
    //               id: this.currentUser.id
    //           }],
    //       element:'seg'
    //   });
    // }
    
    // this.globalNavView_ori.events = Object.assign(
    // {
    //   'click .prepareLinkOri': function(event){
    //       // console.log('click')
    //       events.trigger('prepareLinkOri');
    //   }
    // }, this.globalNavView_ori.events)

    // this.globalNavView_seg.events = Object.assign(
    // {
    //   'click .prepareLinkSeg': function(event){
    //       // console.log('click')
    //       events.trigger('prepareLinkSeg');
    //   }
    // },this.globalNavView_seg.events)

    events.on('qc:navigateTo', this.navigateTo, this);
    // this.globalNavView_ori.setElement(this.$('.g-ori-nav-container')).render();
    // this.globalNavView_seg.setElement(this.$('.g-seg-nav-container')).render();
    /*this.listenTo(events,'prepareLinkOri',this.prepareLinkOri);
    this.listenTo(events,'prepareLinkSeg',this.prepareLinkSeg);*/

    this.listenTo(events,'qc:selectSAIP',this.selectSAIP);
    this.listenTo(events,'qc:selectCollections',this.selectCollections);
    this.listenTo(events,'qc:selectUsers',this.selectUsers);

    this.listenTo(events,'qc:selectPreparations',this.selectPreparations);
    this.listenTo(events,'qc:highlightItem', this.selectForView);

    // window.mappingSeg = this;
  },
  linkOriAndSeg: function(){
    console.log(this)
    let ori_list = [];
    let seg_list = [];
    $( "#original_sortable li" ).each(function(index) {
      ori_list.push($($('#original_sortable li')[index]).attr('tag'))
    });

    $( "#segmentation_sortable li" ).each(function(index) {
      seg_list.push($($('#segmentation_sortable li')[index]).attr('tag'))
    });

    _.each(seg_list,function(id,index){
      // console.log(id);
      restRequest({
        method:'PUT',
        url:'/SSR/segmentationLink/'+ori_list[index]+'/'+id,
      }).then((item)=>{
        $('#segmentation_sortable [tag=' + id + ']').css('background-position','left bottom');
        // $('.beforeLink').css('display','none');
        // $('.afterLink').css('display','inline-grid');
      })
    })
  },
  navigateTo: function (view, settings, opts) {
        // this.deactivateAll(settings.viewName);
        console.log('229 navigatevTo')
        settings = settings || {};
        opts = opts || {};

        if (view) {

          if(settings.viewName=='qcUserView')
          {
            if (this.qcUserView) {
                this.qcUserView.destroy();
            }
            if (this.qcCollectionView) {
                this.qcCollectionView.destroy();
                this.qcCollectionView = null;
            }
            this.oriFromFilesystem = true;
            this.oriFromSaipArchive = false;
            settings = _.extend(settings, {
                parentView: this,
                brandName: this.brandName,
                baseRoute:'qc_user'
            });

            /* We let the view be created in this way even though it is
             * normally against convention.
             */
            this.qcUserView = new view(settings); // eslint-disable-line new-cap

            if (opts.renderNow) {
                this.qcUserView.render();
            }
          }
          if(settings.viewName=='qcSSRProjectView')
          {
            this.oriFromFilesystem = true;
            this.oriFromSaipArchive = false;
            if (this.qcCollectionView) {
                this.qcCollectionView.destroy();
            }
            if (this.qcUserView) {
                this.qcUserView.destroy();
                this.qcUserView = null;
            }
            settings = _.extend(settings, {
                parentView: this,
                brandName: this.brandName,
                baseRoute:'qc_collection'
            });

            /* We let the view be created in this way even though it is
             * normally against convention.
             */
            this.qcCollectionView = new view(settings); // eslint-disable-line new-cap

            if (opts.renderNow) {
                this.qcCollectionView.render();
            }
          }
          // if(settings.viewName=='oriqcUsersView')
          // {
          //   if (this.oriUserView) {
          //       this.oriUserView.destroy();
          //   }
          //   if (this.oriCollectionView) {
          //       this.oriCollectionView.destroy();
          //       this.oriCollectionView = null;
          //   }
          //   this.oriFromFilesystem = true;
          //   this.oriFromSaipArchive = false;
          //   settings = _.extend(settings, {
          //       parentView: this,
          //       brandName: this.brandName,
          //       baseRoute:'ori_user'
          //   });

          //   /* We let the view be created in this way even though it is
          //    * normally against convention.
          //    */
          //   this.oriUserView = new view(settings); // eslint-disable-line new-cap

          //   if (opts.renderNow) {
          //       this.oriUserView.render();
          //   }
          // }
          // if(settings.viewName=='segqcUsersView')
          // { 
          //   this.segFromFilesystem = true;
          //   this.segFromSaipArchive = false;
          //   if (this.segUserView) {
          //       this.segUserView.destroy();
          //   }
          //   if (this.segCollectionView) {
          //       this.segCollectionView.destroy();
          //       this.segCollectionView = null;
          //   }
          //   settings = _.extend(settings, {
          //       parentView: this,
          //       brandName: this.brandName,
          //       baseRoute:'seg_user'
          //   });

          //   /* We let the view be created in this way even though it is
          //    * normally against convention.
          //    */
          //   this.segUserView = new view(settings); // eslint-disable-line new-cap

          //   if (opts.renderNow) {
          //       this.segUserView.render();
          //   }
          // } 
          // if(settings.viewName=='oriqcSSRProjectView')
          // {
          //   this.oriFromFilesystem = true;
          //   this.oriFromSaipArchive = false;
          //   if (this.oriCollectionView) {
          //       this.oriCollectionView.destroy();
          //   }
          //   if (this.oriUserView) {
          //       this.oriUserView.destroy();
          //       this.oriUserView = null;
          //   }
          //   settings = _.extend(settings, {
          //       parentView: this,
          //       brandName: this.brandName,
          //       baseRoute:'ori_collection'
          //   });

          //   /* We let the view be created in this way even though it is
          //    * normally against convention.
          //    */
          //   this.oriCollectionView = new view(settings); // eslint-disable-line new-cap

          //   if (opts.renderNow) {
          //       this.oriCollectionView.render();
          //   }
          // }
          // if(settings.viewName=='segqcSSRProjectView')
          // {
          //   this.segFromFilesystem = true;
          //   this.segFromSaipArchive = false;
          //   if (this.segCollectionView) {
          //       this.segCollectionView.destroy();
          //   }
          //   if (this.segUserView) {
          //       this.segUserView.destroy();
          //       this.segUserView = null;
          //   }
          //   settings = _.extend(settings, {
          //       parentView: this,
          //       brandName: this.brandName,
          //       baseRoute:'seg_collection'
          //   });

          //   /* We let the view be created in this way even though it is
          //    * normally against convention.
          //    */
          //   this.segCollectionView = new view(settings); // eslint-disable-line new-cap

          //   if (opts.renderNow) {
          //       this.segCollectionView.render();
          //   }
          // }
          if(settings.viewName=='oriqcSAIPProjectView')
          {
            this.oriFromFilesystem = false;
            this.oriFromSaipArchive = true;
            if (this.dsSaipView) {
                this.dsSaipView.destroy();
            }

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
          }
          this.selectForView(settings.viewName)
        } else {
            console.error('Undefined page.');
        }
        return this;
    },
  render(){

  },
  // selectSAIP(params){
 
  //   this.fromFilesystem = false;
  //   this.fromSaipArchive = true;

  //   if(params.el =='.g-ori-container')
  //   {
  //     params = _.extend(params,{
  //       parentView:this,
  //       currentUser:this.currentUser
  //     })
  //     if (this.qcSaipView) {
  //       this.qcSaipView.destroy();
  //     }
  //     this.qcSaipView = new SaipView(params);

  //     // this.qcSaipView.render()
  //   }
  // },
  // selectCollections(params){

  //   this.fromFilesystem = true;
  //   this.fromSaipArchive = false;
  //   if(params.el =='.g-ori-container')
  //   {

  //     params = _.extend(params,{
  //       parentView:this
  //     })
  //     if (this.oriCollectionsView) {
  //       this.oriCollectionsView.destroy();
  //     }
  //     this.oriCollectionsView = new CollectionsView(params);
  //     this.oriCollectionsView.events = {
  //     'click a.g-collection-link': function (event) {
  //         var cid = $(event.currentTarget).attr('g-collection-cid');
  //         router.navigate('ori_collection/' + this.oriCollectionsView.collection.get(cid).id, {trigger: true});
  //       }
  //     }
  //     this.oriCollectionsView.render()
  //   }
  //   if(params.el =='.g-seg-container')
  //   {

  //     params = _.extend(params,{
  //       parentView:this
  //     })
  //     if (this.segCollectionsView) {
  //       this.segCollectionsView.destroy();
  //     }
  //     this.segCollectionsView = new CollectionsView(params);
  //     this.segCollectionsView.events = {
  //     'click a.g-collection-link': function (event) {
  //         var cid = $(event.currentTarget).attr('g-collection-cid');
  //         router.navigate('seg_collection/' + this.oriCollectionsView.collection.get(cid).id, {trigger: true});
  //       }
  //     }
  //     this.segCollectionsView.render()
  //   }
    
  // },
  // selectUsers(params){

  //   if(params.el == '.g-ori-container')
  //   {

  //     params = _.extend(params,{
  //       parentView:this
  //     })
  //     if (this.oriUsersView) {
  //       this.oriUsersView.destroy();
  //     }
  //     this.oriUsersView = new UsersView(params);

  //     this.oriUsersView.render()
  //   }
  //   if(params.el == '.g-seg-container')
  //   {

  //     params = _.extend(params,{
  //       parentView:this
  //     })
  //     if (this.segUsersView) {
  //       this.segUsersView.destroy();
  //     }
  //     this.segUsersView = new UsersView(params);

  //     this.segUsersView.render()
  //   }
  // },
  selectPreparations: function(params){
    if(params.el == '.g-ori-container')
    {
      // params = _.extend(params,{
      //   parentView:this
      // })
      // if (this.oriUsersView) {
      //   this.oriUsersView.destroy();
      // }
      // this.oriUsersView = new UsersView(params);

      // this.oriUsersView.render()
      this.prepareLinkOri();
    }
    if(params.el == '.g-seg-container')
    {
      // params = _.extend(params,{
      //   parentView:this
      // })
      // if (this.segUsersView) {
      //   this.segUsersView.destroy();
      // }
      // this.segUsersView = new UsersView(params);

      // this.segUsersView.render()
      this.prepareLinkSeg();
    }
  },
  selectForView: function (viewName) {
    this.deactivateAll(viewName);

    // console.log(this.$('.g-ori-nav-container [g-target="' + viewName.slice(3, -4) + '"]'))
    // console.log(this)
    /*if(viewName.slice(0, 3) == 'ori')
    {
      this.$('.g-ori-nav-container [g-target="' + viewName.slice(3, -4) + '"]').parent().addClass('g-active');
    }
    if(viewName.slice(0, 3) == 'seg')
    {
      this.$('.g-seg-nav-container [g-target="' + viewName.slice(3, -4) + '"]').parent().addClass('g-active');
    }*/
    if(viewName == 'qcUserView')
    {
      this.$('.g-ori-nav-container [g-name='+viewName.slice(0,-4)+']').parent().addClass('g-active');
      $('.ds-Girder > .icon-left-dir').show();
    }
    if(viewName == 'qcSSRProjectView')
    {
      this.$('.g-ori-nav-container [g-name='+viewName.slice(0,-4)+']').parent().addClass('g-active');
      $('.ds-Girder > .icon-left-dir').show();
    }
    if(viewName == 'qcSAIPProjectView')
    {
      this.$('.g-ori-nav-container [g-name='+viewName.slice(0,-4)+']').parent().addClass('g-active');
      $('.ds-Girder > .icon-left-dir').show();
    }
  },

  deactivateAll: function (viewName) {
    this.$('.icon-left-dir').hide();
    this.$('.icon-right-dir').hide();
    this.$('.g-global-nav-li').removeClass('g-active');
  },
  /*prepareLinkOri(){
    if(this.oriFromSaipArchive){
      let studyId = this.dsSaipView.saipProjectsView.saipExperimentsView.saipPatientsView.saipStudiesView.selectecStudyId;
      restRequest({
          url:'SAIP/' + studyId + '/SAIPExistingValidation'
      }).then(_.bind((res)=>{
        let folder = new FolderModel(res);
        restRequest({
            url:'/item/',
            data:{'folderId':folder.get('_id'),'sort':'lowerName'}
        }).then(_.bind((items)=>{
            console.log(items);
            // console.log(this.$('.g-ori-selections'));
            $('.g-ori-container').html(SelectionTemplates({
                element:'ori_sortable',
                tag:'ori_id',
                items:items
            }));
            // console.log($( "#ori_sortable" ));
            $( "#ori_sortable" ).sortable();
            $( "#ori_sortable" ).disableSelection();
            this.oriItems = items;
            // this.prepareLinkSeg();
        },this))
      },this));
    }
    else if(this.oriFromFilesystem){
      this.oriCurrentView = this.oriUserView||this.oriCollectionView;
      let folders = this.oriCurrentView.hierarchyWidget.folderListView.checked;
      let folderModels=[];
      for(let a=0;a<folders.length;a++){
          let folderModel = this.oriCurrentView.hierarchyWidget.folderListView.collection.get(this.oriCurrentView.hierarchyWidget.folderListView.checked[a])
          folderModels.push(folderModel)
      }
      // console.log('ori prepare click')
      // console.log(folders)
      restRequest({
          url:'/item/',
          data:{'folderId':folderModels[0].get('_id'),'sort':'lowerName'}
      }).then(_.bind((items)=>{
          // console.log(items);
          // console.log(this.$('.g-ori-selections'));
          $('.g-ori-container').html(SelectionTemplates({
              element:'ori_sortable',
              tag:'ori_id',
              items:items
          }));
          // console.log($( "#ori_sortable" ));
          $( "#ori_sortable" ).sortable();
          $( "#ori_sortable" ).disableSelection();
          this.oriItems = items;
          // this.prepareLinkSeg();
      },this))
    }
      
  },
  prepareLinkSeg(){
      this.segCurrentView = this.segUserView||this.segCollectionView;
      let folders = this.segCurrentView.hierarchyWidget.folderListView.checked;
      let folderModels=[];
      for(let a=0;a<folders.length;a++){
          let folderModel = this.segCurrentView.hierarchyWidget.folderListView.collection.get(this.segCurrentView.hierarchyWidget.folderListView.checked[a])
          folderModels.push(folderModel)
      }
      // console.log('seg prepare click')
      // console.log(folders)
      restRequest({
          url:'/item/',
          data:{'folderId':folderModels[0].get('_id'),'sort':'lowerName'}
      }).then(_.bind((items)=>{
          // console.log(items);
          // console.log(this.$('.g-seg-selections'));
          $('.g-seg-container').html(SelectionTemplates({
              element:'seg_sortable',
              tag:'seg_id',
              oriItems:this.oriItems||[],
              items:items
          }));
          if(this.oriItems.length === items.length){
            // console
            $('.link').css('display','block');
            $('.beforeLink').css('display','block');
            $('.afterLink').css('display','none');
          }
          // console.log($( "#seg_sortable" ));
          $( "#seg_sortable" ).sortable();
          $( "#seg_sortable" ).disableSelection();
      },this))
      
  },*/
  folderDropped(e){

    // original | segmentation
    this.selectedClass = e.currentTarget.classList[1];
    e.stopPropagation();
    e.preventDefault();

    let dropedFolderId = event.dataTransfer.getData("folderId");
    let dropedFolderName = event.dataTransfer.getData("folderName");
    if(dropedFolderId){

      $(e.currentTarget)
        .removeClass('g-dropzone-show')
        .html('<i class="icon-folder-open"/> Drop another ' + this.selectedClass + ' folder to here to replace\n('
        + dropedFolderName + ')');

      restRequest({
          url:'/item/',
          data:{'folderId':dropedFolderId,'sort':'lowerName'}
      }).then(_.bind((items)=>{
          let eligible = false;
          if(this.selectedClass === 'original'){
            this.numberOfOriginalImage = items.length;
          }else{
            this.numberOfSegmentationImage = items.length;
          }
          if(this.numberOfOriginalImage === this.numberOfSegmentationImage){
            eligible = true;
          }
          // console.log('.prepared-zone .' + this.selectedClass);
          // console.log(this.$('.g-ori-selections'));
          $('.prepared-zone.' + this.selectedClass).html(SelectionTemplates({
              element: this.selectedClass + '_sortable',
              tag: this.selectedClass,
              items: items,
              eligible: eligible
          }));
          // console.log($( "#ori_sortable" ));
          $( "#" + this.selectedClass + "_sortable" ).sortable();
          $( "#" + this.selectedClass + "_sortable" ).disableSelection();
          this.oriItems = items;
          // this.prepareLinkSeg();
      },this))
    }
    else{
       $(e.currentTarget)
        .removeClass('g-dropzone-show')
        .html('<i class="icon-folder-open"> "Drog ' + this.selectedClass + ' folder (from left data source) to here"</i>');
    }
  }
})
export default mappingSeg;