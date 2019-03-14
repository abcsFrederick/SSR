import View from 'girder/views/View';
import landingPageLayout from '../templates/layout/LandingPageLayout.pug'
//import scippyDB from './scippy/scippy';
// import orthancDB from './orthancDB/orthancDB';
// import filesystem from './filesystem/filesystem';
// import girderDB from './girder/girder';
import events from '../events';
import router from '../router';
import BrowserWidget from 'girder/views/widgets/BrowserWidget';
import '../stylesheets/layout/layout.styl'
var landingPage = View.extend({
	events:{
	// 	'click #dataSource':'dataSource',
	// 	'click #orthanc':'Orthanc',
	// //	'click #scippy':'Scippy',
	// 	'click #girder':'Girder',
	// 	'click #filesystem':'Filesystem'
	},
	initialize(){
		this.render();
	},
	render(){
		// this.$el.html(landingPageLayout());
		return this;
	},
	// Orthanc(){
	// 	if(this.orthancDBView){
	// 		this.orthancDBView.destroy()	//prevent from zombie view
	// 	}
	// 	this.orthancDBView = new orthancDB({
	// 		parentView:this
	// 	});
	// 	$('.content').html(this.orthancDBView.el)
	// },
	// // Scippy(){
	// // 	if(this.scippyDBView){
	// // 		this.scippyDBView.destroy()	//prevent from zombie view
	// // 	}
	// // 	this.scippyDBView = new scippyDB({
	// // 		parentView:this
	// // 	});
	// // 	$('.content').html(this.scippyDBView.el)
	// // },
	// Girder(){
	// 	if(this.girderDBView){
	// 		this.girderDBView.destroy()	//prevent from zombie view
	// 	}
	// 	this.girderDBView = new girderDB({
	// 		parentView:this
	// 	});
	// 	$('.content').html(this.girderDBView.el)
	// },
	// Filesystem:function(){

	// 	if(this.filesystemView){
	// 		this.filesystemView.destroy()	//prevent from zombie view
	// 	}
	// 	this.filesystemView = new filesystem({
	// 		parentView:this
	// 	});
	// 	$('.content').html(this.filesystemView.el)
	
	// }
});

export default landingPage;