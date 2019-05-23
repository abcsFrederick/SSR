import jQuery from 'jquery';
import events from './events';
import eventStream from 'girder/utilities/EventStream';
import { logout, getCurrentUser,fetchCurrentUser, setCurrentUser } from 'girder/auth';
import { splitRoute } from 'girder/misc';
import Backbone from 'backbone';
import GirderApp from 'girder/views/App';
import './routes';
import router from './router';
import bindRoutes from './routes';

// import landingPage from './views/LandingPage';
import { restRequest } from 'girder/rest';
import layoutTemplate from './templates/layout/layout.pug';
import './stylesheets/layout/layout.styl';
// import LayoutHeaderUserTemplate from './templates/layout/layoutHeaderUser.pug';
// import './stylesheets/layout/layoutHeaderUser.styl';
import LayoutHeaderUserView from './views/layout/HeaderUserView';
import mappingSeg from './views/mappingSeg/mappingSeg'
import dataSource from './views/dataSource/dataSource';
import Workflow from './views/workflow/workflow';
import Visualization from './views/visualization/visualization';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import SlicerPanelGroup from 'girder_plugins/slicer_cli_web_SSR/views/PanelGroupSSR';
import FolderModel from 'girder/models/FolderModel';
import UserModel from 'girder/models/UserModel';
import CollectionModel from 'girder/models/CollectionModel';

