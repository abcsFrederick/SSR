import View from 'girder/views/View';
import router from '../../router';
import events from '../../events';
import SAIPHierarchyBreadcrumbView from 'girder_plugins/Archive/views/SAIPHierarchyBreadcrumbView';
import SAIPProjectsView from 'girder_plugins/Archive/views/SAIPProjects';
import { restRequest } from 'girder/rest';
import { fetchCurrentUser } from 'girder/auth';
import SAIPTemplates from '../../templates/widgets/dsSAIP.pug';
import UserModel from 'girder/models/UserModel';

var SaipView = View.extend({
  events:{

  },
  initialize(settings){
    console.log(this.parentView)
    this.$el.html(SAIPTemplates());
    this.SAIPHierarchyBreadcrumbObjects=[{'object':{'name':'SAIP'},'type':'SAIP'}];
    this.currentUser = settings.user;
    console.log(this.currentUser)
    restRequest({
        url:'SAIP/'+this.currentUser.get('login')+'/projects' 
    }).then((col)=>{
      console.log('21')
      if(this.hierarchyBreadcrumbView){
        this.hierarchyBreadcrumbView.destroy()  //prevent from zombie view
      }
      this.hierarchyBreadcrumbView = new SAIPHierarchyBreadcrumbView({
        parentView:this,
        objects:this.SAIPHierarchyBreadcrumbObjects
      });
      $('#projects .g-hierarchy-breadcrumb-bar').html(this.hierarchyBreadcrumbView.el)

      if(this.saipProjectsView){
        this.saipProjectsView.destroy() //prevent from zombie view
      }
      this.saipProjectsView = new SAIPProjectsView({
        parentView:this,
        currentUser:this.currentUser,
        projectsFolder:col,
        SAIPHierarchyBreadcrumbObjects:this.SAIPHierarchyBreadcrumbObjects,
        hierarchyBreadcrumbView:this.hierarchyBreadcrumbView
      });
      $('#projects .g-folder-list-container').html(this.saipProjectsView.el)
      
      this.hierarchyBreadcrumbView.on('g:breadcrumbClicked',_.bind(function(idx){
        if(idx === 0)
        { 
          console.log(idx)
          this.SAIPHierarchyBreadcrumbObjects=this.SAIPHierarchyBreadcrumbObjects.slice(0, idx + 1);
          if(this.saipProjectsView){
            this.saipProjectsView.destroy() //prevent from zombie view
          }
          this.saipProjectsView = new SAIPProjectsView({
            parentView:this,
            currentUser:this.currentUser,
            projectsFolder:col,
            SAIPHierarchyBreadcrumbObjects:this.SAIPHierarchyBreadcrumbObjects,
            hierarchyBreadcrumbView:this.hierarchyBreadcrumbView
          });
          $('#projects .g-folder-list-container').html(this.saipProjectsView.el)
          this.hierarchyBreadcrumbView.objects = this.SAIPHierarchyBreadcrumbObjects;
          this.hierarchyBreadcrumbView.render();
        }
      },this));
    });
  },
  render(){
    return this;
  }
}, {
    /**
     * Helper function for fetching the user and rendering the view with
     * an arbitrary set of extra parameters.
     */
    fetchAndInit: function (params) {
        console.log(params || {});

        fetchCurrentUser().done(function(res){
          let user = new UserModel(res);
          if(params.workflow === 'ds'){
              events.trigger('ds:navigateTo', SaipView, _.extend({
                  user: user
              }, params || {}));
          }else{
              events.trigger('qc:navigateTo', SaipView, _.extend({
                  user: user
              }, params || {}));
          }
        })
        // var user = getCurrentUser();
        // user.set({
        //     _id: userId
        // }).on('g:fetched', function () {
            
            
        // }, this).on('g:error', function () {
        //     events.trigger('qc:navigateTo', UsersView);
        // }, this).fetch();
    }
});

export default SaipView;