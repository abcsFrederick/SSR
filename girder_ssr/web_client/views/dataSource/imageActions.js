import View from '@girder/core/views/View';
import Folder from '@girder/core/models/FolderModel';

import EditingWidget from '../widgets/EditingWidget';
import events from '../../events';
import router from '../../router';

import ImageActionsTemplate from '../../templates/dataSource/ImageActionsTemplate.pug';
import ImageNameWidget from '../../templates/widgets/ImageName.pug';
import EditingMode from '../../templates/widgets/EditingMode.pug';

import '../../stylesheets/widgets/ImageActions.styl';

var imageActions = View.extend({
    events: {
        'click #forward': 'forward',
        'click #backward': 'backward',
        'click .imageSelected': 'selectRandom'
    },
    initialize(settings) {
        this.mode = settings.mode || 'view';
        this.currentImageSegmentations = settings.currentImageSegmentations || '';
        this.currentViewFolderId = settings.currentViewFolderId;

        this.allImagesName = settings.allImagesName;
        this.currentImage = settings.currentImage;
        this.fromFilesystem = settings.fromFilesystem;
        this.fromSaipArchive = settings.fromSaipArchive;
        this.itemsCollectionIds = settings.itemsCollectionIds;
        this.currentImageId = settings.currentImageId;

        if (this.fromFilesystem) {
            this.render();
        } else if (this.fromSaipArchive) {
            this.renderForSAIP();
        }
        this.listenTo(events, 'changeBackToView', this.changeBackToView);
    },
    render() {
        new Folder({'_id': this.currentViewFolderId}).fetch().done((folder) => {
            this.$el.html(ImageActionsTemplate({
                accessLevel: folder._accessLevel
            }));
            $('.mode').html(EditingMode());
            if (this.mode === 'view') {
                $('#modeSwitch')
                    .bootstrapSwitch('state', false)
                    .on('switchChange.bootstrapSwitch', (event, state) => {
                        if (state) {
                            let opts = {
                                el: $('#g-dialog-container'),
                                parentView: this,
                                currentImageSegmentations: this.currentImageSegmentations
                            };
                            new EditingWidget(opts).render();
                        } else {
                            let opts = {
                                el: $('#g-dialog-container'),
                                currentViewFolderId: this.currentViewFolderId,
                                parentView: this
                            };
                            new EditingWidget(opts);
                        }
                    });
            } else {
                $('#modeSwitch')
                    .bootstrapSwitch('state', true)
                    .on('switchChange.bootstrapSwitch', (event, state) => {
                        if (state) {
                            let opts = {
                                el: $('#g-dialog-container'),
                                currentViewFolderId: this.currentViewFolderId,
                                parentView: this,
                                currentImageSegmentations: this.currentImageSegmentations
                            };
                            new EditingWidget(opts).render();
                        } else {
                            let opts = {
                                el: $('#g-dialog-container'),
                                currentViewFolderId: this.currentViewFolderId,
                                parentView: this
                            };
                            new EditingWidget(opts);
                            router.setQuery('mode', 'view', {trigger: true});
                        }
                    });
            }
            $('.image_name').html(ImageNameWidget({
                allImagesName: this.allImagesName,
                currentImage: this.currentImage,
                fromFilesystem: this.fromFilesystem,
                fromSaipArchive: this.fromSaipArchive
            }));
        });
        return this;
    },
    renderForSAIP() {
        this.$el.html(ImageActionsTemplate({
            accessLevel: true
        }));
        $('.mode').html(EditingMode());
        if (this.mode === 'view') {
            $('#modeSwitch')
                .bootstrapSwitch('state', false)
                .on('switchChange.bootstrapSwitch', (event, state) => {
                    if (state) {
                        let opts = {
                            el: $('#g-dialog-container'),
                            parentView: this,
                            currentImageSegmentations: this.currentImageSegmentations
                        };
                        new EditingWidget(opts).render();
                    } else {
                        let opts = {
                            el: $('#g-dialog-container'),
                            currentViewFolderId: this.currentViewFolderId,
                            parentView: this
                        };
                        new EditingWidget(opts);
                    }
                });
        }
        $('.image_name').html(ImageNameWidget({
            allImagesName: this.allImagesName,
            currentImage: this.currentImage,
            fromFilesystem: this.fromFilesystem,
            fromSaipArchive: this.fromSaipArchive
        }));
        return this;
    },
    forward() {
        let nextImageId;
        let nextImageIndex = this.itemsCollectionIds.indexOf(this.currentImageId) + 1;
        if (nextImageIndex === this.itemsCollectionIds.length) {
            nextImageIndex = 0;
            nextImageId = this.itemsCollectionIds[nextImageIndex];
        } else {
            nextImageId = this.itemsCollectionIds[nextImageIndex];
        }
        this.currentImageId = nextImageId;
        if (this.fromFilesystem) {
            router.setQuery('currentItem', this.currentImageId, {trigger: true});
        } else if (this.fromSaipArchive) {
            router.setQuery('currentSeries', this.currentImageId, {trigger: true});
        }
    },
    backward() {
        let nextImageId;
        let nextImageIndex = this.itemsCollectionIds.indexOf(this.currentImageId) - 1;
        if (nextImageIndex < 0) {
            nextImageIndex = this.itemsCollectionIds.length - 1;
            nextImageId = this.itemsCollectionIds[nextImageIndex];
        } else {
            nextImageId = this.itemsCollectionIds[nextImageIndex];
        }
        this.currentImageId = nextImageId;

        if (this.fromFilesystem) {
            router.setQuery('currentItem', this.currentImageId, {trigger: true});
        } else if (this.fromSaipArchive) {
            router.setQuery('currentSeries', this.currentImageId, {trigger: true});
        }
    },
    /*
        User select particular image as they wish from preloaded dataset for viewing
    */
    selectRandom(e) {
        this.currentImageId = e.currentTarget.id;
        if (this.fromFilesystem) {
            router.setQuery('currentItem', this.currentImageId, {trigger: true});
        } else if (this.fromSaipArchive) {
            router.setQuery('currentSeries', this.currentImageId, {trigger: true});
        }
    },
    // this is needed due to same mode will not trigger
    changeBackToView() {
        $('#modeSwitch').bootstrapSwitch('state', false);
    }
});

export default imageActions;
