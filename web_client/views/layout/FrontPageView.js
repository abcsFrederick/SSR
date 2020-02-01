import $ from 'jquery';

import versionInfo from 'girder/version';
import View from 'girder/views/View';
import { cancelRestRequests, getApiRoot } from 'girder/rest';
import events from 'girder/events';
import { getCurrentUser } from 'girder/auth';
import { splitRoute, parseQueryString } from 'girder/misc';

import FrontPageTemplate from '../../templates/layout/frontPage.pug';

import '../../stylesheets/layout/frontPage.styl';

import router from '../../router';
/**
 * This is the view for the front page of the app.
 */
var FrontPageView = View.extend({
    events: {
        // 'click .g-register-link': function () {
        //     events.trigger('g:registerUi');
        // },
        // 'click .g-login-link': function () {
        //     events.trigger('g:loginUi');
        // },
        // 'click .g-quicksearch-link': function () {
        //     $('.g-quick-search-container .g-search-field').focus();
        // }
        'click .card-block':'_gotoNavPanel'
    },

    initialize: function (settings) {
        cancelRestRequests('fetch');
        this.brandName = settings.brandName || 'Girder';
        this.render();
    },

    render: function () {
        this.$el.html(FrontPageTemplate({
            apiRoot: getApiRoot(),
            currentUser: getCurrentUser(),
            versionInfo: versionInfo,
            brandName: this.brandName
        }));

        return this;
    },
    _gotoNavPanel: function(e){
        let nav = e.currentTarget.getAttribute('target');
        let curRoute = Backbone.history.fragment,
            routeParts = splitRoute(curRoute),
            queryString = parseQueryString(routeParts.name);
        let unparsedQueryString = $.param(queryString);
            if (unparsedQueryString.length > 0) {
                unparsedQueryString = '?' + unparsedQueryString;
            }
        // router.enabled(1);
        // console.log(curRoute);
        router.navigate(nav + unparsedQueryString, {trigger: true});
    }
});

export default FrontPageView;
