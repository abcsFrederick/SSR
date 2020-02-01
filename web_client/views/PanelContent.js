import View from 'girder/views/View';
import panelContentLayout from '../templates/layout/panelContentLayout.pug';

import FrontPageView from './layout/FrontPageView';
import mappingSeg from './mappingSeg/mappingSeg'
import dataSource from './dataSource/dataSource';
import Task from 'girder_plugins/SSR_task/views/layouts/main';
// import Workflow from './workflow/workflow';
// import Visualization from './visualization/visualization';

import History from './history/history';
import events from '../events';
import router from '../router';
import BrowserWidget from 'girder/views/widgets/BrowserWidget';
import '../stylesheets/layout/layout.styl';
import { restRequest } from 'girder/rest';
import CollectionModel from 'girder/models/CollectionModel';
import { getCurrentUser} from 'girder/auth';
// import SlicerPanelGroup from 'girder_plugins/slicer_cli_web_SSR/views/PanelGroupSSR';


var PanelContent = View.extend({

	initialize(settings){
    this.$el.html(panelContentLayout());
    this.SSR_ProjectCollection = new CollectionModel();

    restRequest({
      url:'collection',
      data:{'text':'SSR Project'}
    }).then(_.bind((res)=>{
      this.SSR_ProjectCollection = this.SSR_ProjectCollection.set(res[0])
    },this));
    this.nav = {
      'View':{
        'DOM': 's-full-page-body-View'
      },
      'Link':{
        'DOM': 's-full-page-body-Link'
      },
      'Analysis':{
        'DOM': 's-full-page-body-Analysis'
      },
      'History':{
        'DOM': 's-full-page-body-History'
      },
      'Welcome':{
        'DOM': 's-full-page-body-Welcome'
      }
    };
    events.on('panelContent:navigateTo', this.stepElementRender, this);
	},
	render(){
    if (this.Welcome) {
      this.Welcome.destroy();
    }
    // if (this.controlPanel) {
    //   this.controlPanel.destroy();
    // }
    if (this.View) {
      this.View.destroy();
    }
    if (this.Link) {
      this.Link.destroy();
    }

    this.Welcome = new FrontPageView({
      parentView: this,
      el: $('#s-full-page-body-Welcome')
    });

    // this.controlPanel = new SlicerPanelGroup({
    //   parentView: this
    // });
    this.View = new dataSource({
      parentView: this,
      el: $('#s-full-page-body-View'),
      // controlPanel: this.controlPanel,
      SSR_ProjectCollection: this.SSR_ProjectCollection || {},
      currentUser: getCurrentUser()
    });

    this.Link = new mappingSeg({
      parentView:this,
      el: $('#s-full-page-body-Link'),
      currentUser: getCurrentUser(),
      SSR_ProjectCollection: this.SSR_ProjectCollection || {},
    });

    if (this.Analysis) {
      this.Analysis.destroy();
    }
    this.Analysis = new Task({
      parentView: this,
      // controlPanel: this.controlPanel,
      el: $('#s-full-page-body-Analysis'),
      currentUser: getCurrentUser()
    }); 
		return this;
	},
	stepElementRender(nav){  
    if (nav) {
      if (this.currentNav != nav) {
        this.currentNav = nav;
      }
      Object.keys(this.nav).forEach(key => {
        let dom = this.nav[key].DOM;
        $('#' + dom).hide();
      });
      let currentDom = this.nav[this.currentNav].DOM;
      $('#' + this.nav[this.currentNav].DOM).show();

      if (nav === 'History') {
        if (this.History) {
          this.History.destroy();
        }
        restRequest({
          url: 'SSR/'
        }).done(_.bind(function (records) {
          this.History = new History({
            records: records,
            // controlPanel: this.controlPanel,
            parentView: this,
            el: $('#s-full-page-body-History'),
            currentUser: getCurrentUser()
          });
        },this));
      }
    }
  }
});

export default PanelContent;