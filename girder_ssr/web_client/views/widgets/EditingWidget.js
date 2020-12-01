import _ from 'underscore';

import View from '@girder/core/views/View';
import { restRequest } from '@girder/core/rest';
import { getCurrentUser } from '@girder/core/auth';
import MarkdownWidget from '@girder/core/views/widgets/MarkdownWidget';

import EditingModeDialogTemplate from '../../templates/widgets/EditingModeDialogTemplate.pug';

import events from '../../events';
import router from '../../router';

import 'bootstrap-slider/src/js/bootstrap-slider';
import 'bootstrap-colorpicker/dist/js/bootstrap-colorpicker';
import 'bootstrap-slider/dist/css/bootstrap-slider.css';
import 'bootstrap-select/dist/css/bootstrap-select.css';
import 'bootstrap-select';

import '../../stylesheets/widgets/editingModeDialogTemplate.styl';

var EditingWidget = View.extend({
    events: {
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
    nameNewLabel(e) {
        if ($('#selectSegmentation [label=Release] option:selected').attr('id')) {
            $('.saving-options-container').show();
        } else {
            $('.saving-options-container').hide();
        }
    },
    editingMode(e) {
        restRequest({
            method: 'GET',
            url: 'folder',
            data: {'parentType': 'user', 'parentId': getCurrentUser().id, 'name': 'Public'}
        }).then(_.bind((publicfolder) => {
            let selectSegmentation = $('#selectSegmentation option:selected').attr('id');
            this.mode = 'edit';
            router.setQuery('editSegmentationFolderId', selectSegmentation);
            router.setQuery('cursorSize', $('#cursorSize').val());
            router.setQuery('labelColor', $('#labelColor').val());
            router.setQuery('mode', 'edit', {trigger: true, replace: true});
            this.$el.modal('hide');
        }, this));
    },
    validateAccess(allSegs) {
        return this;
    }
});

export default EditingWidget;
