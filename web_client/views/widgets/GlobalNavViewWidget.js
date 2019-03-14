import $ from 'jquery';
import Backbone from 'backbone';

import router from '../../router';
import View from 'girder/views/View';
import events from '../../events';
import { getCurrentUser } from 'girder/auth';
import { splitRoute, parseQueryString } from 'girder/misc';
import LayoutGlobalNavTemplate from '../../templates/widgets/layoutGlobalNav.pug';

import 'girder/stylesheets/layout/globalNav.styl';
import '../../stylesheets/widgets/layoutGlobalNav.styl';
/**
 * This view shows a list of global navigation links that should be
 * displayed at all times.
 */
var LayoutGlobalNavView = View.extend({
    events: {
        'click .g-nav-link': function (event) {
            let curRoute = Backbone.history.fragment,
                routeParts = splitRoute(curRoute),
                queryString = parseQueryString(routeParts.name);
            let unparsedQueryString = $.param(queryString);
                if (unparsedQueryString.length > 0) {
                    unparsedQueryString = '?' + unparsedQueryString;
                }
            event.preventDefault(); // so we can keep the href

            var link = $(event.currentTarget);

            router.enabled(1)
            if ($(event.delegateTarget).hasClass('g-ori-nav-container')){
                if(link.attr('g-name') === 'SAIP'){
                    router.navigate('qc_' + link.attr('g-target').toLowerCase() + unparsedQueryString, {trigger: true});
                }else{
                    router.navigate('ori_' + link.attr('g-target') + unparsedQueryString, {trigger: true});
                }
            }
            if ($(event.delegateTarget).hasClass('g-seg-nav-container')){
                router.navigate('seg_' + link.attr('g-target') + unparsedQueryString, {trigger: true});
            }
            // Must call this after calling navigateTo, since that
            // deactivates all global nav links.
            link.parent().addClass('g-active');
        }
    },

    initialize: function (settings) {
        events.on('g:highlightItem', this.selectForView, this);
        events.on('g:login', this.render, this);
        events.on('g:logout', this.render, this);
        events.on('g:login-changed', this.render, this);

        settings = settings || {};
        if (settings.navItems) {
            this.navItems = settings.navItems;
        } else {
            this.defaultNavItems = [{
                name: 'Collections',
                icon: 'icon-sitemap',
                target: 'collections'
            }, {
                name: 'Users',
                icon: 'icon-user',
                target: 'users'
            }, {
                name: 'Groups',
                icon: 'icon-users',
                target: 'groups'
            }];
        }
        this.element = settings.element;
    },
    render: function () {
        var navItems;
        if (this.navItems) {
            navItems = this.navItems;
        } else {
            navItems = this.defaultNavItems;
            if (getCurrentUser() && getCurrentUser().get('admin')) {
                // copy navItems so that this.defaultNavItems is unchanged
                navItems = navItems.slice();
                navItems.push({
                    name: 'Admin console',
                    icon: 'icon-wrench',
                    target: 'admin'
                });
            }
        }
        this.$el.html(LayoutGlobalNavTemplate({
            element: this.element,
            navItems: navItems
        }));

        if (Backbone.history.fragment) {
            this.$('[g-target="' + Backbone.history.fragment + '"]')
                .parent().addClass('g-active');
        }

        return this;
    },

    /**
     * Highlight the item with the given target attribute, which is the name
     * of the view it navigates to.
     */
    selectForView: function (viewName) {
        this.deactivateAll();
        this.$('[g-name="' + viewName.slice(0, -4) + '"]').parent().addClass('g-active');
    },

    deactivateAll: function () {
        this.$('.g-global-nav-li').removeClass('g-active');
    }
});

export default LayoutGlobalNavView;