import HeaderUserView from 'girder/views/layout/HeaderUserView';
var App = GirderApp.extend({
    events:{
        'click #QC':'QC',
        'click #dataSource':'dataSource',
        'click #workflow':'workflow',
        'click #history':'history',
        'click a.g-logout': function(){
            logout();
            this.render()
        },
        'click a.g-login': function () {
            events.trigger('g:loginUi');
        }
    },
    initialize(settings){
        this._started = false;
        settings = settings || {};
        this.contactEmail = settings.contactEmail || null;
        this.brandName = settings.brandName || null;
        this.bannerColor = settings.bannerColor || null;
        this.registrationPolicy = settings.registrationPolicy || null;
        this.enablePasswordLogin = _.has(settings, 'enablePasswordLogin') ? settings.enablePasswordLogin : true;
        
        this.userView = new LayoutHeaderUserView({
            parentView: this,
            registrationPolicy: settings.registrationPolicy
        });
        if (settings.start === undefined || settings.start) {
        //     fetchCurrentUser().done((afterFetch)=>{
        //         this.createWorkSpacePromise(afterFetch).then(_.bind((folder)=>{
        //             this.defaultFolder = folder;
                    this.start();
        //         },this))
        //     });
        }
        this.listenTo(events, 'query:step', this.stepRender);
    },
    render() {
	    
        // if(Backbone.History.started){

        // }
        // else{
        if (!this._started) {

            return;
        }
        this.$el.html(layoutTemplate());
       // }
        
        // this.$('.s-current-user-wrapper').html(LayoutHeaderUserTemplate({
        //         user: getCurrentUser()
        // }));
        console.log(Backbone.history.fragment)
        var route = splitRoute(Backbone.history.fragment).base;
        var routeQuery = '?'+splitRoute(Backbone.history.fragment).name;
        // Backbone.history.fragment = null;
        console.log(route)
        eventStream.close();

        this.userView.setElement(this.$('.g-current-user-wrapper')).render();
        if(getCurrentUser()){
            $('#login').hide();
            eventStream.open();
            router.navigate(routeQuery, {trigger: true});
            console.log('navigate');
            window.router=router

            this.controlPanel = new SlicerPanelGroup({
                parentView: this
            });
            restRequest({
              url:'collection',
              data:{'text':'SSR_Project'}
            }).then(_.bind((res)=>{
                let SSR_ProjectCollection = new CollectionModel(res[0])
                this.dataSourceView = new dataSource({
                    parentView:this,
                    controlPanel: this.controlPanel,
                    SSR_ProjectCollection: SSR_ProjectCollection || {},
                    currentUser: getCurrentUser()
                });
                
                $('#s-full-page-body-dataSource').html(this.dataSourceView.el);

                this.mappingSeg = new mappingSeg({
                    parentView:this,
                    currentUser:getCurrentUser(),
                    SSR_ProjectCollection: SSR_ProjectCollection || {},
                });
                $('#s-full-page-body-QC').html(this.mappingSeg.el);
            },this))


            // restRequest({
            //     url:'/folder/',
            //     type:'POST',
            //     data:{parentId: getCurrentUser().id, parentType:'user',name:'Workspace',reuseExisting:true,public:true}
            // }).done(_.bind(function(folder){
                this.defaultParentFolder = new FolderModel(this.defaultFolder)
                this.workflowView = new Workflow({
                    parentView:this,
                    controlPanel:this.controlPanel,
                    currentUser:getCurrentUser(),
                    defaultParentFolder:this.defaultParentFolder
                });
                $('#s-full-page-body-workflow').html(this.workflowView.el);

                // Backbone.history.stop();
                // Backbone.history.start({
                    // pushState: false
            //     });
            // },this));

            restRequest({
                url: 'SSR/'
            }).done(_.bind(function(records) {
                this.visualizationView = new Visualization({
                    records:records,
                    controlPanel:this.controlPanel,
                    defaultParentFolder:this.defaultParentFolder,
                    currentUser:getCurrentUser(),
                    parentView:this
                });
                $('#s-full-page-body-history').html(this.visualizationView.el)
            },this));

            this.createWorkSpacePromise(getCurrentUser()).then(_.bind((folder)=>{
                this.defaultFolder = folder;
            },this))
        }
        // }else{
        //     restRequest({
        //         url:'/nciLogin/authentication',
        //         type:'GET',
        //     }).done(_.bind(function(res){
        //         fetchCurrentUser().done(_.bind(function(res2){
        //             let currentUser = new UserModel(res2);
        //       //      console.log(currentUser)
        //             $('#login').hide();

        //             this.mappingSeg = new mappingSeg({
        //                 parentView:this,
        //                 currentUser:getCurrentUser()
        //             });
        //             $('#s-full-page-body-QC').html(this.mappingSeg.el);

        //             this.dataSourceView = new dataSource({
        //                 parentView:this,
        //                 currentUser:currentUser
        //             });
        //             $('#s-full-page-body-dataSource').html(this.dataSourceView.el)
        //             this.controlPanel = new SlicerPanelGroup({
        //                 parentView: this
        //             });
        //             restRequest({
        //                 url:'/folder/',
        //                 type:'POST',
        //                 data:{parentId: currentUser.id, parentType:'user',name:'Workspace',reuseExisting:true,public:true}
        //             }).done(_.bind(function(folder){
        //                 this.defaultParentFolder = new FolderModel(folder)
        //                 this.workflowView = new Workflow({
        //                     parentView:this,
        //                     controlPanel:this.controlPanel,
        //                     currentUser:currentUser,
        //                     defaultParentFolder:this.defaultParentFolder
        //                 });
        //                 $('#s-full-page-body-workflow').html(this.workflowView.el)
        //             },this))
        //             restRequest({
        //                 url: 'SSR/'
        //             }).done(_.bind(function(records) {
        //                 this.visualizationView = new Visualization({
        //                     records:records,
        //                     controlPanel:this.controlPanel,
        //                     currentUser:currentUser,
        //                     parentView:this
        //                 });
        //                 $('#s-full-page-body-history').html(this.visualizationView.el)
        //             },this));
        //         },this));
                
        //         this.createWorkSpacePromise(currentUser).then(_.bind((folder)=>{
        //             this.defaultFolder = folder;
        //         },this))
        //     },this));
        // }
        /*this.landingPage = new landingPage({
            el: '#s-full-page-body',      //in layoutTemplate ./templates/layout/layout.pug
            parentView: this
        });*/
        /*$.ajax({
                url:"http://fr-s-ivg-ssr-d1:8090/api/v1/nciLogin/authentication/",
                type:"GET",
                xhrFields: {
                  withCredentials: true
                },
                success:_.bind(function(res){
                    console.log(res);
                })
        })*/

    },
    // start: function (settings) {
    //     // start is a noop if the app is already running
    //     var promise = new $.Deferred().resolve(null).promise();
    //     if (this._started) {
    //         return promise;
    //     }

    //     // set defaults
    //     settings = _.defaults(settings || {}, {
    //         fetch: true,
    //         render: true,
    //         history: true
    //     });

    //     // define a function to be run after fetching the user model
    //     var afterFetch = (user) => {
    //         this._createLayout();

    //         if (user) {
    //             setCurrentUser(new UserModel(user));
    //             eventStream.open();
    //         }

    //         this._started = true;

    //         if (settings.render) {
    //             this.render();
    //         }
    //         console.log('this.render')
    //         if (settings.history) {
    //             Backbone.history.stop();
    //             Backbone.history.start({
    //                 pushState: false
    //             });
    //         }
    //     };

    //     // If fetching the user from the server then we return the jqxhr object
    //     // from the request, otherwise just call the callback.
    //     if (settings.fetch) {
    //         promise = fetchCurrentUser()
    //             .done(afterFetch);
    //     } else {
    //         afterFetch(null);
    //     }

    //     this.bindGirderEvents();
    //     return promise;
    // },

    navigateTo(view) {
    //    console.log(this.bodyView instanceof view)
        if (this.bodyView instanceof view) {
            return this;
        }
        return GirderApp.prototype.navigateTo.apply(this, arguments);
    },
    QC:function(){
        var route = splitRoute(Backbone.history.fragment).base;
        // $('.image_name').show()
        // $('#dataSource').addClass('active')
        // $('#workflow').removeClass('active')
        // $('#history').removeClass('active')
        console.log('click QC');
        
        router.enabled(1);
        router.navigate(route, {trigger: true});
        router.setQuery('step','QC', {trigger: true});
        // if(this.dataSourceView){
        //     this.dataSourceView.destroy()    //prevent from zombie view
        // }
        
        $('#s-full-page-body-QC').show()
        $('#s-full-page-body-dataSource').hide()
        $('#s-full-page-body-workflow').hide()
        $('#s-full-page-body-history').hide()
    },
    dataSource:function(){
        console.log('click dataSource')
        var route = splitRoute(Backbone.history.fragment).base;
        router.enabled(1);
        router.navigate(route, {trigger: true});
        // $('.image_name').show()
        // $('#dataSource').addClass('active')
        // $('#workflow').removeClass('active')
        // $('#history').removeClass('active')
        router.setQuery('step','dataSource', {trigger: true});
        // if(this.dataSourceView){
        //     this.dataSourceView.destroy()    //prevent from zombie view
        // }
        
        $('#s-full-page-body-QC').hide()
        $('#s-full-page-body-dataSource').show()
        $('#s-full-page-body-workflow').hide()
        $('#s-full-page-body-history').hide()
    },
    workflow:function(){
        var route = splitRoute(Backbone.history.fragment).base;
        router.enabled(1);
        router.navigate(route, {trigger: true});
        // $('.image_name').hide()
        // $('#dataSource').removeClass('active')
        // $('#workflow').addClass('active')
        // $('#history').removeClass('active')
        router.setQuery('step','workflow', {trigger: true});
        
        $('#s-full-page-body-QC').hide()
        $('#s-full-page-body-dataSource').hide()
        $('#s-full-page-body-workflow').show()
        $('#s-full-page-body-history').hide()
    },
    history:function(){
        var route = splitRoute(Backbone.history.fragment).base;
        router.enabled(1);
        router.navigate(route, {trigger: true});
        // $('.image_name').hide()
        // $('#dataSource').removeClass('active')
        // $('#workflow').removeClass('active')
        // $('#history').addClass('active');
        router.setQuery('step','history', {trigger: true});
        
        $('#s-full-page-body-QC').hide()
        $('#s-full-page-body-dataSource').hide()
        $('#s-full-page-body-workflow').hide()
        $('#s-full-page-body-history').show()
    },
    stepRender(step){
        if(step === 'QC'){
            $('.image_name').hide()
            $('#QC').addClass('active')
            $('#dataSource').removeClass('active')
            $('#workflow').removeClass('active')
            $('#history').removeClass('active')
            
            $('#s-full-page-body-QC').show()
            $('#s-full-page-body-dataSource').hide()
            $('#s-full-page-body-workflow').hide()
            $('#s-full-page-body-history').hide()
        }
        if(step === 'dataSource'){
            $('.image_name').show()
            $('#QC').removeClass('active')
            $('#dataSource').addClass('active')
            $('#workflow').removeClass('active')
            $('#history').removeClass('active')
            
            $('#s-full-page-body-QC').hide()
            $('#s-full-page-body-dataSource').show()
            $('#s-full-page-body-workflow').hide()
            $('#s-full-page-body-history').hide()
        }
        if(step === 'workflow'){
            $('.image_name').hide()
            $('#QC').removeClass('active')
            $('#dataSource').removeClass('active')
            $('#workflow').addClass('active')
            $('#history').removeClass('active')
            
            $('#s-full-page-body-QC').hide()
            $('#s-full-page-body-dataSource').hide()
            $('#s-full-page-body-workflow').show()
            $('#s-full-page-body-history').hide() 
        }
        if(step === 'history'){
            $('.image_name').hide()
            $('#QC').removeClass('active')
            $('#dataSource').removeClass('active')
            $('#workflow').removeClass('active')
            $('#history').addClass('active');
            
            $('#s-full-page-body-QC').hide()
            $('#s-full-page-body-dataSource').hide()
            $('#s-full-page-body-workflow').hide()
            $('#s-full-page-body-history').show()
        }
    },
    createWorkSpacePromise(afterFetch){
        return new Promise(function(resolve,reject){
            restRequest({
                url:'/folder/',
                type:'POST',
                data:{parentId:afterFetch.id, parentType:'user',name:'Workspace',reuseExisting:true,public:true}
            }).done(function(folder){
                resolve(folder)
            });
        },this)
    },
    bindRoutes: bindRoutes

});
export default App;