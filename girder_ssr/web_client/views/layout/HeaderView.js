import View from '@girder/core/views/View';

import router from '../../router';
import HeaderNavView from './HeaderNavView';
import HeaderUserView from './HeaderUserView';
import headerTemplate from '../../templates/layout/header.pug';
import '../../stylesheets/layout/header.styl';

var HeaderView = View.extend({
    events: {
        'click #s-navbar-brand': function () {
            router.navigate('', {trigger: true});
        }
    },
    initialize(params) {
        return View.prototype.initialize.apply(this, arguments);
    },

    render() {
        this.$el.html(headerTemplate());

        new HeaderUserView({
            el: this.$('.s-current-user-wrapper'),
            parentView: this
        }).render();

        new HeaderNavView({
            el: this.$('.s-nav-wrapper'),
            parentView: this
        }).render();

        return this;
    }
});

export default HeaderView;
