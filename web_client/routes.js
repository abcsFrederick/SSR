import events from './events';
import Router from './router';

function bindRoutes() {
    Router.route('', 'index', function (params) {
        events.trigger('HeaderView:navigateTo', 'Welcome');
        events.trigger('panelContent:navigateTo', 'Welcome');
    });

    /* Data */
    Router.route('data', 'data', function (params) {
        // PanelContentView.stepElementRender('View');
        events.trigger('HeaderView:navigateTo', 'Data');
        events.trigger('panelContent:navigateTo', 'Data');
        // console.log('calls');
    });

    /* Apps */
    Router.route('apps', 'apps', function (params) {
        events.trigger('HeaderView:navigateTo', 'Apps');
        events.trigger('panelContent:navigateTo', 'Apps');
    });

    /* History */
    Router.route('history', 'history', function (params) {
        events.trigger('HeaderView:navigateTo', 'History');
        events.trigger('panelContent:navigateTo', 'History');
    });
    return Router;
}

export default bindRoutes;
