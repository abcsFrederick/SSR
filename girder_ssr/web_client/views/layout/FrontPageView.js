import $ from 'jquery';
import Backbone from 'backbone';
import versionInfo from '@girder/core/version';
import View from '@girder/core/views/View';
import { cancelRestRequests, getApiRoot } from '@girder/core/rest';
import { getCurrentUser } from '@girder/core/auth';
import { splitRoute, parseQueryString } from '@girder/core/misc';

import FrontPageTemplate from '../../templates/layout/frontPage.pug';

import '../../stylesheets/layout/frontPage.styl';

import router from '../../router';
/**
 * This is the view for the front page of the app.
 */
var FrontPageView = View.extend({
    events: {
        'click .card-block': '_gotoNavPanel'
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
    _gotoNavPanel: function (e) {
        let nav = e.currentTarget.getAttribute('target');
        let curRoute = Backbone.history.fragment,
            routeParts = splitRoute(curRoute),
            queryString = parseQueryString(routeParts.name);
        let unparsedQueryString = $.param(queryString);
        if (unparsedQueryString.length > 0) {
            unparsedQueryString = '?' + unparsedQueryString;
        }
        router.navigate(nav + unparsedQueryString, {trigger: true});
    }
});

export default FrontPageView;
