import jQuery from 'jquery';
import events from '../../events';
import eventStream from 'girder/utilities/EventStream';
import { logout, getCurrentUser,fetchCurrentUser, setCurrentUser } from 'girder/auth';
import { splitRoute } from 'girder/misc';
import Backbone from 'backbone';
import View from 'girder/views/View';
import router from '../../router';

// import landingPage from './views/LandingPage';
import { restRequest } from 'girder/rest';
import navTemplate from '../../templates/layout/nav.pug';
import '../../stylesheets/layout/nav.styl';

import mappingSeg from '../mappingSeg/mappingSeg'
import dataSource from '../dataSource/dataSource';
import Workflow from '../workflow/workflow';
import Visualization from '../visualization/visualization';
// import 'bootstrap';
// import 'bootstrap/dist/css/bootstrap.css';
import SlicerPanelGroup from 'girder_plugins/slicer_cli_web_SSR/views/PanelGroupSSR';
import FolderModel from 'girder/models/FolderModel';
import UserModel from 'girder/models/UserModel';
import CollectionModel from 'girder/models/CollectionModel';

import HeaderUserView from 'girder/views/layout/HeaderUserView';
var HeaderNavView = View.extend({
  events:{
    'click #View': '_view',
    'click #Link': '_link',
    'click #Analysis': '_analysis',
    'click #History': '_history'
  },
  initialize(settings){
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
    },
    this.listenTo(events, 'query:step', this.stepElementRender);

  },
  render() {
    this.$el.html(navTemplate());
  },
  _view(e){
    e.preventDefault();
    router.setQuery('step','View', {trigger: true});
  },
  _link(e){
    e.preventDefault();
    router.setQuery('step','Link', {trigger: true});
    // console.log(Backbone.history.fragment);
  },
  _analysis(e){
    e.preventDefault();
    router.setQuery('step','Analysis', {trigger: true});
  },
  _history(e){
    e.preventDefault();
    router.setQuery('step','History', {trigger: true});
  },
  stepElementRender(nav){
    
    Object.keys(this.nav).forEach(key => {
      let dom = this.nav[key];
      $('#' + key).removeClass('active');
      // $('#' + dom).hide();
      //use key and value here
    });
    $('#' + nav).addClass('active');
    // $('#' + this.nav[nav].DOM).show('active');
  }
});

export default HeaderNavView;