import Collection from 'girder/collections/Collection';
import FolderModel from 'girder/models/FolderModel';

var FolderCollection = Collection.extend({
    resourceName: 'SSR/folder',
    model: FolderModel,

    pageLimit: 100
});

export default FolderCollection;
