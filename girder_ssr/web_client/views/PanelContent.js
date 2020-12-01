import _ from 'underscore';

import View from '@girder/core/views/View';
import { restRequest } from '@girder/core/rest';
import CollectionModel from '@girder/core/models/CollectionModel';
import { getCurrentUser } from '@girder/core/auth';

import Apps from '@girder/ssrtask/views/layouts/main';

import FrontPageView from './layout/FrontPageView';
import DataSource from './dataSource/dataSource';
// import History from './history/history';

import events from '../events';
import panelContentLayout from '../templates/layout/panelContentLayout.pug';

import '../stylesheets/layout/layout.styl';

var PanelContent = View.extend({

    initialize(settings) {
        this.$el.html(panelContentLayout());
        this.SSR_ProjectCollection = new CollectionModel();

        restRequest({
            url: 'collection',
            data: {'text': 'SSR Project'}
        }).then(_.bind((res) => {
            this.SSR_ProjectCollection = this.SSR_ProjectCollection.set(res[0]);
        }, this));
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
        events.on('panelContent:navigateTo', this.stepElementRender, this);
    },
    render() {
        if (this.Welcome) {
            this.Welcome.destroy();
        }
        if (this.View) {
            this.View.destroy();
        }
        if (this.apps) {
            this.apps.destroy();
        }
        this.Welcome = new FrontPageView({
            parentView: this,
            el: $('#s-full-page-body-Welcome')
        });

        this.data = new DataSource({
            parentView: this,
            el: $('#s-full-page-body-Data'),
            SSR_ProjectCollection: this.SSR_ProjectCollection || {},
            currentUser: getCurrentUser()
        });

        this.apps = new Apps({
            parentView: this,
            SSR_ProjectCollection: this.SSR_ProjectCollection || {},
            el: $('#s-full-page-body-Apps'),
            currentUser: getCurrentUser()
        });
        return this;
    },
    stepElementRender(nav) {
        if (nav) {
            if (this.currentNav !== nav) {
                this.currentNav = nav;
            }
            Object.keys(this.nav).forEach((key) => {
                let dom = this.nav[key].DOM;
                $('#' + dom).hide();
            });
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
                        parentView: this,
                        el: $('#s-full-page-body-History'),
                        currentUser: getCurrentUser()
                    });
                }, this));
            }
        }
    }
});

export default PanelContent;
