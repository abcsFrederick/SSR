import _ from 'underscore';
import Backbone from 'backbone';

import GirderApp from 'girder/views/App';
import eventStream from 'girder/utilities/EventStream';
import { getCurrentUser } from 'girder/auth';
import { splitRoute } from 'girder/misc';

import router from './router';
import HeaderView from './views/layout/HeaderView';
import bindRoutes from './routes';
import PanelContent from './views/PanelContent';

import layoutTemplate from './templates/layout/layout.pug';
import './stylesheets/layout/layout.styl';

var App = GirderApp.extend({
    initialize(settings) {
        // restRequest({
        //     url:'collection',
        //     data:{'text':'SSR Project'}
        // }).then(_.bind((res)=>{
        this._started = false;
        settings = settings || {};
        // this.SSR_ProjectCollection = new CollectionModel();
        // this.SSR_ProjectCollection = this.SSR_ProjectCollection.set(res[0])
        this.contactEmail = settings.contactEmail || null;
        this.brandName = settings.brandName || null;
        this.bannerColor = settings.bannerColor || null;
        this.registrationPolicy = settings.registrationPolicy || null;
        this.enablePasswordLogin = _.has(settings, 'enablePasswordLogin') ? settings.enablePasswordLogin : true;
        if (settings.start === undefined || settings.start) {
            this.start();
        }
        // },this))
    },
    render() {
        let d = new Date();
        this.$el.html(layoutTemplate({
            footer: d.getFullYear()
        }));

        this.ssrHeader = new HeaderView({
            el: this.$('#g-app-header-container'),
            parentView: this,
            settings: this.settings
        }).render();

        if (getCurrentUser()) {
            if (this.panelContentView) {
                this.panelContentView.destroy();
            }

            this.panelContentView = new PanelContent({
                el: this.$('#g-app-body-container'),
                parentView: this,
                brandName: this.brandName
            });

            this.panelContentView.render();
        }
        return this;
    },
    login: function () {
        var route = splitRoute(Backbone.history.fragment).base;
        Backbone.history.fragment = null;
        eventStream.close();

        if (getCurrentUser()) {
            eventStream.open();
            this.render();
            router.navigate(route, {trigger: true});
        } else {
            router.navigate('/', {trigger: true});
            location.reload(true);
        }
    },
    bindRoutes: bindRoutes
});

export default App;
