import Backbone from 'backbone';
import View from '@girder/core/views/View';
import { splitRoute, parseQueryString } from '@girder/core/misc';

import events from '../../events';
import router from '../../router';

import navTemplate from '../../templates/layout/nav.pug';

import '../../stylesheets/layout/nav.styl';

var HeaderNavView = View.extend({
    events: {
        'click #Data': '_data',
        'click #Apps': '_apps',
        'click #History': '_history'
    },
    initialize(settings) {
        this.nav = {
            'Data': {
                'DOM': 's-full-page-body-Data'
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
    },
    render() {
        this.$el.html(navTemplate());
        return this;
    },
    _data(e) {
        e.preventDefault();
        let curRoute = Backbone.history.fragment,
            routeParts = splitRoute(curRoute),
            queryString = parseQueryString(routeParts.name);
        let unparsedQueryString = $.param(queryString);
        if (unparsedQueryString.length > 0) {
            unparsedQueryString = '?' + unparsedQueryString;
        }
        router.navigate('data' + unparsedQueryString, {trigger: true});
    },
    _apps(e) {
        e.preventDefault();
        let curRoute = Backbone.history.fragment,
            routeParts = splitRoute(curRoute),
            queryString = parseQueryString(routeParts.name);
        let unparsedQueryString = $.param(queryString);
        if (unparsedQueryString.length > 0) {
            unparsedQueryString = '?' + unparsedQueryString;
        }
        router.navigate('apps' + unparsedQueryString, {trigger: true});
    },
    _history(e) {
        e.preventDefault();
        let curRoute = Backbone.history.fragment,
            routeParts = splitRoute(curRoute),
            queryString = parseQueryString(routeParts.name);
        let unparsedQueryString = $.param(queryString);
        if (unparsedQueryString.length > 0) {
            unparsedQueryString = '?' + unparsedQueryString;
        }
        router.navigate('history' + unparsedQueryString, {trigger: true});
    },
    stepElementRender(nav) {
        if (nav === 'Data') {
            $('#Actions').show();
        } else {
            $('#Actions').hide();
        }
        Object.keys(this.nav).forEach((key) => {
            $('#' + key).removeClass('active');
        });
        if (nav !== 'Welcome') $('#' + nav).addClass('active');
    }
});

export default HeaderNavView;
