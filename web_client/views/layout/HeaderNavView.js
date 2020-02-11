import jQuery from 'jquery';
import events from '../../events';
import eventStream from 'girder/utilities/EventStream';
import { logout, getCurrentUser,fetchCurrentUser, setCurrentUser } from 'girder/auth';
import { splitRoute, parseQueryString } from 'girder/misc';
import Backbone from 'backbone';
import View from 'girder/views/View';
import router from '../../router';

// import landingPage from './views/LandingPage';
import { restRequest } from 'girder/rest';
import navTemplate from '../../templates/layout/nav.pug';
import '../../stylesheets/layout/nav.styl';

import dataSource from '../dataSource/dataSource';
import Workflow from '../workflow/workflow';
import Visualization from '../visualization/visualization';
// import 'bootstrap';
// import 'bootstrap/dist/css/bootstrap.css';
import FolderModel from 'girder/models/FolderModel';
import UserModel from 'girder/models/UserModel';
import CollectionModel from 'girder/models/CollectionModel';

import HeaderUserView from 'girder/views/layout/HeaderUserView';

var HeaderNavView = View.extend({
  events:{
    'click #Data': '_data',
    'click #Link': '_link',
    'click #Apps': '_apps',
    'click #History': '_history'
  },
  initialize(settings){
    this.nav = {
      'Data': {
        'DOM': 's-full-page-body-Data'
      },
      'Link': {
        'DOM': 's-full-page-body-Link'
      },
      'Apps': {
        'DOM': 's-full-page-body-Apps'
      },
      'History': {
        'DOM': 's-full-page-body-History'
      },
      'Welcome': {
        'DOM': 's-full-page-body-Welcome'
      }
    };
    events.on('HeaderView:navigateTo', this.stepElementRender, this);
    // this.listenTo(events, 'query:step', this.stepElementRender);

  },
  render() {
    this.$el.html(navTemplate());
  },
  _data(e){
    e.preventDefault();
    let curRoute = Backbone.history.fragment,
        routeParts = splitRoute(curRoute),
        queryString = parseQueryString(routeParts.name);
    let unparsedQueryString = $.param(queryString);
        if (unparsedQueryString.length > 0) {
            unparsedQueryString = '?' + unparsedQueryString;
        }
    // router.enabled(1);
    // console.log(curRoute);
    router.navigate('data' + unparsedQueryString, {trigger: true});
    // router.setQuery('step','View', {trigger: true});
  },
  _link(e){
    e.preventDefault();
    let curRoute = Backbone.history.fragment,
        routeParts = splitRoute(curRoute),
        queryString = parseQueryString(routeParts.name);
    let unparsedQueryString = $.param(queryString);
        if (unparsedQueryString.length > 0) {
            unparsedQueryString = '?' + unparsedQueryString;
        }
    // router.enabled(1);
    // console.log(curRoute);
    router.navigate('qc' + unparsedQueryString, {trigger: true});
    // router.setQuery('step','Link', {trigger: true});
    // console.log(Backbone.history.fragment);
  },
  _apps(e){
    e.preventDefault();
    let curRoute = Backbone.history.fragment,
        routeParts = splitRoute(curRoute),
        queryString = parseQueryString(routeParts.name);
    let unparsedQueryString = $.param(queryString);
        if (unparsedQueryString.length > 0) {
            unparsedQueryString = '?' + unparsedQueryString;
        }
    // router.enabled(1);
    // console.log(curRoute);
    router.navigate('apps' + unparsedQueryString, {trigger: true});
    // router.setQuery('step','Analysis', {trigger: true});
  },
  _history(e){
    e.preventDefault();
    let curRoute = Backbone.history.fragment,
        routeParts = splitRoute(curRoute),
        queryString = parseQueryString(routeParts.name);
    let unparsedQueryString = $.param(queryString);
        if (unparsedQueryString.length > 0) {
            unparsedQueryString = '?' + unparsedQueryString;
        }
    // router.enabled(1);
    // console.log(curRoute);
    router.navigate('history' + unparsedQueryString, {trigger: true});
    // router.setQuery('step','History', {trigger: true});
  },
  stepElementRender(nav){
    if(nav === 'Data'){
      $('#Actions').show();
    }else{
      $('#Actions').hide();
    }
    Object.keys(this.nav).forEach(key => {
      let dom = this.nav[key];
      $('#' + key).removeClass('active');
      // $('#' + dom).hide();
      //use key and value here
    });
    if(nav !== 'Welcome') $('#' + nav).addClass('active');
    // $('#' + this.nav[nav].DOM).show('active');
  }
});

export default HeaderNavView;