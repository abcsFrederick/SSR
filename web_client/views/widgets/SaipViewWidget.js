import View from 'girder/views/View';
import router from '../../router';
import events from '../../events';
import SAIPHierarchyBreadcrumbView from 'girder_plugins/SAIP/views/SAIPHierarchyBreadcrumbView';
import SAIPProjectsView from 'girder_plugins/SAIP/views/SAIPProjects';
import { restRequest } from 'girder/rest';

import SAIPTemplates from '../../templates/widgets/dsSAIP.pug';

var SaipView = View.extend({
  events:{

  },
  initialize(settings){
    console.log(this.parentView)
    this.$el.html(SAIPTemplates());
    this.SAIPHierarchyBreadcrumbObjects=[{'object':{'name':'SAIP'},'type':'SAIP'}];
    this.currentUser = settings.currentUser;
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
});

export default SaipView;