Plugins:
  SSR

APIs:
  Method  url                                   Model/Collection      comment       
  (History View)
  GET     /SSR                                       √                Tasks record

  (Mapping Link View)
  GET     /SSR/segmentationCheck                     √                Link/fetch seg to ori item/folder
  GET     /SSR/segmentationCheckFolder 
  PUT     /SSR/segmentationLink/{oriId}/{segId} 
  DELETE  /SSR/segmentationRemove/{oriId}/{segId}                     Delete seg from ori folder(recusively)

  PUT     /SSR/Visualizer/jobId                                       Updte visualizer information

   X      /SSR/prepareInputs
   ?      /SSR/item
   ?      /SSR/{targetFileId}/{sourceFileId}

  (Datasource/Mapping folder list View)
  GET     /SSR/folder                                √                Folder list with more informations (linked segmentations information)
  GET     /SSR/folder/{id}
   ?      /SSR/Folder