import _ from 'underscore';
import Backbone from 'backbone';

import View from 'girder/views/View';

import { restRequest } from 'girder/rest';
import { getCurrentUser } from 'girder/auth';
import { splitRoute, parseQueryString } from 'girder/misc';

import FileModel from 'girder/models/FileModel';

import ItemCollection from 'girder/collections/ItemCollection';
import FileCollection from 'girder/collections/FileCollection';

import ArchiveView from 'girder_plugins/Archive/views/body/ArchiveView';
import AmiViewerSEG from 'girder_plugins/AMI_plugin/views/AMIViewerSEG';
import UserView from 'girder_plugins/SSR_task/views/widgets/UserViewWidget';
import CollectionView from 'girder_plugins/SSR_task/views/widgets/CollectionViewWidget';
import ArchiveItemCollection from 'girder_plugins/Archive/collections/ItemCollection';
import ArchiveItemModel from 'girder_plugins/Archive/models/ItemModel';

import events from '../../events';
import router from '../../router';

import dataSourceTemplate from '../../templates/dataSource/dataSource.pug';
import '../../stylesheets/dataSource/dataSource.styl';

import ImageActions from './imageActions';

var dataSource =  View.extend({
    events: {
        'click .s-nav-siderBar': '_collaspeSideBar',
        'click .ds-Girder': function (e) {
            let link = $(e.currentTarget);
            let curRoute = Backbone.history.fragment,
                routeParts = splitRoute(curRoute),
                queryString = parseQueryString(routeParts.name);
            let unparsedQueryString = $.param(queryString);
            if (unparsedQueryString.length > 0) {
                unparsedQueryString = '?' + unparsedQueryString;
            }
            this.fromFilesystem = true;
            this.fromSaipArchive = false;
            this.girderArchive = new UserView({
                parentView: this,
                viewName: 'dataUserView',
                el: '#dataUSERArch',
                id: link.attr('g-id')
            });
        },
        'click .ds-Filesystem': function (e) {
            let link = $(e.currentTarget);
            let curRoute = Backbone.history.fragment,
                routeParts = splitRoute(curRoute),
                queryString = parseQueryString(routeParts.name);
            let unparsedQueryString = $.param(queryString);
            if (unparsedQueryString.length > 0) {
                unparsedQueryString = '?' + unparsedQueryString;
            }
            this.fromFilesystem = true;
            this.fromSaipArchive = false;
            this.girderArchive = new CollectionView({
                parentView: this,
                viewName: 'dataCollectionView',
                el: '#dataCollectionArch',
                id: link.attr('g-id')
            });
        },
        'click .ds-SAIP': function (e) {
            let link = $(e.currentTarget);
            let curRoute = Backbone.history.fragment,
                routeParts = splitRoute(curRoute),
                queryString = parseQueryString(routeParts.name);
            let unparsedQueryString = $.param(queryString);
            if (unparsedQueryString.length > 0) {
                unparsedQueryString = '?' + unparsedQueryString;
            }
            this.fromFilesystem = false;
            this.fromSaipArchive = true;
            this.saipArchive = new ArchiveView({
                parentView: this,
                el: '#dataSAIPArch',
                id: link.attr('g-id')
            });
        },
        'click #startView': 'startView',
        'click .cancel': 'closePreviewModal',
        'click .close': 'closePreviewModal'
    },
    initialize(setting) {
        this.init = true;
        this._openId = null;
        this.itemsCollectionIds = [];

        this.totalSeriesPath = [];
        this.totalSeriesId = [];
        this.totalSeriesIdentity = [];

        this.totalSeriesPathInit = [];
        this.totalSeriesIdInit = [];
        this.totalSeriesIdentityInit = [];

        this.SSR_ProjectCollection = setting.SSR_ProjectCollection;
        this.currentUser = setting.currentUser;
        this.itemsCollection = new ItemCollection();
        this.filesCollection = new FileCollection();

        this.$el.html(dataSourceTemplate({
            SSR_Project: this.SSR_ProjectCollection,
            user: getCurrentUser()
        }));

        this.SAIPHierarchyBreadcrumbObjects = [{'object': {'name': 'SAIP'}, 'type': 'SAIP'}];

        // this.listenTo(events,'ssr:chooseFolderItem',this.findPath)

        this.listenTo(this.SSR_ProjectCollection, 'change', this._addSSRProjectNav);
        this.listenTo(events, 'query:mode', this._changeMode);

        /* Set visualized item's parent folder (not workspace folder) */
        this.listenTo(events, 'query:filesystemFolder', this.filesystemFolder);
        this.listenTo(events, 'query:studyFolder', this.studyFolder);
        // events.on('ds:highlightItem', this.selectForView, this);

        this.listenTo(events, 'query:currentItem', this.visualization);
        this.listenTo(events, 'query:currentSeries', this.archiveVisualization);

        this.on('renderImageActions', this.imageActionsRender);

        this.listenTo(events, 'query:editSegmentationFolderId', this.editSegmentationFolderId);
        this.listenTo(events, 'query:cursorSize', this._setCursorSize);
        this.listenTo(events, 'query:labelColor', this._setLabelColor);

        this.listenTo(events, 'ami:overlaySelectedAnnotation', this.overlaySelectedAnnotation);
        this.listenTo(events, 'ami:removeSelectedAnnotation', this.removeSelectedAnnotation);
        this.listenTo(events, 'ds:_saveAnnotationAlert', this._saveAnnotationAlert);
    },
    overlaySelectedAnnotation(annotationItemId) {
        this.getImageFilesFromItemPromise(annotationItemId).then((files) => {
            if (files[0].exts[0] === 'nrrd') {
                let referenceAnnotationUrl = 'api/v1/file/' + files[0]['_id'] +
                                              '/download?contentDisposition=attachment&contentType=application%2Fnrrd';
                this.amiDisplayPreview.drawAnnotation(referenceAnnotationUrl, false, true, annotationItemId);
            } else {
                // let referenceAnnotationUrl = _.map(files, function (eachFile) {
                //     return 'api/v1/file/' + eachFile['_id'] +
                //            '/download?contentDisposition=attachment';
                // });
            }
            return null;
        });
    },
    removeSelectedAnnotation(annotationItemId) {
        this.getImageFilesFromItemPromise(annotationItemId).then((files) => {
            if (files[0].exts[0] === 'nrrd') {
                let referenceAnnotationUrl = 'api/v1/file/' + files[0]['_id'] +
                                              '/download?contentDisposition=attachment&contentType=application%2Fnrrd';
                this.amiDisplayPreview.removeAnnotation(referenceAnnotationUrl, annotationItemId);
            } else {
                // let referenceAnnotationUrl = _.map(files, function (eachFile) {
                //     return 'api/v1/file/' + eachFile['_id'] +
                //            '/download?contentDisposition=attachment';
                // });
            }
            return null;
        });
    },
    visualization(e) {
        let curRoute = Backbone.history.fragment,
            nav = splitRoute(curRoute).base.split('/')[0];
        // Make sure on view panel
        if (nav === 'data') {
            this.currentImageId = e;
            if (this._openId !== this.currentImageId || this._mode !== this.mode) {
                this._mode = this.mode;
                this._openId = this.currentImageId;
                this.getImageFilesFromItemPromise(this.currentImageId).then((files) => {
                    let displayUrl;
                    if (files[0].exts[0] === 'nrrd') {
                        displayUrl = 'api/v1/file/' + files[0]['_id'] +
                               '/download?contentDisposition=attachment&contentType=application%2Fnrrd';
                    } else {
                        displayUrl = _.map(files, function (eachFile) {
                            return 'api/v1/file/' + eachFile['_id'] +
                                '/download?contentDisposition=attachment';
                        });
                    }

                    if (this.amiDisplayPreview) {
                        this.init = false;
                        if (this.amiDisplayPreview.annotationNeedsUpdate) {
                            this._saveAnnotationAlert(this.amiDisplayPreview.currentAnnotationItemId);
                        }
                    } else {
                        this.amiDisplayPreview = new AmiViewerSEG({
                            el: '.ssrVisualizer',
                            parentView: this
                        });
                    }
                    this.amiDisplayPreview.render(this.init, displayUrl);
                    this.amiDisplayPreview.once('g:imageRendered', () => {
                        // FIXME: query segmentation information
                        // and render image header
                        restRequest({
                            url: 'SSR_task/link',
                            data: {
                                'originalId': this.currentImageId
                            }
                        }).then(_.bind((items) => {
                            this.segmentations = items;
                            if (items.length) {
                                let segmentationItemId = items[0]['segmentationId'];
                                this.getImageFilesFromItemPromise(segmentationItemId).then((files) => {
                                    if (files[0].exts[0] === 'nrrd') {
                                        let referenceAnnotationUrl = 'api/v1/file/' + files[0]['_id'] +
                                                                        '/download?contentDisposition=attachment&contentType=application%2Fnrrd';
                                        if (this.mode === 'edit') {
                                            this.amiDisplayPreview.drawAnnotation(referenceAnnotationUrl, true, true, segmentationItemId, this.mode, this.labelColor, this.cursorSize);
                                            this.amiDisplayPreview.currentAnnotationItemId = segmentationItemId;
                                        }
                                        if (this.mode === 'view' || 'undefined') {
                                            this.amiDisplayPreview.drawAnnotation(referenceAnnotationUrl, true, true, segmentationItemId, this.mode, this.labelColor, this.cursorSize);
                                        }
                                    } else {
                                        // let referenceAnnotationUrl = _.map(files, function (eachFile) {
                                        //     return 'api/v1/file/' + eachFile['_id'] +
                                        //            '/download?contentDisposition=attachment';
                                        // });
                                    }
                                    return null;
                                });
                                this.amiDisplayPreview.annotationSelector(items, this.mode, this.editSegmentationFolderId, this.labelColor, this.cursorSize);
                                return null;
                            } else {
                            }
                        }, this));
                    });
                    return null;
                });
            }
        }
    },
    archiveVisualization(e) {
        let curRoute = Backbone.history.fragment,
            nav = splitRoute(curRoute).base.split('/')[0];
        // Make sure on view panel

        if (nav === 'data') {
            this.currentImageId = e;
            if (this._openId !== this.currentImageId || this._mode !== this.mode) {
                this._mode = this.mode;
                this._openId = this.currentImageId;
                this.SAIPItem = new ArchiveItemModel();
                this.SAIPItem.on('archive:slices', function (slices) {
                    this.slicesCollection = slices;
                    let displayUrl;
                    displayUrl = _.map(this.slicesCollection.models, function (eachSlice) {
                        return 'api/v1/Archive/SAIP/slice/download?Type=slice&id=' + eachSlice.get('id');
                    });
                    if (this.amiDisplayPreview) {
                        this.init = false;
                        if (this.amiDisplayPreview.annotationNeedsUpdate) {
                            this._saveAnnotationAlert(this.amiDisplayPreview.currentAnnotationItemId);
                        }
                    } else {
                        this.amiDisplayPreview = new AmiViewerSEG({
                            el: '.ssrVisualizer',
                            parentView: this
                        });
                    }
                    this.amiDisplayPreview.render(this.init, displayUrl);
                }, this).set({archive: 'SAIP'}).getSlices(this.currentImageId);
            }
        }
    },
    imageActionsRender() {
        if (this.imageActions) {
            this.imageActions.destroy();
        }
        if (this.fromFilesystem) {
            this.imageActions = new ImageActions({
                el: $('#Actions'),
                mode: this.mode,
                currentViewFolderId: this.sourceFolderId,
                currentImageSegmentations: this.segmentations,
                itemsCollectionIds: this.itemsCollectionIds,
                allImagesName: this.itemsCollection.models,
                currentImage: this.currentImage.get('name'),
                currentImageId: this.currentImage.get('_id'),
                fromFilesystem: this.fromFilesystem,
                fromSaipArchive: this.fromSaipArchive,
                parentView: this
            });
        } else if (this.fromSaipArchive) {
            this.imageActions = new ImageActions({
                el: $('#Actions'),
                mode: this.mode,
                currentViewFolderId: this.studyFolderId,
                currentImageSegmentations: null,
                itemsCollectionIds: this.archiveItemsCollectionIds,
                allImagesName: this.archiveItemsCollection.models,
                currentImage: this.currentSlice.get('series_description'),
                currentImageId: this.currentSlice.get('id'),
                fromFilesystem: this.fromFilesystem,
                fromSaipArchive: this.fromSaipArchive,
                parentView: this
            });
        }
    },
    editSegmentationFolderId(editSegmentationFolderId) {
        this.editSegmentationFolderId = editSegmentationFolderId;
    },
    getImageFilesFromItemPromise(e) {
        return new Promise(_.bind(function (resolve, reject) {
            restRequest({
                url: 'item/' + e + '/files?limit=1000'
            }).then((files) => {
                resolve(files);
                return null;
            });
        }, this));
    },
    /*
      Green View is click
    */
    startView(e) {
        if (this.fromFilesystem) {
            this.itemsCollection = new ItemCollection();
            let folderView = this.girderArchive.hierarchyWidget.folderListView;
            let folders = folderView.checked;
            /* folders should be limited as only one for now */
            this.itemListsFromFolder = [];

            for (let a = 0; a < folders.length; a++) {
                let folderModel = folderView.collection.get(folders[a]);
                restRequest({
                    method: 'GET',
                    url: '/item',
                    data: {'folderId': folderModel.get('_id')}
                }).then(_.bind((items) => {
                    this.itemsCollection.set(items);
                    router.setQuery('mode', 'view');
                    router.setQuery('filesystemFolder', folderModel.get('_id'));
                    router.setQuery('currentItem', this.itemsCollection.at(0).get('_id'), {trigger: true, replace: true});
                    this.mode = 'view';
                    /* workSpaceFolder should receive `input images' parent folder id` here */
                    // router.setQuery('workSpaceFolder', folderModel.get('_id'), {trigger: true})
                }, this));
            }
        } else if (this.fromSaipArchive) {
            // router.enabled(1);
            let studyFolderView = this.saipArchive.hierarchyWidget.folderListView;
            let folders = studyFolderView.checked;
            this.archiveItemsCollection = new ArchiveItemCollection();
            for (let a = 0; a < folders.length; a++) {
                let studyFolderModel = studyFolderView.collection.get(folders[a]);
                this.archiveItemsCollection.rename({archive: 'SAIP', type: 'series'});
                this.archiveItemsCollection.on('g:changed', function () {
                    router.setQuery('mode', 'view');
                    router.setQuery('studyFolder', studyFolderModel.get('id'));
                    router.setQuery('currentSeries', this.archiveItemsCollection.at(0).get('id'), {trigger: true, replace: true});
                }, this).fetch({id: studyFolderModel.get('id')});
            }
        } else {
            events.trigger('g:alert', {
                type: 'warning',
                text: 'Please select a dataset to visualize',
                icon: 'info',
                timeout: 5000
            });
        }
    },
    filesystemFolder(sourceFolderId) {
        this.itemListsFromFolder = [];
        this.itemsCollectionIds = [];
        this.sourceFolderId = sourceFolderId;
        this.fromFilesystem = true;
        this.fromSaipArchive = false;
        restRequest({
            method: 'GET',
            url: '/item',
            data: {'folderId': this.sourceFolderId}
        }).then(_.bind((items) => {
            this.itemListsFromFolder = this.itemListsFromFolder.concat(items);
            this.itemsCollection.set(this.itemListsFromFolder);

            this.currentImage = this.itemsCollection.get(this.currentImageId);
            if (!this.currentImage) {
                this.currentImage = this.itemsCollection.models[0];
            }

            for (let a = 0; a < this.itemsCollection.models.length; a++) {
                this.itemsCollectionIds.push(this.itemsCollection.models[a].get('_id'));
            }
            this.currentImageId = this.currentImage.get('_id');
            this.trigger('renderImageActions');
        }, this));
    },
    studyFolder(studyFolderId) {
        this.archiveItemsCollectionIds = [];
        this.studyFolderId = studyFolderId;
        this.fromFilesystem = false;
        this.fromSaipArchive = true;
        this.archiveItemsCollection = new ArchiveItemCollection();
        this.archiveItemsCollection.rename({archive: 'SAIP', type: 'series'});
        this.archiveItemsCollection.on('g:changed', function (items) {
            this.currentSlice = this.archiveItemsCollection.where({id: parseInt(this.currentImageId)})[0];
            if (!this.currentSlice) {
                this.currentSlice = this.archiveItemsCollection.models[0];
            }

            for (let a = 0; a < this.archiveItemsCollection.models.length; a++) {
                this.archiveItemsCollectionIds.push(this.archiveItemsCollection.models[a].get('id'));
            }
            this.currentSliceId = this.currentSlice.get('id');
            this.trigger('renderImageActions');
        }, this).fetch({id: studyFolderId});
    },
    closePreviewModal() {
        $('#PreviewSelection').hide();
    },
    _updateFile(targetFileId) {
        restRequest({
            method: 'GET',
            url: 'file/' + targetFileId
        }).then((file) => {
            this.targetTestFile = new FileModel(file);
            // console.log(this.amiDisplayPreview.stack2.rawData[0])
            // var arr_test = new Uint8Array([32,31]);
            this.amiDisplayPreview.stack2.unPack(this.amiDisplayPreview.stack2.rawData[0]);

            // let arr = this.amiDisplayPreview.stack2.rawData[0];
            let arr = this.amiDisplayPreview.stack2.oriRawData[0];
            // var arr3 = this.amiDisplayPreview.stack2.frame[26].pixelData;

            let nrrdHeaderInfo = this.amiDisplayPreview.reconstructNrrdHeader;
            // window.nrrdHeaderInfo = nrrdHeaderInfo;

            let headerArray, entire;
            if (arr.BYTES_PER_ELEMENT === 1) {
                headerArray = this._nrrdHeaderToUint8Array(nrrdHeaderInfo);
                entire = new Uint8Array(headerArray.length + arr.length);
            } else if (arr.BYTES_PER_ELEMENT === 2) {
                headerArray = this._nrrdHeaderToUint16Array(nrrdHeaderInfo);
                entire = new Uint16Array(headerArray.length + arr.length);
            }
            // let headerUint16Array = this._nrrdHeaderToUint16Array(nrrdHeaderInfo);
            // let headerUint8Array = this._nrrdHeaderToUint8Array(nrrdHeaderInfo);

            // let entire = new Uint16Array(headerUint16Array.length + arr.length);
            // let entire = new Uint8Array(headerUint8Array.length + arr.length);

            // entire.set(headerUint16Array);
            // entire.set(arr, headerUint16Array.length);
            entire.set(headerArray);
            entire.set(arr, headerArray.length);

            // var files = document.getElementById('filesTest').files;

            // var blob = new Blob([headerUint16Array.buffer], {type: ''});
            new Blob([headerArray.buffer], {type: ''});
            // console.log(blob)
            // var arrayBuffer;
            // var fileReader = new FileReader();
            // fileReader.onload = function(event) {
            //     console.log(event.target.result);
            // };
            // fileReader.readAsArrayBuffer(files[0]['slice'](0,600));
            // console.log(file)
            this.targetTestFile.updateContents(entire);
            return null;
        });
    },
    _nrrdHeaderToUint8Array(headerString) {
        let binaryArr = [];
        let Uint8Arr = [];
        let tmp8bit;
        for (let i = 0; i < headerString.length; i++) {
            tmp8bit = headerString[i].charCodeAt(0);
            binaryArr.push(parseInt(tmp8bit));
        }
        let significant, octInDecimal;
        for (let j = 0; j < binaryArr.length; j++) {
            significant = parseInt(binaryArr[j]);
            octInDecimal = significant;
            Uint8Arr.push(octInDecimal);
        }
        return Uint8Arr;
    },
    _nrrdHeaderToUint16Array(headerString) {
        let binaryArr = [];
        let Uint16Arr = [];
        let tmp8bit;
        for (let i = 0; i < headerString.length; i++) {
            tmp8bit = headerString[i].charCodeAt(0);
            binaryArr.push(parseInt(tmp8bit));
        }
        let leastSignificant, mostSignificant, hexInDecimal;
        for (let j = 0; j < binaryArr.length; j = j + 2) {
            leastSignificant = parseInt(binaryArr[j]);
            mostSignificant = parseInt(binaryArr[j + 1]);
            hexInDecimal = ((mostSignificant & 0xFF) << 8) | (leastSignificant & 0xFF);
            Uint16Arr.push(hexInDecimal);
        }
        return Uint16Arr;
    },
    _saveAnnotationAlert(annotationId) {
        if (confirm('Do you want to save annotation change?')) {
            this.getImageFilesFromItemPromise(annotationId).then((files) => {
                if (files[0].exts[0] === 'nrrd') {
                    this._updateFile(files[0]['_id']);
                } else {
                    console.error(files[0].exts[0] + ' type annotation is not supported yet');
                }
                return null;
            });
        } else {
            console.log('Do not save change');
        }
    },
    _changeMode(e) {
        this.mode = e;
    },
    _setCursorSize(e) {
        this.cursorSize = e;
    },
    _setLabelColor(e) {
        this.labelColor = e;
    },
    _collaspeSideBar(e) {
        $(e.target).children()[0].classList.toggle('collapsein');
        if ($(e.target).children().hasClass('collapsein')) {
            this.$('.g-ds-nav-container').css('left', 'calc(-40vw + 20px)');
            this.$('.g-ds-nav-container').css('marginLeft', '0vw');
            this.$('.ssrVisualizer').css('width', 'calc(100vw - 20px)');
            this.$('.ssrVisualizer').css('marginLeft', '0');
        } else {
            this.$('.g-ds-nav-container').css('left', '0vw');
            this.$('.g-ds-nav-container').css('marginLeft', '0vw');
            this.$('.ssrVisualizer').css('width', '60vw');
            this.$('.ssrVisualizer').css('marginLeft', '0');
        }
    },
    _addSSRProjectNav(e) {
        this.$el.html(dataSourceTemplate({
            SSR_Project: this.SSR_ProjectCollection,
            user: getCurrentUser()
        }));
    }
});

export default dataSource;
