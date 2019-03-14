import $ from 'jquery';

import PaginateWidget from 'girder/views/widgets/PaginateWidget';
import RegisterView from 'girder/views/layout/RegisterView';
import router from '../../router';
import SearchFieldWidget from 'girder/views/widgets/SearchFieldWidget';
import SortCollectionWidget from 'girder/views/widgets/SortCollectionWidget';
import UserCollection from 'girder/collections/UserCollection';
import UserModel from 'girder/models/UserModel';
import View from 'girder/views/View';
import { cancelRestRequests, restRequest } from 'girder/rest';
import { formatDate, formatSize, DATE_DAY } from 'girder/misc';
import { getCurrentUser } from 'girder/auth';
import HierarchyWidget from './userFoldersWidget';
import UserListTemplate from 'girder/templates/body/userList.pug';
// import analysis from '../analysis/analysis';
import events from '../../events';
import 'girder/stylesheets/body/userList.styl';

import '../../stylesheets/widgets/userList.styl'
import { splitRoute, parseQueryString } from 'girder/misc';
/**
 * This view lists users.
 */
var UsersViewWidget = View.extend({
    events: {
        'click a.g-user-link': //'renderUser',
        function (event) {
            let curRoute = Backbone.history.fragment,
                routeParts = splitRoute(curRoute),
                queryString = parseQueryString(routeParts.name);
            let unparsedQueryString = $.param(queryString);
                if (unparsedQueryString.length > 0) {
                    unparsedQueryString = '?' + unparsedQueryString;
                }
            var cid = $(event.currentTarget).attr('g-user-cid');
            router.enabled(1)
            if ($(event.delegateTarget).hasClass('g-ori-container')){
                router.navigate('ori_user/' + this.collection.get(cid).id + unparsedQueryString, {trigger: true});
            }
            if ($(event.delegateTarget).hasClass('g-seg-container')){
                router.navigate('seg_user/' + this.collection.get(cid).id + unparsedQueryString, {trigger: true});
            }
            if ($(event.delegateTarget).hasClass('selectionDom')){
                router.navigate('ds_user/' + this.collection.get(cid).id + unparsedQueryString, {trigger: true});
            }
        },
        'click button.g-user-create-button': 'createUserDialog',
        'submit .g-user-search-form': function (event) {
            event.preventDefault();
        }
    },

    initialize: function (settings) {
        cancelRestRequests('fetch');
        this.collection = new UserCollection();

        const promiseArray = [];
        promiseArray.push(this.collection.fetch());

        this.paginateWidget = new PaginateWidget({
            collection: this.collection,
            parentView: this
        });

        this.sortCollectionWidget = new SortCollectionWidget({
            collection: this.collection,
            parentView: this,
            fields: {
                lastName: 'Last Name',
                created: 'Creation Date',
                size: 'Used Space'
            }
        });

        this.searchWidget = new SearchFieldWidget({
            placeholder: 'Search users...',
            types: ['user'],
            modes: 'prefix',
            parentView: this
        }).on('g:resultClicked', this._gotoUser, this);

        if (getCurrentUser() && getCurrentUser().get('admin')) {
            const userCountPromise = UserCollection.getTotalCount()
                .done((count) => {
                    this.usersCount = count;
                });
            promiseArray.push(userCountPromise);
        }
        this.register = settings.dialog === 'register' && getCurrentUser() &&
                        getCurrentUser().get('admin');

        $.when(...promiseArray)
            .done(() => {
                this.listenTo(this.collection, 'g:changed', this.render);
                this.render();
            });
    },

    render: function () {
        this.$el.html(UserListTemplate({
            users: this.collection.toArray(),
            currentUser: getCurrentUser(),
            usersCount: this.usersCount,
            formatDate: formatDate,
            formatSize: formatSize,
            DATE_DAY: DATE_DAY
        }));

        this.paginateWidget.setElement(this.$('.g-user-pagination')).render();
        this.sortCollectionWidget.setElement(this.$('.g-user-sort')).render();
        this.searchWidget.setElement(this.$('.g-users-search-container')).render();

        if (this.register) {
            this.createUserDialog();
        }

        return this;
    },

    /**
     * When the user clicks a search result user, this helper method
     * will navigate them to the view for that specific user.
     */
    _gotoUser: function (result) {
        var user = new UserModel();
        user.set('_id', result.id).on('g:fetched', function () {
            //router.navigate('user/' + user.get('_id'), {trigger: true});
            restRequest({
                url:'user/'+ user.get('_id')
            }).then((user)=>{
                this.user = new UserModel(user);
                this.widget = new HierarchyWidget({
                    el: $('#selectedFile'),
                    parentView: this,
                    parentModel:this.user,
                    checkboxes: false,
                    routing: false,
                    showActions: false,
                    showItems: true,
                    showMetadata: false,
                    onItemClick:_.bind(this.SelectItem, this)
                });
            });
        }, this).fetch();
    },

    createUserDialog: function () {
        var container = $('#g-dialog-container');

        new RegisterView({
            el: container,
            parentView: this
        }).on('g:userCreated', function (info) {
            router.navigate('user/' + info.user.id, {trigger: true});
        }, this).render();
    },
    renderUser(evt){
        var cid = $(evt.currentTarget).attr('g-user-cid');
        restRequest({
            url:'user/'+ this.collection.get(cid).id
        }).then((user)=>{
            this.user = new UserModel(user);
            this.widget = new HierarchyWidget({
                el: $('#selectedFile'),
                parentView: this,
                parentModel:this.user,
                checkboxes: false,
                routing: false,
                showActions: false,
                showItems: true,
                showMetadata: false,
                onItemClick:_.bind(this.SelectItem, this)
            });
        });
    },
    // SelectItem(e){
    //     $('.image_selected').html(e.get('name'))
    //     this.ORIid=e.id
    //     if(this.analysisView){
    //         this.analysisView.destroy() //prevent from zombie view
    //     }
    //     this.analysisView = new analysis({
    //         selectedImage:this.ORIid,
    //         selectedSEG:this.SEG,
    //         selectedTmpFolder:this.tmpFolderId,
    //         parentView:this
    //     });
    //     $('.analysisContent').html(this.analysisView.el)
    // },
});

export default UsersViewWidget;
