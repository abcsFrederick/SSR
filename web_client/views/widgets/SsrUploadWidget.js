import $ from 'jquery';
import _ from 'underscore';

import FileModel from 'girder/models/FileModel';
import FolderModel from 'girder/models/FolderModel';
import ItemModel from 'girder/models/ItemModel';
import View from 'girder/views/View';
import { formatSize } from 'girder/misc';
import { handleClose, handleOpen } from 'girder/dialog';
import { restRequest, uploadHandlers, getUploadChunkSize } from 'girder/rest';

import UploadWidgetTemplate from '../../templates/widgets/SsrUploadWidget.pug';
import UploadWidgetNonModalTemplate from '../../templates/widgets/SsrUploadWidgetNonModal.pug';
import labelTemplate from '../../templates/widgets/SsrUploadWidgetMixinsLabel.pug';
import 'girder/stylesheets/widgets/uploadWidget.styl';

import 'girder/utilities/jquery/girderEnable';
import 'girder/utilities/jquery/girderModal';

/**
 * This widget is used to upload files to a folder. Pass a folder model
 * to its constructor as the parent folder that will be uploaded into.
 * The events:
 *   itemComplete: Triggered each time an individual item is finished uploading.
 *   finished: Triggered when the entire set of items is uploaded.
 */
