import View from 'girder/views/View';
import Folder from 'girder/models/FolderModel';
import events from '../../events';
import ImageActionsTemplate from '../../templates/dataSource/ImageActionsTemplate.pug';
import ImageNameWidget from '../../templates/widgets/ImageName.pug';
import EditingMode from '../../templates/widgets/EditingMode.pug';
import router from '../../router';
import '../../stylesheets/widgets/ImageActions.styl';
import editingWidget from '../widgets/EditingWidget';
import { restRequest } from 'girder/rest';

var imageActions = View.extend({
    events: {
        'click #forward': 'forward',
        'click #backward': 'backward',
        'click .imageSelected': 'selectRandom'
    },
    initialize(settings){
        this.mode = settings.mode || 'view';
        this.currentImageSegmentations = settings.currentImageSegmentations || '';
        this.currentViewFolderId = settings.currentViewFolderId;

        this.allImagesName = settings.allImagesName;
        this.currentImage = settings.currentImage;
        this.fromFilesystem = settings.fromFilesystem;
        this.fromSaipArchive = settings.fromSaipArchive;
        this.itemsCollectionIds = settings.itemsCollectionIds
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
                                currentImageSegmentations: settings.currentImageSegmentations
                            }
                            new editingWidget(opts).render();
                        } else {
                            let opts = {
                                el: $('#g-dialog-container'),
                                currentViewFolderId: this.currentViewFolderId,
                                parentView: this
                            };
                            new editingWidget(opts);
                        }
                    });
            } else {
                $('#modeSwitch')
                    .bootstrapSwitch('state', true)
                    .on('switchChange.bootstrapSwitch', (event, state) => {
                        if(state){
                        let opts = {
                            el: $('#g-dialog-container'),
                            currentViewFolderId: this.currentViewFolderId,
                            parentView: this,
                            currentImageSegmentations: settings.currentImageSegmentations
                        };
                        new editingWidget(opts).render();
                        }else{
                        let opts = {
                            el: $('#g-dialog-container'),
                            currentViewFolderId: this.currentViewFolderId,
                            parentView: this
                        };
                        new editingWidget(opts)
                        router.setQuery('mode', 'view', {trigger: true});
                        }
                    });
            }
            $('.image_name').html(ImageNameWidget({
                allImagesName: this.allImagesName,
                currentImage: this.currentImage,
                fromFilesystem: this.fromFilesystem,
                fromSaipArchive: this.fromSaipArchive
            }))
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
                            currentImageSegmentations: settings.currentImageSegmentations
                        }
                        new editingWidget(opts).render();
                    } else {
                        let opts = {
                            el: $('#g-dialog-container'),
                            currentViewFolderId: this.currentViewFolderId,
                            parentView: this
                        };
                        new editingWidget(opts);
                    }
                });
        }
        $('.image_name').html(ImageNameWidget({
            allImagesName: this.allImagesName,
            currentImage: this.currentImage,
            fromFilesystem: this.fromFilesystem,
            fromSaipArchive: this.fromSaipArchive
        }))
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
