// Route & Query TODO List


/*App*/
// Query
step=View
step=Link
step=Analysis
step=History


/*
  View
*/

// Route
// User data source from girder
/api/v1/ds_user/:id

// User/folder data source from girder
/api/v1/ds_user/:id/folder/:id

// Collection(SSR) data source from girder
/api/v1/ds_collection/:id

// Collection(SSR)/folder data source from girder
/api/v1/ds_collection/:id/folder/:id

// SAIP data source
/api/v1/ds_saip

// Sub SAIP data source??
// ...
// ...


// Query
// Current view image [Item]
PreviewFileItem=[item].id
// Current view image's folder[Folder]
filesystemFolder=[folder].id
// Selected mode 
mode=(edit,view)
// Cursor size 
cursorSize=[int]
// Cursor color 
labelColor=(rgb(r,g,b))
// Editting segmentation location [Folder]
editSegmentationFolderId=[folder].id


// Issue
// 1. First time edit mode will not work  √
// 2. Nav height √
// 3. Image selection should only display on View



/*
  Link
*/

// Route    √
// User data source from girder for original images          ------>          for original/seg images 
/api/v1/ori_user/:id                                         ------>          /api/v1/qc_user/:id   

// Collection(SSR) data source from girder for original images          ------>          for original/seg images 
/api/v1/ori_collection/:id                                              ------>          /api/v1/qc_collection/:id   


// Issue
// 1. Image selector should be hidden   √
// 2. Check/link button arrangement     √
// 3. Fancy link template               x



