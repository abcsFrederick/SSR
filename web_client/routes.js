import { splitRoute } from 'girder/misc';
import events from './events';
import PanelContentView from './views/PanelContent';

import Router from './router';
import ItemView from 'girder/views/body/ItemView';
import UserView from './views/widgets/UserViewWidget';
import CollectionView from './views/widgets/CollectionViewWidget';
import SaipView from './views/widgets/SaipViewWidget';
import app from './app';


function bindRoutes() {

    Router.route('', 'index', function (params) {
    	events.trigger('HeaderView:navigateTo', 'Welcome');
			events.trigger('panelContent:navigateTo', 'Welcome');
      // events.trigger('g:navigateTo', PanelContent, {});		//ImageView.render()
    });

/*DataSource*/
		Router.route('view', 'view', function (params) {
				// PanelContentView.stepElementRender('View');
				events.trigger('HeaderView:navigateTo', 'View');
				events.trigger('panelContent:navigateTo', 'View');
				// console.log('calls');
		});
/*
		Router.route('view/users', 'users', function (params) {
				params={
					el:'.selectionDom'
				}
		    events.trigger('ds:selectUsers', params);
		    events.trigger('ds:highlightItem', 'dsUsersView');
		});
*/
		Router.route('view/user/:id', 'user', function (userId, params) {
				events.trigger('HeaderView:navigateTo', 'View');
				events.trigger('panelContent:navigateTo', 'View');
		    UserView.fetchAndInit(userId, {
		    		viewName: 'dsUsersView',
						el: '#USERArch',
						workflow:'ds'
		        // folderCreate: params.dialog === 'foldercreate',
		        // dialog: params.dialog
		    });
		    // events.trigger('ds:selectUsers', params);
		    // events.trigger('ds:highlightItem', 'dsGirderView');
		});
		Router.route('view/user/:id/folder/:id', 'userFolder', function (userId, folderId, params) {
				events.trigger('HeaderView:navigateTo', 'View');
				events.trigger('panelContent:navigateTo', 'View');
		    UserView.fetchAndInit(userId, {
		        folderId: folderId,
		        // upload: params.dialog === 'upload',
		        // folderAccess: params.dialog === 'folderaccess',
		        // folderCreate: params.dialog === 'foldercreate',
		        // folderEdit: params.dialog === 'folderedit',
		        // itemCreate: params.dialog === 'itemcreate'
		        workflow:'ds',
		        viewName: 'dsUsersView',
						el: '#USERArch'
		    });
		    events.trigger('ds:selectUsers', params);
		    events.trigger('ds:highlightItem', 'dsUsersView');
		});
/*
		Router.route('view/collections', 'collections', function (params) {
				params={
					el:'.selectionDom'
				}
		    events.trigger('ds:selectCollections', params);
		    events.trigger('ds:highlightItem', 'dsSSRProjectView');
		    
		});
		*/
		Router.route('view/collection/:id', 'collectionAccess', function (cid, params) {
				events.trigger('HeaderView:navigateTo', 'View');
				events.trigger('panelContent:navigateTo', 'View');
				CollectionView.fetchAndInit(cid, {
	        // access: params.dialog === 'access',
	        // edit: params.dialog === 'edit',
	        // folderCreate: params.dialog === 'foldercreate',
	        // dialog: params.dialog
	        workflow:'ds',
	        viewName: 'dsSSRProjectView',
		    	el: '#SSRArch'
	    });
				// events.trigger('ds:selectCollections', params);
		    // events.trigger('ds:highlightItem', 'dsSSRProjectView');
		});
		Router.route('view/collection/:id/folder/:id', 'collectionFolder', function (cid, folderId, params) {
				events.trigger('HeaderView:navigateTo', 'View');
				events.trigger('panelContent:navigateTo', 'View');
		    CollectionView.fetchAndInit(cid, {
		        folderId: folderId,
		        // upload: params.dialog === 'upload',
		        // access: params.dialog === 'access',
		        // edit: params.dialog === 'edit',
		        // folderAccess: params.dialog === 'folderaccess',
		        // folderCreate: params.dialog === 'foldercreate',
		        // folderEdit: params.dialog === 'folderedit',
		        // itemCreate: params.dialog === 'itemcreate'
		        workflow:'ds',
		        viewName: 'dsSSRProjectView',
		    		el: '#SSRArch'
		    });
		    events.trigger('ds:selectCollections', params);
		    events.trigger('ds:highlightItem', 'dsSSRProjectView');
		});

		Router.route('view/saip', 'user', function (params) {
				events.trigger('HeaderView:navigateTo', 'View');
				events.trigger('panelContent:navigateTo', 'View');
				SaipView.fetchAndInit({
		        workflow:'ds',
		        viewName: 'dsSAIPProjectView',
		    		el: '#SAIPArch'
		    });
		    // events.trigger('ds:selectSAIP', params);
		    // events.trigger('ds:highlightItem', 'dsSAIPView');
		});




		
/*QC*/
		Router.route('qc', 'qc', function (params) {
			events.trigger('HeaderView:navigateTo', 'Link');
			events.trigger('panelContent:navigateTo', 'Link');
		});

		Router.route('qc/saip', 'users', function (params) {
			events.trigger('HeaderView:navigateTo', 'Link');
			events.trigger('panelContent:navigateTo', 'Link');
			SaipView.fetchAndInit({
		        workflow:'qc',
		        viewName: 'qcSAIPProjectView',
		    		el: '#mappingSAIPArch'
		    });
		    // events.trigger('qc:selectSAIP', params);
		    // events.trigger('qc:highlightItem', 'oriSAIPView');
		});
/*
		Router.route('seg_collections', 'collections', function (params) {
				params={
					el:'.g-seg-container'
				}
		    events.trigger('qc:selectCollections', params);
		    events.trigger('qc:highlightItem', 'segCollectionsView');
		    
		});

		Router.route('ori_collections', 'collections', function (params) {
				// console.log(Router)
				// console.log(Router._enabled)
				params={
					el:'.g-ori-container'
				}
		    events.trigger('qc:selectCollections', params);
		    events.trigger('qc:highlightItem', 'oriCollectionsView');
		});

		Router.route('ori_users', 'users', function (params) {
				params={
					el:'.g-ori-container'
				}
		    events.trigger('qc:selectUsers', params);
		    events.trigger('qc:highlightItem', 'oriUsersView');
		});
		Router.route('seg_users', 'users', function (params) {
				params={
					el:'.g-seg-container'
				}
		    events.trigger('qc:selectUsers', params);
		    events.trigger('qc:highlightItem', 'segUsersView');
		});


		Router.route('ori_preparations', 'collections', function (params) {
				// console.log(Router._enabled)
				params={
					el:'.g-ori-container'
				}
		    events.trigger('qc:selectPreparations', params);
		    events.trigger('qc:highlightItem', 'oriPreparationsView');
		});

		Router.route('seg_preparations', 'collections', function (params) {
				// console.log(Router._enabled)
				params={
					el:'.g-seg-container'
				}
		    events.trigger('qc:selectPreparations', params);
		    events.trigger('qc:highlightItem', 'segPreparationsView');
		});
*/
		// Router.route('ori_seg_user/:id', 'user', function (userId, params) {
		// 	UserView.fetchAndInit(userId, {
		//     		viewName: 'ori_segqcUsersView',
		// 				el: '.g-ori-seg-container'
		//         // folderCreate: params.dialog === 'foldercreate',
		//         // dialog: params.dialog
		//     });
		// });

		Router.route('qc/user/:id', 'user', function (userId, params) {
				events.trigger('HeaderView:navigateTo', 'Link');
				events.trigger('panelContent:navigateTo', 'Link');
		    UserView.fetchAndInit(userId, {
		    		viewName: 'qcUserView',
						el: '#mappingUSERArch'
		        // folderCreate: params.dialog === 'foldercreate',
		        // dialog: params.dialog
		    });
		    // console.log(this)
		});

		Router.route('qc/user/:id/folder/:id', 'userFolder', function (userId, folderId, params) {
		    events.trigger('HeaderView:navigateTo', 'Link');
				events.trigger('panelContent:navigateTo', 'Link');
		    UserView.fetchAndInit(userId, {
		        folderId: folderId,
		        // upload: params.dialog === 'upload',
		        // folderAccess: params.dialog === 'folderaccess',
		        // folderCreate: params.dialog === 'foldercreate',
		        // folderEdit: params.dialog === 'folderedit',
		        // itemCreate: params.dialog === 'itemcreate'
		        viewName: 'qcUserView',
						el: '#mappingUSERArch'
		    });
		});

		/*Router.route('ori_user/:id', 'user', function (userId, params) {
		    UserView.fetchAndInit(userId, {
		    		viewName: 'oriqcUsersView',
						el: '.g-ori-container'
		        // folderCreate: params.dialog === 'foldercreate',
		        // dialog: params.dialog
		    });
		    // console.log(this)
		});
		Router.route('ori_user/:id/folder/:id', 'userFolder', function (userId, folderId, params) {
		    UserView.fetchAndInit(userId, {
		        folderId: folderId,
		        // upload: params.dialog === 'upload',
		        // folderAccess: params.dialog === 'folderaccess',
		        // folderCreate: params.dialog === 'foldercreate',
		        // folderEdit: params.dialog === 'folderedit',
		        // itemCreate: params.dialog === 'itemcreate'
		        viewName: 'oriqcUsersView',
						el: '.g-ori-container'
		    });
		});*/
/*		
		Router.route('seg_user/:id', 'user', function (userId, params) {
			
		    UserView.fetchAndInit(userId, {
		    		viewName: 'segqcUsersView',
		    		el: '.g-seg-container'
		        // folderCreate: params.dialog === 'foldercreate',
		        // dialog: params.dialog
		    });
		    // console.log(this)
		});
		Router.route('seg_user/:id/folder/:id', 'userFolder', function (userId, folderId, params) {
		    UserView.fetchAndInit(userId, {
		        folderId: folderId,
		        // upload: params.dialog === 'upload',
		        // folderAccess: params.dialog === 'folderaccess',
		        // folderCreate: params.dialog === 'foldercreate',
		        // folderEdit: params.dialog === 'folderedit',
		        // itemCreate: params.dialog === 'itemcreate'
		        viewName: 'segqcUsersView',
						el: '.g-seg-container'
		    });
		});
*/
		
		Router.route('qc/collection/:id', 'collectionAccess', function (cid, params) {
				events.trigger('HeaderView:navigateTo', 'Link');
				events.trigger('panelContent:navigateTo', 'Link');
				CollectionView.fetchAndInit(cid, {
	        // access: params.dialog === 'access',
	        // edit: params.dialog === 'edit',
	        // folderCreate: params.dialog === 'foldercreate',
	        // dialog: params.dialog
	        viewName: 'qcSSRProjectView',
		    	el: '#mappingSSRArch'
	    });
		});
		Router.route('qc/collection/:id/folder/:id', 'collectionFolder', function (cid, folderId, params) {
		    events.trigger('HeaderView:navigateTo', 'Link');
				events.trigger('panelContent:navigateTo', 'Link');
		    CollectionView.fetchAndInit(cid, {
		        folderId: folderId,
		        // upload: params.dialog === 'upload',
		        // access: params.dialog === 'access',
		        // edit: params.dialog === 'edit',
		        // folderAccess: params.dialog === 'folderaccess',
		        // folderCreate: params.dialog === 'foldercreate',
		        // folderEdit: params.dialog === 'folderedit',
		        // itemCreate: params.dialog === 'itemcreate'
		        viewName: 'qcSSRProjectView',
		    		el: '#mappingSSRArch'
		    });
		});

		/*Router.route('ori_collection/:id', 'collectionAccess', function (cid, params) {
				CollectionView.fetchAndInit(cid, {
	        // access: params.dialog === 'access',
	        // edit: params.dialog === 'edit',
	        // folderCreate: params.dialog === 'foldercreate',
	        // dialog: params.dialog
	        viewName: 'oriqcSSRProjectView',
		    	el: '.g-ori-container'
	    });
		});
		Router.route('ori_collection/:id/folder/:id', 'collectionFolder', function (cid, folderId, params) {
		    CollectionView.fetchAndInit(cid, {
		        folderId: folderId,
		        // upload: params.dialog === 'upload',
		        // access: params.dialog === 'access',
		        // edit: params.dialog === 'edit',
		        // folderAccess: params.dialog === 'folderaccess',
		        // folderCreate: params.dialog === 'foldercreate',
		        // folderEdit: params.dialog === 'folderedit',
		        // itemCreate: params.dialog === 'itemcreate'
		        viewName: 'oriqcSSRProjectView',
		    		el: '.g-ori-container'
		    });
		});

		Router.route('seg_collection/:id', 'collectionAccess', function (cid, params) {
				CollectionView.fetchAndInit(cid, {
	        // access: params.dialog === 'access',
	        // edit: params.dialog === 'edit',
	        // folderCreate: params.dialog === 'foldercreate',
	        // dialog: params.dialog
	        viewName: 'segqcSSRProjectView',
		    	el: '.g-seg-container'
	    });
		});
		Router.route('seg_collection/:id/folder/:id', 'collectionFolder', function (cid, folderId, params) {
		    CollectionView.fetchAndInit(cid, {
		        folderId: folderId,
		        // upload: params.dialog === 'upload',
		        // access: params.dialog === 'access',
		        // edit: params.dialog === 'edit',
		        // folderAccess: params.dialog === 'folderaccess',
		        // folderCreate: params.dialog === 'foldercreate',
		        // folderEdit: params.dialog === 'folderedit',
		        // itemCreate: params.dialog === 'itemcreate'
		        viewName: 'segqcSSRProjectView',
		    		el: '.g-seg-container'
		    });
		});*/

/*Analysis*/
		Router.route('analysis', 'analysis', function (params) {
			events.trigger('HeaderView:navigateTo', 'Analysis');
			events.trigger('panelContent:navigateTo', 'Analysis');
		});

/*History*/
		Router.route('history', 'history', function (params) {
			events.trigger('HeaderView:navigateTo', 'History');
			events.trigger('panelContent:navigateTo', 'History');
		});
    return Router;
}

export default bindRoutes;