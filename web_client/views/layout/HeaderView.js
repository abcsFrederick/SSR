import headerTemplate from '../../templates/layout/header.pug';
// import './stylesheets/layout/header.styl';

import View from 'girder/views/View';
import router from '../../router';
import HeaderNavView from './HeaderNavView';
import HeaderUserView from './HeaderUserView';
// import HeaderImageView from './HeaderImageView';

var HeaderView = View.extend({
    events: {
        'click #s-navbar-brand': function () {
            router.navigate('', {trigger: true});
        }
    },

    initialize(params) {
        // this.settings = params.settings;
        return View.prototype.initialize.apply(this, arguments);
    },

    render() {
        this.$el.html(headerTemplate({
            // brandName: this.settings.brandName,
            // brandColor: this.settings.brandColor,
            // bannerColor: this.settings.bannerColor
        }));

        // this.$('a[title]').tooltip({
        //     placement: 'bottom',
        //     delay: {show: 300}
        // });

        new HeaderUserView({
            el: this.$('.s-current-user-wrapper'),
            parentView: this
        }).render();

        // new HeaderImageView({
        //     el: this.$('.s-image-wrapper'),
        //     parentView: this
        // }).render();

        new HeaderNavView({
            el: this.$('.s-nav-wrapper'),
            parentView: this
        }).render();

        return this;
    }
});

export default HeaderView;