var UploadWidget = View.extend({
    events: {
        // 'click #try':function(e){
        //     console.log(this.files)
        //     let formData = new FormData();
        //     formData.append("file", this.files[0]);
        //     console.log(formData.get('files'))
        //     restRequest({
        //         url: 'folder/'+this.parent.get('_id')+'/fileUpload',
        //         method: 'POST',
        //         data: formData,
        //         processData:false,
        //         contentType: false
        //     });
        // },
        'submit #g-upload-form': function (e) {
            e.preventDefault();
            
        //    this.startUpload();
            this.validateFileType(this.files);
        },
        'click .g-resume-upload': function () {
            this.$('.g-upload-error-message').html('');
            this.currentFile.resumeUpload();
        },
        'click .g-restart-upload': function () {
            this.$('.g-upload-error-message').html('');
            this.uploadNextFile();
        },
        'change #g-files': function () {
            var files = this.$('#g-files')[0].files;

            if (files.length) {
                this.files = files;
                this.filesChanged();
                this.autoParsePotentialLabelName(this.files);
            }
        //    this.validateFileType(this.files);
        },
        'click .g-drop-zone': function () {
            this.$('#g-files').click();
        },
        'dragenter .g-drop-zone': function (e) {
            e.stopPropagation();
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'copy';
            this.$('.g-drop-zone')
                .addClass('g-dropzone-show')
                .html('<i class="icon-bullseye"/> Drop files here');
        },
        'dragleave .g-drop-zone': function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.$('.g-drop-zone')
                .removeClass('g-dropzone-show')
                .html('<i class="icon-docs"/> Browse or drop files');
        },
        'dragover .g-drop-zone': function (e) {
            var dataTransfer = e.originalEvent.dataTransfer;
            if (!dataTransfer) {
                return;
            }
            // The following two lines enable drag and drop from the chrome download bar
            var allowed = dataTransfer.effectAllowed;
            dataTransfer.dropEffect = (allowed === 'move' || allowed === 'linkMove') ? 'move' : 'copy';

            e.preventDefault();
        },
        'drop .g-drop-zone': 'filesDropped'
    },

    /**
     * This widget has several configuration options to control its view and
     * behavior. The following keys can be passed in the settings object:
     *
     * @param [parent] If the parent object is known when instantiating this
     * upload widget, pass the object here.
     * @param [parentType=folder] If the parent type is known when instantiating this
     * upload widget, pass the object here. Otherwise set noParent: true and
     * set it later, prior to starting the upload.
     * @param [noParent=false] If the parent object being uploaded into is not known
     * at the time of widget instantiation, pass noParent: true. Callers must
     * ensure that the parent is set by the time uploadNextFile() actually gets
     * called.
     * @param [title="Upload files"] Title for the widget. This is highly recommended
     * when rendering as a modal dialog. To disable rendering of the title, simply
     * pass a falsy object.
     * @param [modal=true] This widget normally renders as a modal dialog. Pass
     * modal: false to disable the modal behavior and simply render underneath a
     * parent element.
     * @param [overrideStart=false] Some callers will want to hook into the pressing
     * of the start upload button and add their own logic prior to actually sending
     * the files. To do so, set overrideStart: true and bind to the "g:uploadStarted"
     * event of this widget. The caller is then responsible for calling "uploadNextFile()"
     * on the widget when they have completed their actions and are ready to actually
     * send the files.
     * @param [multiFile=true] By default, this widget allows selection of multiple
     * files. Set this to false to only allow a single file to be chosen.
     * @param [otherParams={}] An object containing other parameters to pass into the
     * upload initialization endpoint, or a function that returns such an object. If a
     * function, will be called when the upload is started.
     *
     * Other events:
     *   - "g:filesChanged": This is triggered any time the user changes the
     *     file selection, either by dropping or browsing and selecting new files.
     *     Handlers will receive a single argument, which is the list of chosen files.
     *   - "g:uploadFinished": When all files have been successfully uploaded,
     *     this event is fired.
     */
    initialize: function (settings) {
        if (settings.noParent) {
            this.parent = null;
            this.parentType = null;
        } else {
            this.parent = settings.parent || settings.folder;
            this.parentType = settings.parentType || 'folder';
        }
        this.isLabel = false;
        this.files = [];
        this.totalSize = 0;
        this.title = _.has(settings, 'title') ? settings.title : 'Upload files';
        this.modal = _.has(settings, 'modal') ? settings.modal : true;
        this.multiFile = _.has(settings, 'multiFile') ? settings.multiFile : this.parentType !== 'file';
        this.overrideStart = settings.overrideStart || false;
        this.otherParams = settings.otherParams || {};

        this._browseText = this.multiFile ? 'Browse or drop files here' : 'Browse or drop a file here';
        this._noneSelectedText = this.multiFile ? 'No files selected' : 'No file selected';
    },

    render: function () {
        var templateParams = {
            parent: this.parent,
            parentType: this.parentType,
            title: this.title,
            multiFile: this.multiFile,
            browseText: this._browseText,
            noneSelectedText: this._noneSelectedText
        };

        if (this.modal) {
            this.$el.html(UploadWidgetTemplate(templateParams));

            var dialogid;
            if (this.parentType === 'file') {
                dialogid = this.parent.get('_id');
            }

            this.$el.girderModal(this).on('hidden.bs.modal', () => {
                /* If we are showing the resume option, we have a partial upload
                 * that should be deleted, since the user has no way to get back
                 * to it. */
                if ($('.g-resume-upload').length && this.currentFile) {
                    this.currentFile.abortUpload();
                }
                handleClose('upload', undefined, dialogid);
            });

            handleOpen('upload', undefined, dialogid);
        } else {
            this.$el.html(UploadWidgetNonModalTemplate(templateParams));
        }
        return this;
    },

    filesDropped: function (e) {
        e.stopPropagation();
        e.preventDefault();

        this.$('.g-drop-zone')
            .removeClass('g-dropzone-show')
            .html(`<i class="icon-docs"/> ${this._browseText}`);

        var dataTransfer = e.originalEvent.dataTransfer;
        console.log(e)
        // Require all dropped items to be files
        if (!_.every(dataTransfer.items, (item) => this._isFile(item))) {
            this.$('.g-upload-error-message').html('Only files may be uploaded.');
            return;
        }
        this.files = dataTransfer.files;

        if (!this.multiFile && this.files.length > 1) {
            // If in single-file mode and the user drops multiple files,
            // we just take the first one.
            this.files = [this.files[0]];
        }

        this.filesChanged();
    },

    filesChanged: function () {
        if (this.files.length === 0) {
            this.$('.g-overall-progress-message').text(this._noneSelectedText);
            this.setUploadEnabled(false);
        } else {
            this.totalSize = 0;
            _.each(this.files, function (file) {
                this.totalSize += file.size;
            }, this);

            var msg;

            if (this.files.length > 1) {
                msg = 'Selected ' + this.files.length + ' files';
            } else {
                msg = 'Selected <b>' + this.files[0].name + '</b>';
            }
            this.$('.g-overall-progress-message').html('<i class="icon-ok"/> ' +
                msg + '  (' + formatSize(this.totalSize) +
                ') -- Press start button');
            this.setUploadEnabled(true);
            this.$('.g-progress-overall,.g-progress-current').addClass('hide');
            this.$('.g-current-progress-message').empty();
            this.$('.g-upload-error-message').empty();
        }

        this.trigger('g:filesChanged', this.files);
    },

    autoParsePotentialLabelName: function(files){

        let newFilesList=[];

        for(let a=0;a<files.length;a++){
            if(files[a].name!=='.DS_Store'){
                newFilesList.push(files[a])
            }
        }

        let typeOfFile;
        for(let a=0;a<newFilesList.length;a++){
            if(newFilesList[a].name.lastIndexOf('.')==-1){
                typeOfFile = 'unknowType';
            }else{
                typeOfFile = newFilesList[a].name.substr(newFilesList[a].name.lastIndexOf('.')+1);
            }
            if(typeOfFile === 'unknowType'||typeOfFile === 'dcm'){
                break;
            }
        }
        let potentialNames=[];
        if(typeOfFile === 'nrrd'){
            for(let a=0;a<newFilesList.length;a++){
                let potentialName = newFilesList[a].webkitRelativePath.split('/')[newFilesList[a].webkitRelativePath.split('/').length-2];
                potentialNames.indexOf(potentialName) === -1 ? potentialNames.push(potentialName) : console.log("This item already exists");
            }
        }

        if(typeOfFile === 'dcm' || typeOfFile === 'unknowType'){
            let segFilesList=[];
            for(let a=0;a<newFilesList.length;a++){

                let subFileTypeOfFile = newFilesList[a].name.substr(newFilesList[a].name.lastIndexOf('.')+1);
                if(subFileTypeOfFile === 'nrrd'){
                    segFilesList.push(newFilesList[a]);

                    let potentialName = newFilesList[a].webkitRelativePath.split('/')[newFilesList[a].webkitRelativePath.split('/').length-2];
                    potentialNames.indexOf(potentialName) === -1 ? potentialNames.push(potentialName) : console.log("This item already exists");
                }
            }
        }
        // console.log(potentialNames);
        $('#labelTemplate').html(labelTemplate({
            potentialLabelName:potentialNames
        }))

        $('#isLabel').click(_.bind(function(){this._isLabel()},this));
    },

    startUpload: function () {
        this.setUploadEnabled(false);
        this.$('.g-drop-zone').addClass('hide');
        this.$('.g-progress-overall').removeClass('hide');
        this.$('.g-upload-error-message').empty();

        if (this.multiFile) {
            this.$('.g-progress-current').removeClass('hide');
        }

        this.currentIndex = 0;
        this.overallProgress = 0;
        this.trigger('g:uploadStarted');

        if (!this.overrideStart) {
            this.uploadNextFile();
        }
    },

    /**
     * Enable or disable the start upload button.
     *
     * @param state {bool} Truthy for enabled, falsy for disabled.
     */
    setUploadEnabled: function (state) {
        this.$('.g-start-upload').girderEnable(state);
    },

    /**
     * Initializes the upload of a file by requesting the upload token
     * from the server. If successful, this will call _uploadChunk to send the
     * actual bytes from the file if it is of non-zero length.
     */
    uploadNextFile: function () {
        if (this.currentIndex >= this.files.length) {
            // All files have finished
            if (this.modal) {
                this.$el.modal('hide');
            }
            this.trigger('g:uploadFinished', {
                files: this.files,
                totalSize: this.totalSize
            });
            return;
        }

        this.currentFile = this.parentType === 'file' ? this.parent : new FileModel();

        this.currentFile.on('g:upload.complete', function () {
            this.files[this.currentIndex].id = this.currentFile.id;
            this.currentIndex += 1;
            this.uploadNextFile();
        }, this).on('g:upload.chunkSent', function (info) {
            this.overallProgress += info.bytes;
        }, this).on('g:upload.progress', function (info) {
            var currentProgress = info.startByte + info.loaded;

            this.$('.g-progress-current>.progress-bar').css('width',
                Math.ceil(100 * currentProgress / info.total) + '%');
            this.$('.g-progress-overall>.progress-bar').css('width',
                Math.ceil(100 * (this.overallProgress + info.loaded) /
                          this.totalSize) + '%');
            this.$('.g-current-progress-message').html(
                '<i class="icon-doc-text"/>' + (this.currentIndex + 1) + ' of ' +
                    this.files.length + ' - <b>' + info.file.name + '</b>: ' +
                    formatSize(currentProgress) + ' / ' +
                    formatSize(info.total)
            );
            this.$('.g-overall-progress-message').html('Overall progress: ' +
                formatSize(this.overallProgress + info.loaded) + ' / ' +
                formatSize(this.totalSize));
        }, this).on('g:upload.error', function (info) {
            var html = info.message + ' <a class="g-resume-upload">' +
                'Click to resume upload</a>';
            $('.g-upload-error-message').html(html);
        }, this).on('g:upload.errorStarting', function (info) {
            var html = info.message + ' <a class="g-restart-upload">' +
                'Click to restart upload</a>';
            $('.g-upload-error-message').html(html);
        }, this);

        if (this.parentType === 'file') {
            this.currentFile.updateContents(this.files[this.currentIndex]);
        } else {
            var otherParams = this.otherParams;
            if (_.isFunction(this.otherParams)) {
                otherParams = this.otherParams(this);
            }
            this.currentFile.upload(this.parent, this.files[this.currentIndex], null, otherParams);
        }
    },

    /**
     * Check whether a DataTransferItem from a drag and drop operation
     * represents a file, as opposed to a directory, URI, string, or other
     * entity.
     * @param {DataTransferItem} item - The item from a drag and drop operation.
     * @returns {boolean} True if item represents a file.
     */
    _isFile: function (item) {
        var getAsEntry = item.getAsEntry;
        if (!_.isFunction(getAsEntry)) {
            getAsEntry = item.webkitGetAsEntry;
        }
        if (!_.isFunction(getAsEntry)) {
            // Unsupported; assume item is file
            return true;
        }

        var entry = getAsEntry.call(item);
        return entry && entry.isFile;
    },
    _isLabel:function(e){
        if ($('#isLabel').is(':checked')){
            this.isLabel = true;
            console.log($('#potentialLabelNameDom'))
            $('#potentialLabelNameDom').show()
        }else{
            $('#potentialLabelNameDom').hide()
        }
    },
    validateFileType(files){
        console.log(files)
        let newFilesList = [] 
        for(let a=0;a<files.length;a++){
            if(files[a].name!=='.DS_Store'){
                newFilesList.push(files[a])
            }
        }
        this.files = newFilesList;
        // Type of uploads
        let typeOfFile;
        for(let a=0;a<newFilesList.length;a++){
            if(newFilesList[a].name.lastIndexOf('.')==-1){
                typeOfFile = 'unknowType';
            }else{
                typeOfFile = newFilesList[a].name.substr(newFilesList[a].name.lastIndexOf('.')+1);
            }
            if(typeOfFile === 'unknowType'||typeOfFile === 'dcm'){
                break;
            }
        }

        // + Check label and original file number match 
        // + 
        // +
        
        // Same hierarchy upload validation
        if(typeOfFile === 'nrrd'){
            let currentNumberOfSeparator=0;
            let previousNumberOfSeparator=0;
            // hierarchy validate
            for(let a=0;a<newFilesList.length;a++){
                
                currentNumberOfSeparator = newFilesList[a].webkitRelativePath.match(/\//g).length;
                if(a===0){
                    previousNumberOfSeparator = currentNumberOfSeparator;
                }
                else if(previousNumberOfSeparator === currentNumberOfSeparator){
                    previousNumberOfSeparator = currentNumberOfSeparator;
                }else{
                    console.error('Upload files not in the same hierarchy, please put all files in the same folders');
                    return this;
                }
            }
            // Contents validate
            let numberOfSeparator = newFilesList[0].webkitRelativePath.match(/\//g).length;
            if(numberOfSeparator>2){
                console.error('Can only contain one original file subfolder or ori+seg folders, do not have too many levels');
                return this;
            }
        }
        let segFilesList = [];
        let dcmFilesList = [];
        if(typeOfFile === 'unknowType'||typeOfFile === 'dcm'){

            // hierarchy validate
            // Contents validate

            // Has nrrd file as label
            // Their parent subfolder should be same
            // ---Project
            //     --Original
            //         -a.dcm
            //         -b.dcm
            //     --seg_a.nrrd
            //     --seg_b.nrrd(false if contain more than one under project level)
            for(let a=0;a<newFilesList.length;a++){

                let subFileTypeOfFile = newFilesList[a].name.substr(newFilesList[a].name.lastIndexOf('.')+1);
                if(subFileTypeOfFile === 'nrrd'){
                    segFilesList.push(newFilesList[a]);

                    if(newFilesList[a].webkitRelativePath.match(/\//g).length>2){
                        console.error('Do not have too many levels for your labels');
                        return this;
                    }
                }else{
                    dcmFilesList.push(newFilesList[a]);
                    if(newFilesList[a].webkitRelativePath.match(/\//g).length>3){
                        console.error('Do not have too many levels for your dicom files');
                        return this;
                    }
                }
            
            }

            
            let currentParentName="";
            let previousParentName="";

            // Check only 'nrrd' segmentation files 
            for(let a=0;a<segFilesList.length;a++){
                
                currentParentName = segFilesList[a].webkitRelativePath.split('/')[segFilesList[a].webkitRelativePath.split('/').length-2];
                if(a===0){
                    previousParentName = currentParentName;
                }
                else if(previousParentName === currentParentName){
                    previousParentName = currentParentName;
                    // ---Project
                    //     --Original
                    //         -a.dcm
                    //         -b.dcm
                    //     --seg_a.nrrd
                    //     --seg_b.nrrd
                    if(segFilesList[a].webkitRelativePath.match(/\//g).length===1){
                        console.error('Please keep all your labels file under label folder, or you may have more than one labels for only one original image');
                        return this;
                    }
                }else{
                    console.error('Please put all label files in the same folders');
                    return this;
                }
            }

            // For dicom files
            // Their parent subfolder || parent's parent subfolder should be same

            let dcmCurrentParentName="";
            let dcmPreviousParentName="";
            let dcmCurrentParentParentName="";
            let dcmPreviousParentParentName="";            
            for(let a=0;a<dcmFilesList.length;a++){
                
                dcmCurrentParentName = dcmFilesList[a].webkitRelativePath.split('/')[dcmFilesList[a].webkitRelativePath.split('/').length-2];
                dcmCurrentParentParentName = dcmFilesList[a].webkitRelativePath.split('/')[dcmFilesList[a].webkitRelativePath.split('/').length-3];
                if(a===0){
                    dcmPreviousParentName = dcmCurrentParentName;
                    dcmPreviousParentParentName = dcmCurrentParentParentName;
                }
                // ---Project(Case I)
                //     --Folder1
                //         -a.dcm
                //         -b.dcm
                //         -c.dcm
                //         -d.dcm
                // ----Project(Case II)
                //     ---Folder1
                //         --Folder2
                //             -a.dcm
                //             -b.dcm
                //         --Folder3
                //             -c.dcm
                //             -d.dcm
    
                else if(dcmPreviousParentName === dcmCurrentParentName||dcmPreviousParentParentName=== dcmCurrentParentParentName){
                    dcmPreviousParentName = dcmCurrentParentName;
                    dcmPreviousParentParentName = dcmCurrentParentParentName;
                }else{
                    console.error('Please put all dicom files in the same level folders');
                    return this;
                }
            }

            // Special case
            // ---Project
            //     --oriFolder1
            //         -a.dcm
            //         -b.dcm
            //     --oriFolder2
            //         -c.dcm
            //         -d.dcm
            //     --segFolder
            //         -aSeg.nrrd
            //         -bSeg.nrrd
            if(segFilesList.length){
                if(segFilesList[0].webkitRelativePath.match(/\//g).length===dcmFilesList[0].webkitRelativePath.match(/\//g).length){
                    console.error('Please merge all you dicom files into the same folder');
                    return this;
                }
            }

        }

        let imageSetName=files[0].webkitRelativePath.substr(0,files[0].webkitRelativePath.indexOf('/'));
        console.log(files[0].webkitRelativePath.substr(0,files[0].webkitRelativePath.indexOf('/')));

        let fields = {name:imageSetName,description:""};
        let options = {};
        var folder = new FolderModel();
        folder.set(_.extend(fields, {
            parentType: this.parent.resourceName,
            parentId: this.parent.get('_id')
        }));
        folder.on('g:saved', function (res) {


            // this.$el.modal('hide');
            // this.trigger('g:saved', folder);
            console.log(folder);
            let imageSetFolderId = folder.get('_id');


            if(typeOfFile === 'unknowType'||typeOfFile === 'dcm'){
                // Has at least one nrrd file in dicom dataset as label
                if(segFilesList.length){
                    // For labels uploading
                    // segFilesList that qualified will be under the same parent folder
                    let dcmNumberOfSeparator = segFilesList[0].webkitRelativePath.match(/\//g);
                    if(dcmNumberOfSeparator.length === 1){
                        //segFilesList should only content one
                        for(let a=0;a<segFilesList.length;a++){
                            let fileName = segFilesList[a].name;
                            fields={
                                name: fileName,
                                description: 'Original nrrd file'
                            },
                            options={
                                folderId: folder.get('_id')
                            }
                            this.createItemsAndUploadFiles(fields,options,segFilesList[a],segFilesList.length);
                        }
                    }else{
                        let dcmLabelName = segFilesList[0].webkitRelativePath.split('/')[segFilesList[0].webkitRelativePath.split('/').length-2]
                        fields={
                                name: dcmLabelName,
                                description: 'Nrrd file labels'
                        },
                        options={
                            folderId: folder.get('_id')
                        }
                        this.createAnItemAndUploadFiles(fields,options,segFilesList)
                    }
                }
                
                let dcmDcmNumberOfSeparator = dcmFilesList[0].webkitRelativePath.match(/\//g);
                // For dcm uploading
                if(dcmDcmNumberOfSeparator.length === 1){
                    let dcmLabelName = dcmFilesList[0].webkitRelativePath.split('/')[dcmFilesList[0].webkitRelativePath.split('/').length-2]
                    fields={
                            name: dcmLabelName,
                            description: 'dicom files'
                    },
                    options={
                        folderId: folder.get('_id')
                    }
                    this.createAnItemAndUploadFiles(fields,options,dcmFilesList)
                }
                else if(dcmDcmNumberOfSeparator.length === 2){
                    let allParentfolders  = [];
                    for(let a=0;a<dcmFilesList.length;a++)
                    {
                        let dcmParentfolderName = dcmFilesList[a].webkitRelativePath.split('/')[dcmFilesList[0].webkitRelativePath.split('/').length-2];
                        if(allParentfolders.indexOf(dcmParentfolderName)=== -1){
                            allParentfolders.push(dcmParentfolderName);
                        }
                    }
                    
                    let rearragedSubFolders=[];
                    for(let a=0;a<allParentfolders.length;a++)
                    {
                        let sub=[];
                        for(let b=0;b<dcmFilesList.length;b++)
                        {   
                            let dcmParentfolderName = dcmFilesList[b].webkitRelativePath.split('/')[dcmFilesList[b].webkitRelativePath.split('/').length-2];
                            if(dcmParentfolderName===allParentfolders[a])
                            {sub.push(dcmFilesList[b])}
                        }
                        rearragedSubFolders.push(sub);
                    }

                    for(let a=0;a<rearragedSubFolders.length;a++)
                    {
                        let dcmLabelName = rearragedSubFolders[a][0].webkitRelativePath.split('/')[rearragedSubFolders[a][0].webkitRelativePath.split('/').length-2]
                        fields={
                                name: dcmLabelName,
                                description: 'dicom files'
                        },
                        options={
                            folderId: folder.get('_id')
                        }
                        this.createAnItemAndUploadFiles(fields,options,rearragedSubFolders[a])
                    }
                }
                else{
                    let dcmSubfolder = new FolderModel();
                    let oriFolderName = dcmFilesList[0].webkitRelativePath.split('/')[dcmFilesList[0].webkitRelativePath.split('/').length-3]
                    let fields = {name:oriFolderName,description:""};
                    dcmSubfolder.set(_.extend(fields, {
                        parentType: 'folder',
                        parentId: imageSetFolderId
                    }));
                    dcmSubfolder.on('g:saved', function (res) {

                        let allParentfolders  = [];
                        for(let a=0;a<dcmFilesList.length;a++)
                        {
                            let dcmParentfolderName = dcmFilesList[a].webkitRelativePath.split('/')[dcmFilesList[0].webkitRelativePath.split('/').length-2];
                            if(allParentfolders.indexOf(dcmParentfolderName)=== -1){
                                allParentfolders.push(dcmParentfolderName);
                            }
                        }
                        
                        let rearragedSubFolders=[];
                        for(let a=0;a<allParentfolders.length;a++)
                        {
                            let sub=[];
                            for(let b=0;b<dcmFilesList.length;b++)
                            {   
                                let dcmParentfolderName = dcmFilesList[b].webkitRelativePath.split('/')[dcmFilesList[b].webkitRelativePath.split('/').length-2];
                                if(dcmParentfolderName===allParentfolders[a])
                                {sub.push(dcmFilesList[b])}
                            }
                            rearragedSubFolders.push(sub);
                        }

                        for(let a=0;a<rearragedSubFolders.length;a++)
                        {
                            let dcmLabelName = rearragedSubFolders[a][0].webkitRelativePath.split('/')[rearragedSubFolders[a][0].webkitRelativePath.split('/').length-2]
                            fields={
                                    name: dcmLabelName,
                                    description: 'dicom files'
                            },
                            options={
                                folderId: dcmSubfolder.get('_id')
                            }
                            this.createAnItemAndUploadFiles(fields,options,rearragedSubFolders[a])
                        }
                    }, this).on('g:error', function (err) {
                        this.$('.g-validation-failed-message').text(err.responseJSON.message);
                        this.$('button.g-save-folder').girderEnable(true);
                        this.$('#g-' + err.responseJSON.field).focus();
                    }, this).save();
                }
            }
            if(typeOfFile === 'nrrd'){
                console.log('all nrrd');
                //nrrd should only have only one type
                let numberOfSeparator = newFilesList[0].webkitRelativePath.match(/\//g);
                // --Original(or label)
                //    -a.nrrd
                //    -b.nrrd
                if(numberOfSeparator.length === 1){
                    console.log(this.isLabel);
                    if(!this.isLabel){
                        /*create item with fileName*/
                        for(let a=0;a<newFilesList.length;a++){
                            let fileName = newFilesList[a].name;
                            fields={
                                name: fileName,
                                description: 'Original nrrd file'
                            },
                            options={
                                folderId: folder.get('_id')
                            }
                            this.createItemsAndUploadFiles(fields,options,newFilesList[a],newFilesList.length);
                        }
                    }else{
                        fields={
                                name: imageSetName,
                                description: 'Nrrd file labels'
                        },
                        options={
                            folderId: folder.get('_id')
                        }
                        this.createAnItemAndUploadFiles(fields,options,newFilesList)
                    }
                }
                // ---Project1
                //     --Original
                //         -a.nrrd
                //         -b.nrrd
                //    (--Segmentation
                //         -aSeg.nrrd
                //         -bSeg.nrrd)
                else if(numberOfSeparator.length === 2){
                    let allSubfolders=[];
                    for(let a=0;a<newFilesList.length;a++)
                    {
                        let subfolderName = newFilesList[a].webkitRelativePath.split('/')[1];
                        if(allSubfolders.indexOf(subfolderName)=== -1){
                            allSubfolders.push(subfolderName);
                        }
                    }

                    this.labelFolderName=$('#potentialLabelName').val();
                    // Has segmentation folder
                    // ---Project1
                    //     --Original
                    //         -a.nrrd
                    //         -b.nrrd
                    //    --Segmentation
                    //         -aSeg.nrrd
                    //         -bSeg.nrrd
                    if(allSubfolders.indexOf(this.labelFolderName)!==-1&&allSubfolders.length<3){

                        let oriFilesList = [];
                        let segFilesList = [];
                        for(let a=0;a<newFilesList.length;a++){
                            if(newFilesList[a].webkitRelativePath.split('/')[1]===this.labelFolderName)
                            {
                                segFilesList.push(newFilesList[a]);
                            }
                            if(newFilesList[a].webkitRelativePath.split('/')[1]!==this.labelFolderName)
                            {
                                oriFilesList.push(newFilesList[a]);
                            }
                        }

                        // console.log(segFilesList);
                        // console.log(oriFilesList);
                        //Segmentation Item
                        let segItemName = allSubfolders[0];
                        fields={
                                name: this.labelFolderName,
                                description: 'Nrrd file labels'
                        },
                        options={
                            folderId: imageSetFolderId
                        }
                        this.createAnItemAndUploadFiles(fields,options,segFilesList)

                        //original folder
                        let indexOfOri = (allSubfolders.length - 1 - allSubfolders.indexOf(this.labelFolderName));
                        let oriFolderName = allSubfolders[indexOfOri];
                        let subfolder = new FolderModel();
                        let fields = {name:oriFolderName,description:""};
                        subfolder.set(_.extend(fields, {
                            parentType: 'folder',
                            parentId: imageSetFolderId
                        }));
                        subfolder.on('g:saved', function (res) {
                            /*create item with fileName*/
                            for(let a=0;a<oriFilesList.length;a++){
                                let fileName = oriFilesList[a].name;
                                fields={
                                    name: fileName,
                                    description: 'Original nrrd file'
                                },
                                options={
                                    folderId: subfolder.get('_id')
                                }
                                this.createItemsAndUploadFiles(fields,options,oriFilesList[a],oriFilesList.length);
                            }
                        }, this).on('g:error', function (err) {
                            this.$('.g-validation-failed-message').text(err.responseJSON.message);
                            this.$('button.g-save-folder').girderEnable(true);
                            this.$('#g-' + err.responseJSON.field).focus();
                        }, this).save();

                    }
                    // ---Project1
                    //     --Original
                    //         -a.nrrd
                    //         -b.nrrd
                    else if(allSubfolders.length===1){
                        if(!this.isLabel){
                            let subfolder = new FolderModel();
                            let oriFolderName = allSubfolders[0];
                            let fields = {name:oriFolderName,description:""};
                            subfolder.set(_.extend(fields, {
                                parentType: 'folder',
                                parentId: imageSetFolderId
                            }));
                            subfolder.on('g:saved', function (res) {
                                /*create item with fileName*/
                                for(let a=0;a<newFilesList.length;a++){
                                    let fileName = newFilesList[a].name;
                                    fields={
                                        name: fileName,
                                        description: 'Original nrrd file'
                                    },
                                    options={
                                        folderId: subfolder.get('_id')
                                    }
                                    this.createItemsAndUploadFiles(fields,options,newFilesList[a],newFilesList.length);
                                }
                                
                            }, this).on('g:error', function (err) {
                                this.$('.g-validation-failed-message').text(err.responseJSON.message);
                                this.$('button.g-save-folder').girderEnable(true);
                                this.$('#g-' + err.responseJSON.field).focus();
                            }, this).save();
                        }else{
                            let segItemName = allSubfolders[0];
                            fields={
                                    name: segItemName,
                                    description: 'Nrrd file labels'
                            },
                            options={
                                folderId: imageSetFolderId
                            }
                            this.createAnItemAndUploadFiles(fields,options,newFilesList)
                        }
                    }
                    else{
                        console.error('Can only contain one original subfolder or ori+seg folders');
                        return this;
                    }

                }
            }

        }, this).on('g:error', function (err) {
            this.$('.g-validation-failed-message').text(err.responseJSON.message);
            this.$('button.g-save-folder').girderEnable(true);
            this.$('#g-' + err.responseJSON.field).focus();
        }, this).save();
    },
    setLabelName(e){
        this.labelFolderName = e.currentTarget.text;
    },
    createFolder: function (fields,options) {
        var folder = new FolderModel();
        folder.set(_.extend(fields, options));
        folder.on('g:saved', function (res) {
            // this.$el.modal('hide');
            
            // this.trigger('g:saved', folder);
            
            this.parentFolder = new FolderModel(res)

            this.parentFolderId = this.parentFolder.get('id')
        }, this).on('g:error', function (err) {
            this.$('.g-validation-failed-message').text(err.responseJSON.message);
            this.$('button.g-save-folder').girderEnable(true);
            this.$('#g-' + err.responseJSON.field).focus();
        }, this).save();
    },
    createItemsAndUploadFiles: function (fields,options,file,numOfFiles) {
        var item = new ItemModel();
        item.set(_.extend(fields, options));

        this.currentIndex = 0;
        this.overallProgress = 0;
        this.$('.g-drop-zone').addClass('hide');
        this.$('.g-progress-overall').removeClass('hide');
        this.$('.g-progress-current').removeClass('hide');
        this.$('.g-upload-error-message').empty();

        item.on('g:saved', function (res) {
            let otherParams={};

            let parentItem = item;
            // console.log(item.get('_id'))
            let newFile = new FileModel();

            newFile.on('g:upload.complete', function () {
                // this.files[this.currentIndex].id = this.newFile.id;
                 this.currentIndex += 1;
                // this.uploadNextFile();
                if (this.currentIndex >= numOfFiles) {
                    // All files have finished
                    if (this.modal) {
                        this.$el.modal('hide');
                    }
                    this.trigger('g:uploadFinished', {
                        files: file,
                        totalSize: this.totalSize
                    });
                    return;
                }
            }, this).on('g:upload.chunkSent', function (info) {
                this.overallProgress += info.bytes;
            }, this).on('g:upload.progress', function (info) {
                var currentProgress = info.startByte + info.loaded;

                this.$('.g-progress-current>.progress-bar').css('width',
                    Math.ceil(100 * currentProgress / info.total) + '%');
                this.$('.g-progress-overall>.progress-bar').css('width',
                    Math.ceil(100 * (this.overallProgress + info.loaded) /
                              this.totalSize) + '%');
                this.$('.g-current-progress-message').html(
                    '<i class="icon-doc-text"/>' + (this.currentIndex + 1) + ' of ' +
                        this.files.length + ' - <b>' + info.file.name + '</b>: ' +
                        formatSize(currentProgress) + ' / ' +
                        formatSize(info.total)
                );
                this.$('.g-overall-progress-message').html('Overall progress: ' +
                    formatSize(this.overallProgress + info.loaded) + ' / ' +
                    formatSize(this.totalSize));
            }, this).on('g:upload.error', function (info) {
                var html = info.message + ' <a class="g-resume-upload">' +
                    'Click to resume upload</a>';
                $('.g-upload-error-message').html(html);
            }, this).on('g:upload.errorStarting', function (info) {
                var html = info.message + ' <a class="g-restart-upload">' +
                    'Click to restart upload</a>';
                $('.g-upload-error-message').html(html);
            }, this);

            // this.$el.modal('hide');
            // this.trigger('g:saved', item);

            newFile.upload(parentItem, file, null, otherParams);
        }, this).on('g:error', function (err) {
            this.$('.g-validation-failed-message').text(err.responseJSON.message);
            this.$('button.g-save-item').girderEnable(true);
            this.$('#g-' + err.responseJSON.field).focus();
        }, this).save();
    },
    createAnItemAndUploadFiles: function (fields,options,files) {
        var item = new ItemModel();
        item.set(_.extend(fields, options));

        this.currentIndex = 0;
        this.overallProgress = 0;
        this.$('.g-drop-zone').addClass('hide');
        this.$('.g-progress-overall').removeClass('hide');
        this.$('.g-progress-current').removeClass('hide');
        this.$('.g-upload-error-message').empty();

        item.on('g:saved', function (res) {
            let otherParams={};

            let parentItem = item;
            console.log(item.get('_id'))
            let newFile = new FileModel();
            // this.$el.modal('hide');
            // this.trigger('g:saved', item);

            newFile.on('g:upload.complete', function () {
                // this.files[this.currentIndex].id = this.newFile.id;
                 this.currentIndex += 1;
                // this.uploadNextFile();
                if (this.currentIndex >= this.files.length) {
                    // All files have finished
                    if (this.modal) {
                        this.$el.modal('hide');
                    }
                    this.trigger('g:uploadFinished', {
                        files: this.files,
                        totalSize: this.totalSize
                    });
                    return;
                }
            }, this).on('g:upload.chunkSent', function (info) {
                this.overallProgress += info.bytes;
            }, this).on('g:upload.progress', function (info) {
                var currentProgress = info.startByte + info.loaded;

                this.$('.g-progress-current>.progress-bar').css('width',
                    Math.ceil(100 * currentProgress / info.total) + '%');
                this.$('.g-progress-overall>.progress-bar').css('width',
                    Math.ceil(100 * (this.overallProgress + info.loaded) /
                              this.totalSize) + '%');
                this.$('.g-current-progress-message').html(
                    '<i class="icon-doc-text"/>' + (this.currentIndex + 1) + ' of ' +
                        this.files.length + ' - <b>' + info.file.name + '</b>: ' +
                        formatSize(currentProgress) + ' / ' +
                        formatSize(info.total)
                );
                this.$('.g-overall-progress-message').html('Overall progress: ' +
                    formatSize(this.overallProgress + info.loaded) + ' / ' +
                    formatSize(this.totalSize));
            }, this).on('g:upload.error', function (info) {
                var html = info.message + ' <a class="g-resume-upload">' +
                    'Click to resume upload</a>';
                $('.g-upload-error-message').html(html);
            }, this).on('g:upload.errorStarting', function (info) {
                var html = info.message + ' <a class="g-restart-upload">' +
                    'Click to restart upload</a>';
                $('.g-upload-error-message').html(html);
            }, this);

            for (let a=0;a<files.length;a++){
                newFile.upload(parentItem, files[a], null, otherParams);
            }
        }, this).on('g:error', function (err) {
            this.$('.g-validation-failed-message').text(err.responseJSON.message);
            this.$('button.g-save-item').girderEnable(true);
            this.$('#g-' + err.responseJSON.field).focus();
        }, this).save();
    }
});

export default UploadWidget;
