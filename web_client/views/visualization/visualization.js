import View from 'girder/views/View';
import events from '../../events';
import { restRequest } from 'girder/rest';
import VisualizationTemplate from '../../templates/visualization/visualization.pug';
import { getCurrentUser } from 'girder/auth';
import d3Heatmap from 'girder_plugins/d3_plugin/views/d3Heatmap';
import 'datatables.net';
import '../../stylesheets/visualization/visualization.styl';
import router from '../../router';
import VisualizationSelection from '../workflow/VisualizationSelection';
import TasksView from './panels/tasksView';

var visualization = View.extend({
	events:{
		'click #recordsCollapse':'recordsCollapse',
		'click #records tbody tr':'reproduce',
    'click .g-nav-link-user': 'findTasks'
	},
	initialize(setting){
    let user = setting.currentUser;
    if(user.get('admin')){
      restRequest({
        url: 'user'
      }).done(_.bind(function(res){
        console.log(res)
        this.$el.html(VisualizationTemplate({
          users: res
        }))
      },this))
    }else{
      restRequest({
        url: 'user/me'
      }).done(_.bind(function(res){
        console.log(res)
        this.$el.html(VisualizationTemplate({
          users: [res]
        }))
      },this))
    }
  	// this.recordsRender();
    this.d3HeatmapViewer = new d3Heatmap({
		//el:'.resultVisualizer',
		  parentView:this
		});
    this.controlPanel = setting.controlPanel;
    this.listenTo(events, 'query:d3Visualizer', this.d3Visualizer);
    this.listenTo(events, 'query:amiVisualizer', this.amiVisualizer);
	},
  findTasks(e){
    this.deactivateAll();
    let link = $(e.currentTarget);
    let currentTargetClass = link.attr('user');
    console.log(currentTargetClass)
    if($(e.target).hasClass('icon-left-dir')){
        this.$('.' + currentTargetClass + ' > .icon-right-dir').show();
        this.$('.' + currentTargetClass + ' > .icon-left-dir').hide();
        $('.history-task').css('display','none');
        $('.history-title').css('display','none');
        $('.history-date').css('display','none');
        link.parent().addClass('g-active');
    }
    else if($(e.target).hasClass('icon-right-dir')){
        this.$('.' + currentTargetClass + ' > .icon-left-dir').show();
        this.$('.' + currentTargetClass + ' > .icon-right-dir').hide();
        $('.history-task').css('display','inline-block');
        $('.history-task').css('height','inherit');
        $('.history-title').css('display','inline-block');
        $('.history-title').css('height','inherit');
        $('.history-date').css('display','inline-block');
        $('.history-date').css('height','inherit');
        link.parent().addClass('g-active');
    }
    else{
        this.$('.' + currentTargetClass + ' > .icon-right-dir').hide();
        this.$('.' + currentTargetClass + ' > .icon-left-dir').show();
        link.parent().addClass('g-active');
        if(link.parent().hasClass('g-active')){
            $('.history-task').css('display','inline-block');
            $('.history-tasks').css('height','inherit');
            $('.history-title').css('display','inline-block');
            $('.history-title').css('height','inherit');
            $('.history-date').css('display','inline-block');
            $('.history-date').css('height','inherit');
        }else{
            $('.history-task').css('display','none');
            $('.history-title').css('display','none');
            $('.history-date').css('display','none');
        }

        restRequest({
            url: 'SSR',
            data:{userId:e.currentTarget.id}
        }).done(_.bind(function(tasks) {
          let dockerImages = [];
          var uniqueDockerImages = [];
          for(let a = 0; a < tasks.length; a++){
            dockerImages.push(tasks[a].task.dockerImage);
          }
          $.each(dockerImages, function(i, el){
              if($.inArray(el, uniqueDockerImages) === -1) uniqueDockerImages.push(el);
          });
          console.log('click');
          if(this.tasksView){
            this.tasksView.destroy()
          }
          this.tasksView = new TasksView({
            userId:e.currentTarget.id,
            dockerImages: uniqueDockerImages,
            parentView:this
          })
          $('.history-task').html(this.tasksView.el);
        },this))
    }
  },
	// recordsRender(){
	// 	restRequest({
 //            url: 'SSR/'
 //        }).done(_.bind(function(records) {
 //        	 window.record = records;
	// 		this.records_table = $('#records').DataTable({
	//     		data:records,
	//     		rowId: 'job.jobId',
	//     		'createdRow': function( row, data, dataIndex ) {
	//     			if(data.job.status===3)
	//     			{
	//     				$(row).addClass('Success');
	//     			}else if(data.job.status===2)
	//     			{
	//     				$(row).addClass('Running');
	//     			}else if(data.job.status===1)
	//     			{
	//     				$(row).addClass('Queued');
	//     			}else if(data.job.status===4)
	//     			{
	//     				$(row).addClass('Error');
	//     			}else if(data.job.status===5)
	//     			{
	//     				$(row).addClass('Canceled');
	//     			}
	// 			},
	//     		columns: [
	//     		{
	// 	            "targets": 0,
	// 	            "render": _.bind(function ( data, type, full, meta ) {
	// 	            		return full.creator.firstName + ' ' + full.creator.lastName 
	// 	            },this)
	// 	    	},
	//     		{
 //    			"targets": 1,
	// 	            "render": _.bind(function ( data, type, full, meta ) {
	// 	            		return new Date(full.created).getFullYear() +'-'+new Date(full.created).getMonth()+'-'+new Date(full.created).getDate();
	// 	            },this)
	// 	    	},
	//     		{
	//     			data:'task.dockerImage'
	//     		},
	//     		{
	//     			"targets": -1,
	// 	            "render": _.bind(function ( data, type, full, meta ) {
	// 	            		return full.task.title.substring(full.task.title.indexOf('.')+1,)
	// 	            },this)
	// 	    	},
	//     		],
	// 	        destroy: true,
	// 			"lengthMenu":[[-1],['ALL']],
	// 			"scrollY": "500px",
	// 			"scrollCollapse": true,
	// 			"dom":' rt'
	//     	})
 //    	},this));
	// },
	d3Visualizer(file){
		console.log('hello')
		let input = 'api/v1/file/'+file+'/download?contentDisposition=attachment';
		if(this.previewInput !== input){
			if(this.d3HeatmapViewer){

				this.d3HeatmapViewer.destroy();

			}
			if(this.amiViewer){
				this.amiViewer.destroy();
			}
			console.log(this.previewInput)
			console.log(input)
			this.d3HeatmapViewer.setElement('.resultVisualizer').render(input);
			this.previewInput = input
		}
		
		//this.d3HeatmapViewer.render(input);
	},
	amiVisualizer(VisualizerTool){
		console.log(VisualizerTool)
	},
	recordsCollapse(){
		$('.wrapper').toggleClass('active');
	},
	reproduce(e){
		let reproduceJobId = $(e.currentTarget).attr('id');
		restRequest({
        url: 'SSR/',
        data:{jobId:reproduceJobId}
    }).done(_.bind(function(reproduceRecords) {

    	let reVisualizerTool,
    		reVisualizerTarget,
    		reAnalysisTask,
    		reJobId,
    		rePreviewFolder,
    		rePreviewFile,
    		rePreviewSEG;

    	reJobId = reproduceRecords[0].job.jobId;
    	reVisualizerTool = reproduceRecords[0].visualizer.Name;
    	reVisualizerTarget = reproduceRecords[0].visualizer.TargetId;

    	router.setQuery('JobProgress',reJobId, {trigger: true});
    	console.log(this.previewReVisualizerTool)
    	console.log(reVisualizerTool)
    	console.log(this.previewReVisualizerTarget)
    	console.log(reVisualizerTarget)
    	if(reVisualizerTool !== undefined||reVisualizerTarget !== undefined){
    		if(this.previewReVisualizerTool!==reVisualizerTool||this.previewReVisualizerTarget !== reVisualizerTarget){
      		router.setQuery(reVisualizerTool, reVisualizerTarget, {trigger: true});
      		console.log('0');
      	}
    	}else{
    		console.log('1');
    		router.setQuery(this.previewReVisualizerTool, null, {trigger: true});
    		this.previewInput = null;
  			if(this.d3HeatmapViewer){
    			this.d3HeatmapViewer.destroy();
    		}
    		if(this.amiViewer){
    			this.amiViewer.destroy();
    		}
    	}
    	this.previewReVisualizerTool = reVisualizerTool;
    	this.previewReVisualizerTarget = reVisualizerTarget;
        	
			let pluginTitle,
				dockerImageName,
				dockerTaskTitle,
				queryString,
				queryStringForPreview;

			//	slicer_cli_web_SSR
			pluginTitle = reproduceRecords[0].task.title.slice(0,reproduceRecords[0].task.title.indexOf('.'));
			//	featureCor	
			dockerTaskTitle = reproduceRecords[0].task.title.slice(reproduceRecords[0].task.title.indexOf('.')+1);
			//	radiomicsfeatures_RadiologyTK
			dockerImageName = reproduceRecords[0].task.dockerImage.replace(':','_');

			reAnalysisTask = '/'+pluginTitle+'/'+dockerImageName+'/'+dockerTaskTitle;

			router.setQuery('analysisTask', reAnalysisTask, {trigger: true});
			this.controlPanel.setElement('.analysesTask').render();

			if(this.visualizationPanel){
				this.visualizationPanel.destroy()
			}
			this.visualizationPanel = new VisualizationSelection({
				jobId:reJobId,
      	parentView:this
      });
      $('.Visualization').html(this.visualizationPanel.el);
			$('#'+reVisualizerTool).addClass('active');
			console.log('#'+reVisualizerTool)

			if(reproduceRecords[0].task.inputs.ReferenceImages!=undefined&&reproduceRecords[0].task.inputs.ReferenceLabel==undefined){
				queryString = reproduceRecords[0].task.inputs.ReferenceImages.id;
			//	router.setQuery('PreviewFile',queryString, {trigger: true});
				router.setQuery('PreviewFolder',queryString, {trigger: true});
			//	router.setQuery('PreviewFile',queryString, {trigger: true});
			}
			else if(reproduceRecords[0].task.inputs.ReferenceLabel!=undefined){

				var getPreviewFileFolder = (ORIFolderid) => {
		    	return restRequest({
	            url: 'item',
	            data:{folderId:ORIFolderid,sort:'name',limit:1000}
	        }).then((items) => {
	        	if (!items.length) {
	                throw new Error('Folder does not contain an item.');
	            }
	        	return items[0]['_id']
	        });
		    };
		    var getPreviewSEGItem = (SEGItemid) => {
		    	return restRequest({
	            url: 'item/' + SEGItemid + '/files',
	            data:{sort:'name',limit:1000}
	        }).then((files) => {
	        	if (!files.length) {
	                throw new Error('Item does not contain a file.');
	            }
	        	return files[0]['_id']
	        });
		    };

		    let promise;
		    return promise = $.when(getPreviewFileFolder(reproduceRecords[0].task.inputs.ReferenceImages.id),getPreviewSEGItem(reproduceRecords[0].task.inputs.ReferenceLabel.id))
          .then((a,b)=>{
    				queryString = reproduceRecords[0].task.inputs.ReferenceImages.id+'@'+reproduceRecords[0].task.inputs.ReferenceLabel.id;
    				//	router.setQuery('PreviewFileAndSEG',queryString, {trigger: true});
    				queryStringForPreview = a+'@'+b;
    				router.setQuery('PreviewFolderAndSEG',queryString, {trigger: true});
    				//	router.setQuery('PreviewFileAndSEG',queryStringForPreview, {trigger: true});
  				});
			}

    },this))
	},
  deactivateAll(){ 
      this.$('.icon-left-dir').hide();
      this.$('.icon-right-dir').hide();
      this.$('.g-global-nav-li').removeClass('g-active');
  }
});

export default visualization;