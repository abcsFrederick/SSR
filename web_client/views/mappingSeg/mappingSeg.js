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
import LayoutGlobalNavView from '../widgets/GlobalNavViewWidget';
import $ from 'jquery';
import { Layout } from 'girder/constants';
import { splitRoute } from 'girder/misc';
import '../../stylesheets/mappingSeg/mappingSeg.styl';
import '../../stylesheets/widgets/selectionTemplates.styl';
import SaipView from '../widgets/SaipViewWidget';
// import SAIPHierarchyBreadcrumbView from 'girder_plugins/SAIP/views/SAIPHierarchyBreadcrumbView';

var mappingSeg = View.extend({
  events: {
    'click .linkOriAndSeg':'linkOriAndSeg'
  },
  initialize(setting){
    this.$el.html(MappingSegTemplate);
    this.currentUser = setting.currentUser;
    this.globalNavView_ori = new LayoutGlobalNavView({
        parentView: this,
        navItems:[{
                name: 'SAIP',
                icon: 'icon-download-cloud',
                target: 'SAIP'
            },{
                name: 'Collections',
                icon: 'icon-sitemap',
                target: 'collections'
            }, {
                name: 'Users',
                icon: 'icon-user',
                target: 'users'
            }],
        element:'ori'
    });
    this.globalNavView_seg = new LayoutGlobalNavView({
        parentView: this,
        navItems:[
            {
                name: 'Collections',
                icon: 'icon-sitemap',
                target: 'collections'
            }, {
                name: 'Users',
                icon: 'icon-user',
                target: 'users'
            }],
        element:'seg'
    });
    this.globalNavView_ori.events = Object.assign(
    {
      'click .prepareLinkOri': function(event){
          // console.log('click')
          events.trigger('prepareLinkOri');
      }
    }, this.globalNavView_ori.events)

    this.globalNavView_seg.events = Object.assign(
    {
      'click .prepareLinkSeg': function(event){
          // console.log('click')
          events.trigger('prepareLinkSeg');
      }
    },this.globalNavView_seg.events)

    this.globalNavView_ori.setElement(this.$('.g-ori-nav-container')).render();
    this.globalNavView_seg.setElement(this.$('.g-seg-nav-container')).render();
    this.listenTo(events,'prepareLinkOri',this.prepareLinkOri);
    this.listenTo(events,'prepareLinkSeg',this.prepareLinkSeg);

    this.listenTo(events,'qc:selectSAIP',this.selectSAIP);
    this.listenTo(events,'qc:selectCollections',this.selectCollections);
    this.listenTo(events,'qc:selectUsers',this.selectUsers);

    this.listenTo(events,'qc:selectPreparations',this.selectPreparations);
    this.listenTo(events,'qc:highlightItem', this.selectForView);

    events.on('qc:navigateTo', this.navigateTo, this);
  },
  linkOriAndSeg: function(){
    let ori_list = [];
    let seg_list = [];
    $( "#ori_sortable li" ).each(function(index) {
      ori_list.push($($('#ori_sortable li')[index]).attr('tag'))
    });

    $( "#seg_sortable li" ).each(function(index) {
      seg_list.push($($('#seg_sortable li')[index]).attr('tag'))
    });

    _.each(seg_list,function(id,index){
      // console.log(id);
      restRequest({
        method:'PUT',
        url:'/SSR/segmentationLink/'+ori_list[index]+'/'+id,
      }).then((item)=>{
        console.log(item)
      })
    })
  },
  navigateTo: function (view, settings, opts) {
        this.deactivateAll(settings.viewName);

        settings = settings || {};
        opts = opts || {};

        if (view) {
          if(settings.viewName=='oriUsersView')
          {
            if (this.oriUserView) {
                this.oriUserView.destroy();
            }

            settings = _.extend(settings, {
                parentView: this,
                brandName: this.brandName,
                baseRoute:'ori_user'
            });

            /* We let the view be created in this way even though it is
             * normally against convention.
             */
            this.oriUserView = new view(settings); // eslint-disable-line new-cap

            if (opts.renderNow) {
                this.oriUserView.render();
            }
          }
          if(settings.viewName=='segUsersView')
          {
            if (this.segUserView) {
                this.segUserView.destroy();
            }

            settings = _.extend(settings, {
                parentView: this,
                brandName: this.brandName,
                baseRoute:'seg_user'
            });

            /* We let the view be created in this way even though it is
             * normally against convention.
             */
            this.segUserView = new view(settings); // eslint-disable-line new-cap

            if (opts.renderNow) {
                this.segUserView.render();
            }
          } 
          if(settings.viewName=='oriCollectionsView')
          {
            if (this.oriCollectionView) {
                this.oriCollectionView.destroy();
            }

            settings = _.extend(settings, {
                parentView: this,
                brandName: this.brandName,
                baseRoute:'ori_collection'
            });

            /* We let the view be created in this way even though it is
             * normally against convention.
             */
            this.oriCollectionView = new view(settings); // eslint-disable-line new-cap

            if (opts.renderNow) {
                this.oriCollectionView.render();
            }
          }
          if(settings.viewName=='segCollectionsView')
          {
            if (this.segCollectionView) {
                this.segCollectionView.destroy();
            }

            settings = _.extend(settings, {
                parentView: this,
                brandName: this.brandName,
                baseRoute:'seg_collection'
            });

            /* We let the view be created in this way even though it is
             * normally against convention.
             */
            this.segCollectionView = new view(settings); // eslint-disable-line new-cap

            if (opts.renderNow) {
                this.segCollectionView.render();
            }
          }
        } else {
            console.error('Undefined page.');
        }
        return this;
    },
  render(){

  },
  selectSAIP(params){
 
    this.fromFilesystem = false;
    this.fromSaipArchive = true;

    if(params.el =='.g-ori-container')
    {
      params = _.extend(params,{
        parentView:this,
        currentUser:this.currentUser
      })
      if (this.qcSaipView) {
        this.qcSaipView.destroy();
      }
      this.qcSaipView = new SaipView(params);

      // this.qcSaipView.render()
    }
  },
  selectCollections(params){

    this.fromFilesystem = true;
    this.fromSaipArchive = false;
    if(params.el =='.g-ori-container')
    {
      params = _.extend(params,{
        parentView:this
      })
      if (this.oriCollectionsView) {
        this.oriCollectionsView.destroy();
      }
      this.oriCollectionsView = new CollectionsView(params);
      this.oriCollectionsView.events = {
      'click a.g-collection-link': function (event) {
          var cid = $(event.currentTarget).attr('g-collection-cid');
          router.navigate('ori_collection/' + this.oriCollectionsView.collection.get(cid).id, {trigger: true});
        }
      }
      this.oriCollectionsView.render()
    }
    if(params.el =='.g-seg-container')
    {
      params = _.extend(params,{
        parentView:this
      })
      if (this.segCollectionsView) {
        this.segCollectionsView.destroy();
      }
      this.segCollectionsView = new CollectionsView(params);
      this.segCollectionsView.events = {
      'click a.g-collection-link': function (event) {
          var cid = $(event.currentTarget).attr('g-collection-cid');
          router.navigate('seg_collection/' + this.oriCollectionsView.collection.get(cid).id, {trigger: true});
        }
      }
      this.segCollectionsView.render()
    }
    
  },
  selectUsers(params){
    this.fromFilesystem = true;
    this.fromSaipArchive = false;
    if(params.el == '.g-ori-container')
    {
      params = _.extend(params,{
        parentView:this
      })
      if (this.oriUsersView) {
        this.oriUsersView.destroy();
      }
      this.oriUsersView = new UsersView(params);

      this.oriUsersView.render()
    }
    if(params.el == '.g-seg-container')
    {
      params = _.extend(params,{
        parentView:this
      })
      if (this.segUsersView) {
        this.segUsersView.destroy();
      }
      this.segUsersView = new UsersView(params);

      this.segUsersView.render()
    }
  },
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
    if(viewName.slice(0, 3) == 'ori')
    {
      this.$('.g-ori-nav-container [g-name="' + viewName.slice(3, -4) + '"]').parent().addClass('g-active');
    }
    if(viewName.slice(0, 3) == 'seg')
    {
      this.$('.g-seg-nav-container [g-name="' + viewName.slice(3, -4) + '"]').parent().addClass('g-active');
    }
  },

  deactivateAll: function (viewName) {
    if(viewName.slice(0, 3) == 'ori')
    {
      this.$('.g-ori-nav-container .g-global-nav-li').removeClass('g-active');
    }
    if(viewName.slice(0, 3) == 'seg')
    {
      this.$('.g-seg-nav-container .g-global-nav-li').removeClass('g-active');
    }
  },
  prepareLinkOri(){
    if(this.fromSaipArchive){
      let studyId = this.qcSaipView.saipProjectsView.saipExperimentsView.saipPatientsView.saipStudiesView.selectecStudyId;
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
            this.prepareLinkSeg();
        },this))
      },this));
    }
    else if(this.fromFilesystem){
      let folders = this.oriUserView.hierarchyWidget.folderListView.checked;
      let folderModels=[];
      for(let a=0;a<folders.length;a++){
          let folderModel = this.oriUserView.hierarchyWidget.folderListView.collection.get(this.oriUserView.hierarchyWidget.folderListView.checked[a])
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
          this.prepareLinkSeg();
      },this))
    }
      
  },
  prepareLinkSeg(){
      // console.log(this.segUserView)
      let folders = this.segUserView.hierarchyWidget.folderListView.checked;
      let folderModels=[];
      for(let a=0;a<folders.length;a++){
          let folderModel = this.segUserView.hierarchyWidget.folderListView.collection.get(this.segUserView.hierarchyWidget.folderListView.checked[a])
          folderModels.push(folderModel)
      }
      // console.log('seg prepare click')
      // console.log(folders)
      restRequest({
          url:'/item/',
          data:{'folderId':folderModels[0].get('_id'),'sort':'lowerName'}
      }).then((items)=>{
          // console.log(items);
          // console.log(this.$('.g-seg-selections'));
          $('.g-seg-container').html(SelectionTemplates({
              element:'seg_sortable',
              tag:'seg_id',
              oriItems:this.oriItems||[],
              items:items
          }));
          // console.log($( "#seg_sortable" ));
          $( "#seg_sortable" ).sortable();
          $( "#seg_sortable" ).disableSelection();
      })
      
  }
})
export default mappingSeg;