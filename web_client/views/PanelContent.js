import View from 'girder/views/View';
import panelContentLayout from '../templates/layout/panelContentLayout.pug';

import mappingSeg from './mappingSeg/mappingSeg'
import dataSource from './dataSource/dataSource';
import Workflow from './workflow/workflow';
import Visualization from './visualization/visualization';

import events from '../events';
import router from '../router';
import BrowserWidget from 'girder/views/widgets/BrowserWidget';
import '../stylesheets/layout/layout.styl';
import { restRequest } from 'girder/rest';
import CollectionModel from 'girder/models/CollectionModel';
import { getCurrentUser} from 'girder/auth';
import SlicerPanelGroup from 'girder_plugins/slicer_cli_web_SSR/views/PanelGroupSSR';

var PanelContent = View.extend({

	initialize(settings){
    // console.log('here 20 panelcontent')
    // fetchCurrentUser().done(()=>{
      this.$el.html(panelContentLayout());
      this.SSR_ProjectCollection = settings.SSR_ProjectCollection;// this.SSR_ProjectCollection = new CollectionModel();
      this.nav = {
        'View':{
          'DOM':'s-full-page-body-View'
        },
        'Link':{
          'DOM':'s-full-page-body-Link'
        },
        'Analysis':{
          'DOM':'s-full-page-body-Analysis'
        },
        'History':{
          'DOM':'s-full-page-body-History'
        }
      };
      // events.on('g:logout.success', this.unbindEvents, this);
      this.listenTo(events, 'query:step', this.stepElementRender);

      // restRequest({
      //   url:'collection',
      //   data:{'text':'SSR Project'}
      // }).then(_.bind((res)=>{
          // this.SSR_ProjectCollection = this.SSR_ProjectCollection.set(res[0])

          if(this.controlPanel){
            this.controlPanel.destory();
          }
          if(this.View){
            this.View.destory();
          }
          if(this.Link){
            this.Link.destory();
          }

          this.controlPanel = new SlicerPanelGroup({
                parentView: this
            });
          this.View = new dataSource({
              parentView:this,
              el:$('#s-full-page-body-View'),
              controlPanel: this.controlPanel,
              SSR_ProjectCollection: this.SSR_ProjectCollection || {},
              currentUser: getCurrentUser()
          });

          this.Link = new mappingSeg({
              parentView:this,
              el:$('#s-full-page-body-Link'),
              currentUser:getCurrentUser(),
              SSR_ProjectCollection: this.SSR_ProjectCollection || {},
          });

          if(this.Analysis){
            this.Analysis.destory();
          }
          if(this.History){
            this.History.destory();
          }
          this.Analysis = new Workflow({
              parentView:this,
              controlPanel:this.controlPanel,
              el:$('#s-full-page-body-Analysis'),
              currentUser:getCurrentUser(),
              // SSR_ProjectCollection: this.SSR_ProjectCollection || {},
          });
          restRequest({
                url: 'SSR/'
            }).done(_.bind(function(records) {
              this.History = new Visualization({
                  records:records,
                  controlPanel:this.controlPanel,
                  parentView:this,
                  el:$('#s-full-page-body-History'),
                  currentUser:getCurrentUser()
                  // SSR_ProjectCollection: this.SSR_ProjectCollection || {},
              });
          // $('#s-full-page-body-history').html(this.visualizationView.el)
          },this));
          // $('#s-full-page-body-View').html(this.View.el);
          // $('#s-full-page-body-Link').html(this.Link.el);
          // this.stepElementRender(this.currentNav)
      // },this))
    
    // });
  		
    // window.PanelContent = this;
	},
	render(){
		// this.$el.html(landingPageLayout());
		return this;
	},
	stepElementRender(nav){
    // console.log('in panelcontent 77')
    if(nav){
      if(this.currentNav != nav){
        this.currentNav = nav;
      }
      Object.keys(this.nav).forEach(key => {
        let dom = this.nav[key].DOM;
        $('#' + dom).hide();
        //use key and value here
      });
      let currentDom = this.nav[this.currentNav].DOM;
      // if(this[this.currentNav]){
        // $('#' + currentDom).html(this[this.currentNav].el);
      $('#' + this.nav[this.currentNav].DOM).show();
      // }
    }
		
    
  },
  // unbindEvents(){
  //   this.stopListening()
  // }
});

export default PanelContent;