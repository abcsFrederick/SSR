import View from 'girder/views/View';
import { restRequest } from 'girder/rest';
import worflowTemplate from '../../templates/workflow/workflow.pug';
import workflowNavTemplate from '../../templates/workflow/workflowNav.pug';
import analysesHeadersTemplate from '../../templates/analysis/analysesHeadersTemplate.pug';
import '../../stylesheets/analysis/analysesHeaders.styl';
import router from '../../router';
import VisualizationSelection from './VisualizationSelection';
import events from '../../events';
import FolderModel from 'girder/models/FolderModel';
import ItemModel from 'girder/models/ItemModel';
import JobDetailsWidget from '../widgets/JobDetailsWidget';
import JobModel from 'girder_plugins/jobs/models/JobModel';
import eventStream from 'girder/utilities/EventStream';
import Visualization from '../visualization/visualization';

import '../../stylesheets/workflow/workflow.styl';
// import 'bootstrap';
// import 'bootstrap/dist/css/bootstrap.css';
var workflow = View.extend({
	events:{
		'click .analysisTask': '_setAnalysisTask',
        'click .g-nav-link':'setAnalysisTask'
	},
	initialize(setting){
        this.$el.html(worflowTemplate());
		this.defaultParentFolder = setting.defaultParentFolder;
        this.visualizationView = setting.parentView.visualizationView;
		Array.prototype.unique = function() {
		    var a = this.concat();
		    for(var i=0; i<a.length; ++i) {
		        for(var j=i+1; j<a.length; ++j) {
		            if(a[i] === a[j])
		                a.splice(j--, 1);
		        }
		    }

		    return a;
		};
        
		restRequest({
            url: 'slicer_cli_web_SSR/slicer_cli_web_SSR/docker_image'
        }).then(_.bind((analyses) => {
          	this.analyses=analyses
          	let diffTags = [];
            //testing
            /*analyses = {  
               "itk":{  
                  "RadiologyTK":{  
                     "BinaryThreshold":{  
                        "run":"/slicer_cli_web_SSR/itk_RadiologyTK/BinaryThreshold/run",
                        "type":"cxx",
                        "xmlspec":"/slicer_cli_web_SSR/itk_RadiologyTK/BinaryThreshold/xmlspec"
                     },
                     "OtsuThreshold":{  
                        "run":"/slicer_cli_web_SSR/itk_RadiologyTK/OtsuThreshold/run",
                        "type":"cxx",
                        "xmlspec":"/slicer_cli_web_SSR/itk_RadiologyTK/OtsuThreshold/xmlspec"
                     },
                     "itkNrrdOtsuThresholding":{  
                        "run":"/slicer_cli_web_SSR/itk_RadiologyTK/itkNrrdOtsuThresholding/run",
                        "type":"cxx",
                        "xmlspec":"/slicer_cli_web_SSR/itk_RadiologyTK/itkNrrdOtsuThresholding/xmlspec"
                     },
                     "pydicomSplit":{  
                        "run":"/slicer_cli_web_SSR/itk_RadiologyTK/pydicomSplit/run",
                        "type":"python",
                        "xmlspec":"/slicer_cli_web_SSR/itk_RadiologyTK/pydicomSplit/xmlspec"
                     },
                     "segMatch":{  
                        "run":"/slicer_cli_web_SSR/itk_RadiologyTK/segMatch/run",
                        "type":"python",
                        "xmlspec":"/slicer_cli_web_SSR/itk_RadiologyTK/segMatch/xmlspec"
                     }
                  }
               },
               "radiomics":{  
                  "RadiologyTK":{  
                     "featuresExtraction":{  
                        "run":"/slicer_cli_web_SSR/radiomics_RadiologyTK/featuresExtraction/run",
                        "type":"python",
                        "xmlspec":"/slicer_cli_web_SSR/radiomics_RadiologyTK/featuresExtraction/xmlspec"
                     }
                  },
                  "HistomicsTK":{  
                     "featuresExtraction":{  
                        "run":"/slicer_cli_web_SSR/radiomics_RadiologyTK/featuresExtraction/run",
                        "type":"python",
                        "xmlspec":"/slicer_cli_web_SSR/radiomics_RadiologyTK/featuresExtraction/xmlspec"
                     }
                  }
               },
               "radiomicsfeature":{  
                  "RadiologyTK":{  
                     "featureCor":{  
                        "run":"/slicer_cli_web_SSR/radiomicsfeature_RadiologyTK/featureCor/run",
                        "type":"python",
                        "xmlspec":"/slicer_cli_web_SSR/radiomicsfeature_RadiologyTK/featureCor/xmlspec"
                     },
                     "featuresExtraction":{  
                        "run":"/slicer_cli_web_SSR/radiomicsfeature_RadiologyTK/featuresExtraction/run",
                        "type":"python",
                        "xmlspec":"/slicer_cli_web_SSR/radiomicsfeature_RadiologyTK/featuresExtraction/xmlspec"
                     }
                  }
               }
            }*/
          	Object.keys(analyses).forEach(function(value) {
				diffTags=[...diffTags,..._.keys(analyses[value])]
			})
			diffTags=diffTags.unique();
            // window.analyses = analyses ;
            this.$('.analysesNames').html(workflowNavTemplate({
                navItems: Object.keys(analyses),
                tags: diffTags
            }));
          	// $('.analysesHeaders').html(analysesHeadersTemplate({
          	// 	analyses:analyses,
          	// 	diffTags:diffTags
          	// }));
            return null;
        },this));

        this.controlPanel = setting.controlPanel;
        // console.log('workflow initialize')
        // this.listenTo(events, 'query:workSpaceFolder', this.workSpaceFolderSetInputs);
  //       this.listenTo(events, 'query:PreviewFolder', this.PreviewFileSetInputs);
		// this.listenTo(events, 'query:PreviewFolderAndSEG', this.PreviewFileAndSEGSetInputs);
        this.listenTo(events, 'query:editSegmentationFolderId', this.editSegmentationFolderId);
		this.listenTo(events,'query:JobProgress',this.JobProgressRender);
        this.listenTo(events, 'query:analysisTask', this.selectAnalysisTask);
        this.listenTo(events, 'query:setupOutputFolder', this.setupOutputFolder);
		this.listenTo(eventStream, 'g:event.job_status', function (event) {
			var info = event.data;
			if (info._id === this.job.id) {
                console.log(info.status)
				if(info.status===3){
					if(this.visualizationPanel){
						this.visualizationPanel.destroy()
					}
					this.visualizationPanel = new VisualizationSelection({
						jobId:this.job.id,
			        	parentView:this
			        });
			        $('.Visualization').html(this.visualizationPanel.el);
					
				}
			}
        })

	},
    setAnalysisTask(e){

        this.deactivateAll();
        let link = $(e.currentTarget);
        let currentTargetClass = link.text();
        // console.log('$(e.target)')
        // if($(e.target).hasClass('icon-left-dir')){
        //     this.$('.' + currentTargetClass + ' > .icon-right-dir').show();
        //     this.$('.' + currentTargetClass + ' > .icon-left-dir').hide();
        //     $('.analyses').css('display','none');
        //     link.parent().addClass('g-active');
        // }
        // else if($(e.target).hasClass('icon-right-dir')){
        //     this.$('.' + currentTargetClass + ' > .icon-left-dir').show();
        //     this.$('.' + currentTargetClass + ' > .icon-right-dir').hide();
        //     $('.analyses').css('display','inline-block');
        //     $('.analyses').css('height','inherit');
        //     link.parent().addClass('g-active');
        // }
        // else{
            let currentAnalysis = $(e.currentTarget).attr('g-name');
            let analysis = this.analyses[currentAnalysis];
            let currentAnalysisTag = $(e.currentTarget).attr('g-tag');
            
            this.$('.analysesTag[g-name='+currentAnalysis+']').html(analysesHeadersTemplate({
                analysis:analysis,
                tag:currentAnalysisTag
            }));
            this.$('.' + currentTargetClass + ' > .icon-right-dir').hide();
            this.$('.' + currentTargetClass + ' > .icon-left-dir').show();
            link.parent().addClass('g-active');
            if(link.parent().hasClass('g-active')){
                $('.analyses').css('display','inline-block');
                $('.analyses').css('height','inherit');
            }else{
                $('.analyses').css('display','none');
            }
        // }
    },
    _setAnalysisTask(evt) {
        evt.preventDefault();
        let link = $(evt.currentTarget);
        var target = $(evt.currentTarget).data();
        console.log(link.parent())
        // link.parent().addClass('active');

        // link.parent().css('background-color','rgba(234, 235, 234, 0.4);');
        router.setQuery('analysisTask', target.api, {trigger: true});
        this.controlPanel.setElement('.analysisControl').render();
    },
    selectAnalysisTask(evt){
        restRequest({
            url: 'slicer_cli_web_SSR/slicer_cli_web_SSR/docker_image'
        }).then(_.bind((analyses) => {
            this.analyses=analyses
            let diffTags = [];
            Object.keys(analyses).forEach(function(value) {
                diffTags=[...diffTags,..._.keys(analyses[value])]
            })
            diffTags=diffTags.unique();
            // window.analyses = analyses ;
            // this.$el.html(worflowTemplate({
            //     navItems: Object.keys(analyses),
            //     tags: diffTags
            // }));
            // console.log('selectAnalysisTask');
            this.deactivateAll();
            // console.log('selectAnalysisTask');
            // console.log(evt);
            let analysis_currentAnalysisTag = evt.split('/')[2];
            let task = evt.split('/')[3];
            let currentAnalysis = analysis_currentAnalysisTag.split('_')[0];
            let analysis = this.analyses[currentAnalysis];
            let currentAnalysisTag = analysis_currentAnalysisTag.split('_')[1];
            this.$('.analysesTag[g-name='+currentAnalysis+']').html(analysesHeadersTemplate({
                analysis:analysis,
                tag:currentAnalysisTag
            }));
            $('.analysesTag[g-name=' + currentAnalysis + ']').collapse('show');
            $('.s-task-list').removeClass('active');

            $('.'+task).addClass('active');
            // $('.'+task).css('background-color','rgba(234, 235, 234, 0.4)');
            // this.$('.' + currentAnalysis + ' > .icon-right-dir').hide();
            // this.$('.' + currentAnalysis + ' > .icon-left-dir').show();
            $('.' + currentAnalysis).parent().addClass('g-active');
            // console.log($('.analysisControl'));
            this.controlPanel.setElement('.analysisControl').render();
            // this.controlPanel.setElement('.analysisControl').render();
            
        },this));
    },

    workSpaceFolderSetInputs(e){
        // console.log('workflow');
        restRequest({
            url: 'folder/' + e,
        }).then((e) => {

            // console.log('workflow');
            let randomName = Date.now();
            let folder = new FolderModel(e);
            _.each(this.controlPanel.models(), (model) => {
                // console.log(model);
                // console.log(folder);
                if (model.get('type') === 'directory') {
                    if(model.get('flag')==""||model.get('flag')=="Original"){
                        model.set('value', folder, {trigger: true}); 
                    }
                    else{

                    }
                }
                if (model.get('type') === 'new-file') {
                    model.set({ parent:this.defaultParentFolder,
                        value: this.defaultParentFolder.set({'name':randomName+model.get('ext')})
                    })              
                }
            })
        });
    },
    /*PreviewFileSetInputs(e){
    	restRequest({
            url: 'folder/' + e,
        }).then((e) => {
            console.log('workflow');

        	let randomName = Date.now();
        	let folder = new FolderModel(e);
			_.each(this.controlPanel.models(), (model) => {
                console.log(model);
                console.log(folder);
				if (model.get('type') === 'directory') {
	                model.set('value', folder, {trigger: true});
	            }
	            if (model.get('type') === 'new-file') {
	                model.set({ parent:this.defaultParentFolder,
                        value: this.defaultParentFolder.set({'name':randomName+model.get('ext')})
                    })	            
	            }
			})
        });
    	
    },
    PreviewFileAndSEGSetInputs(e){
    	let ORIFolderid = e.slice(0,e.indexOf('@'));
    	let SEGItemid = e.slice(e.indexOf('@')+1);
    	var getPreviewFileFolder = (ORIFolderid) => {
	    	return restRequest({
	            url: 'folder/' + ORIFolderid,
	        }).then((e) => {
	        	return new FolderModel(e)
	        });
	    };
	    var getPreviewSEGItem = (SEGItemid) => {
	    	return restRequest({
	            url: 'item/' + SEGItemid,
	        }).then((e) => {
	        	return new ItemModel(e)
	        });
	    };
	    let promise;
        return promise = $.when(getPreviewFileFolder(ORIFolderid),getPreviewSEGItem(SEGItemid)).then((a,b)=>{
        	let randomName = Date.now();
        	_.each(this.controlPanel.models(), (model) => {
                // console.log('-------Before--------')
                // console.log(model);
                // console.log(a);
                // console.log(b);
                if (model.get('type') === 'directory') {
                    model.set('value', a, {trigger: true});
                }
                if (model.get('type') === 'item') {
                    model.set('value', b, {trigger: true});
                }
                if (model.get('type') === 'new-file') {
	                model.set({ parent:this.defaultParentFolder,
                        value: this.defaultParentFolder.set({'name':randomName+model.get('ext')})
                    })
	            }
                // console.log('-------After--------')
                // console.log(model);
        	});
        })
    	
    },*/
    JobProgressRender(e){
        console.log('JobProgressRender');
    	restRequest({
            url: 'job/' + e,
        }).then((e) => {
        	this.job = new JobModel(e)
        	if(this.jobDetailsWidgetView){
        		this.jobDetailsWidgetView.destroy()
        	}
        	this.jobDetailsWidgetView = new JobDetailsWidget({
        		job:this.job,
        		parentView:this
        	});
            window.processingDom = $('.Processing')
        	this.jobDetailsWidgetView.setElement('.Processing').render();
        });
        restRequest({
            url: 'SSR/'
        }).done(_.bind(function(records) {
            console.log(this.visualizationView)
        },this));
    },
    setupOutputFolder(TaskFolderId){
        restRequest({
            url: 'folder/' + TaskFolderId,
        }).then(_.bind((e) => {
            let TaskFolder = new FolderModel(e)
            this.defaultParentFolder = TaskFolder;

            _.each(this.controlPanel.models(), (model) => {
                // console.log(model)    
                if (model.get('type') === 'new-directory') {
                    model.set({ 
                        parent:this.defaultParentFolder,
                    })  
                    console.log('363') 
                    console.log(model)           
                }
            })
        },this));
    },

    editSegmentationFolderId(editSegmentationFolderId){

        this.defaultParentFolder = editSegmentationFolderId;
    },
    deactivateAll(){
        // console.log(this.$('.icon-left-dir'))
        // this.$('.icon-left-dir').hide();
        // this.$('.icon-right-dir').hide();
        this.$('.g-global-nav-li').removeClass('g-active');
    }
});
export default workflow