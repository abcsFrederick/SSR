import View from 'girder/views/View';
import EditingModeDialogTemplate from '../../templates/widgets/EditingModeDialogTemplate.pug';

import { restRequest } from 'girder/rest';
import { getCurrentUser } from 'girder/auth';

import MarkdownWidget from 'girder/views/widgets/MarkdownWidget';
import events from '../../events';
import router from '../../router';

import 'bootstrap-slider/src/js/bootstrap-slider';

import 'bootstrap-select/dist/css/bootstrap-select.css';
import 'bootstrap-select';

import '../../stylesheets/widgets/editingModeDialogTemplate.styl';
import 'bootstrap-slider/src/js/bootstrap-slider';
import 'bootstrap-colorpicker/dist/js/bootstrap-colorpicker';
import 'bootstrap-slider/dist/css/bootstrap-slider.css';
var EditingWidget = View.extend({
    events:{
      'click #setEditMode': 'editingMode',
      'change #selectSegmentation': 'nameNewLabel'
    },
    initialize: function (settings) {
      this.mode = 'view';
      this.currentViewFolderId = settings.currentViewFolderId;
      this.currentImageSegmentations = settings.currentImageSegmentations;
      this.descriptionEditor = new MarkdownWidget({
          text: this.model ? this.model.get('description') : '',
          prefix: 'collection-description',
          placeholder: 'Enter a description',
          enableUploads: false,
          parentView: this
      });
    },
    render: function () {
        this.segAccess = this.validateAccess(this.currentImageSegmentations); 
        this.$el.html(EditingModeDialogTemplate({
            segmentations: this.currentImageSegmentations || []
        })).girderModal(this).on('hide.bs.modal', (e) => {
            if (this.mode === 'edit') {
                router.setQuery('mode', 'edit', {trigger: false});
            } else {
                this.mode = 'view';
                events.trigger('changeBackToView');
                router.setQuery('mode', 'view', {trigger: true});
            }
        });
        this.descriptionEditor.setElement(this.$('.g-description-editor-container')).render();

        $('#selectSegmentation').selectpicker();
        $('#cursorSize').bootstrapSlider();
        $('#labelColor').colorpicker();

        return this;
    },
    nameNewLabel(e){
      if($('#selectSegmentation [label=Release] option:selected').attr('id')){
        $('.saving-options-container').show();
      }else{
        $('.saving-options-container').hide();
      }
    },
    editingMode(e) {
        restRequest({
            method: 'GET',
            url: 'folder',
            data:{'parentType': 'user', 'parentId': getCurrentUser().id, 'name': 'Public'}
        }).then(_.bind((publicfolder)=>{
            if ($('#selectSegmentation option:selected').attr('id')) {
                let selectSegmentation = $('#selectSegmentation option:selected').attr('id');
                restRequest({
                    method: 'POST',
                    url: 'folder/' + selectSegmentation + '/copy',
                    data: {'name': $('#EditingName').val(), 'parentId':publicfolder[0]['_id'], 'parentType': 'folder', 'description': this.descriptionEditor.val()}
                }).then(_.bind((newCopiedFolder) => {
                    restRequest({
                        method: 'PUT',
                        url: '/SSR/segmentationLinkEditing/'+this.currentViewFolderId+'/'+newCopiedFolder['_id']
                    }).then(_.bind(()=>{
                    this.mode = 'edit';
                    router.setQuery('editSegmentationFolderId', newCopiedFolder['_id']);
                    router.setQuery('cursorSize', $('#cursorSize').val());
                    router.setQuery('labelColor', $('#labelColor').val());
                    router.setQuery('mode', 'edit', {trigger: true, replace: true});
                    this.$el.modal('hide');
                    // events.trigger('ami:overlaySelectedAnnotation',this.showAnnotation[a].id, {trigger:true})
                  },this))
                },this));
        }else if($('#selectSegmentation [label=Yours] option:selected').attr('id')){
          let selectSegmentation = $('#selectSegmentation [label=Yours] option:selected').attr('id');
          this.mode = 'edit';
          router.setQuery('editSegmentationFolderId', selectSegmentation);
          router.setQuery('cursorSize', $('#cursorSize').val());
          router.setQuery('labelColor', $('#labelColor').val());
          router.setQuery('mode', 'edit', {trigger: true, replace: true});
          this.$el.modal('hide');
        }
        
      },this));
    },
    validateAccess(allSegs) {
        window.allSegs = allSegs;
        window.user = getCurrentUser();
        // for (var i = 0; i < allSegs.length; i++) {
        //     allSegs[i]
        // }
    }
});

export default EditingWidget;
