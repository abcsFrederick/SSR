import os
import copy
from girder import events
from girder.api.rest import Resource,filtermodel
from girder.utility.webroot import Webroot
from girder.api.describe import Description, autoDescribeRoute,describeRoute
from girder.api import access
from girder.models.file import File as FileModel
from girder.models.folder import Folder as FolderModel
from .models.folder import Folder as SSRFolderModel
from .models.item import Item as SSRItemModel

from girder.models.item import Item as ItemModel
from girder.constants import AccessType,TokenScope
from girder.models.upload import Upload
import girder_client
from six import StringIO
from .handler import store_record
from .handler import update_record
from .models.record import Record
from girder.plugins.jobs.models.job import Job
from girder.models.user import User
import datetime


_template = os.path.join(
	os.path.dirname(__file__),
	'webroot.mako'
)

class SSR(Resource):
	def __init__(self):
		super(SSR,self).__init__()
		self.resourceName='SSR'
		self.route('GET', (),self.findAllRecord)
		self.route('GET',('prepareInputs',),self.prepareInputs)
		self.route('GET', ('folder',),self.findFolder)
		self.route('GET', ('item',),self.findItem)
		self.route('POST',('folder',),self.ssrCreateFolder)
		self.route('GET',('segmentationCheck',':originalItemId'),self.segmentationCheck)
		self.route('GET',('segmentationCheckFolder',':originalFolderId'),self.segmentationCheckFolder)
		self.route('PUT',(':targetFileId',':sourceFileId'),self.fileUpdate)
		self.route('PUT', ('Visualizer',':jobId'),self.visualizerUpdate)
		self.route('PUT',('segmentationLink',':originalItemId',':segmentationItemId'),self.segmentationLink)
		self.route('PUT',('segmentationLinkEditing',':originalFolderId',':segmentationEditingFolderId'),self.segmentationLinkEditing)
		self.route('DELETE',('segmentationRemove',':originalItemId',':segmentationItemId'),self.segmentationRemove)

	@access.user
	@autoDescribeRoute(
		Description('Check segmentations item of current user')
		.param('originalItemId','Original item Id.',paramType='path')
		.errorResponse())
	def segmentationCheck(self, originalItemId):
		user = self.getCurrentUser()
		
		originalItem = ItemModel().load(originalItemId,level=AccessType.READ,user=user)
		segmentationOfCurrentUser = []
		needToRemove = []
		if 'segmentation' not in originalItem.keys() and 'editing' not in originalItem.keys():
			return 'There is neither segmentation nor editing linked to this [item] '
		else:
			if len(originalItem['segmentation']) != 0 or len(originalItem['editing'][str(user['_id'])]) != 0:
				# check released segmentations
				if len(originalItem['segmentation']) != 0:
					for existSegmentation in originalItem['segmentation']:
						accessFlag = False
						# Sync with achrive, remove segmentatioin if item has been removed
						if ItemModel().load(existSegmentation['_id'],level=AccessType.READ,user=user):
							# check access permission
							parentFolder = FolderModel().load( existSegmentation['folderId'], level=AccessType.READ,user=user)

							if user['admin']:
								# print existSegmentation
								existSegmentation['folderName'] = parentFolder['name']
								existSegmentation['access'] = 2
								segmentationOfCurrentUser.append(existSegmentation)
							else:

								# print 'parent folder is'
								# print parentFolder
								# print 'parent folder groups are'
								# print  parentFolder['access']['groups']
								allAccess_segmentation = []
								for group_segmentation in parentFolder['access']['groups']:
									allAccess_segmentation.append(str(group_segmentation['id']))
								# print 'parent folder users are'
								# print  parentFolder['access']['users']
								for user_segmentation in parentFolder['access']['users']:
									allAccess_segmentation.append(str(user_segmentation['id']))


								# print 'all access for this segmentation are'
								# print allAccess_segmentation
								access_level = -1
								if (str(user['_id'])) in allAccess_segmentation:
									accessFlag = True
									for each in parentFolder['access']['users']:
										if str(each['id']) == str(user['_id']):
											access_level = max(access_level, each['level'])
								# 			print 'user access level'
								# 			print access_level
								# print '86'
								for group in user['groups']:
									# print str(group)
									# print allAccess_segmentation
									if str(group) in allAccess_segmentation:
										accessFlag = True
										
										# print parentFolder['access']['groups']
										for each in parentFolder['access']['groups']:
											if str(each['id']) == str(group):
												access_level = max(access_level, each['level'])
												
												# print 'group access level'
												# print access_level
								if accessFlag:
									# print existSegmentation
									existSegmentation['folderName'] = parentFolder['name']
									existSegmentation['access'] = access_level
									segmentationOfCurrentUser.append(existSegmentation)
								# return allAccess_currentUser
						else:
							needToRemove.append(existSegmentation)
					for each in needToRemove:
						originalItem['segmentation'].remove(each)

					ItemModel().updateItem(originalItem)
				# return originalItem['editing']
				# check editing segmentations
				editingNeedToRemove = []
				if 'editing' not in originalItem.keys():
					print 'There is no edited linked yet'
				else:
					if str(user['_id']) not in originalItem['editing'].keys():
						print 'There is no edited linked for this user'
					else:
						if len(originalItem['editing'][str(user['_id'])]) != 0:
							for existEditingSegmentation in originalItem['editing'][str(user['_id'])]:

								# Sync with achrive, remove segmentatioin if item has been removed
								if ItemModel().load(existEditingSegmentation['_id'],level=AccessType.READ,user=user):
									parentFolder = FolderModel().load( existEditingSegmentation['folderId'], level=AccessType.READ,user=user)

									existEditingSegmentation['folderName'] = parentFolder['name']
									segmentationOfCurrentUser.append(existEditingSegmentation)

								else:
									editingNeedToRemove.append(existEditingSegmentation)
							for each in editingNeedToRemove:
								originalItem['editing'][str(user['_id'])].remove(each)

							ItemModel().updateItem(originalItem)
				return segmentationOfCurrentUser
			else:
				return 'No any segmentations nor editing(currentUser) linked in original [item] '

	@access.user
	@autoDescribeRoute(
		Description('Check segmentations folder of current user')
		.param('originalFolderId','Original Folder Id.',paramType='path')
		.errorResponse())
	def segmentationCheckFolder(self, originalFolderId):
		user = self.getCurrentUser()
		
		originalFolder = FolderModel().load(originalFolderId,level=AccessType.READ,user=user)
		segmentationOfCurrentUser = []
		needToRemove = []
		if 'segmentation' not in originalFolder.keys() and 'editing' not in originalFolder.keys():
			return 'There is neither segmentation nor editing linked to this [folder]'
		else:
			if len(originalFolder['segmentation']) != 0 or len(originalFolder['editing'][str(user['_id'])]) != 0:
				# check released segmentations
				if len(originalFolder['segmentation']) != 0:
					for existSegmentation in originalFolder['segmentation']:
						# Sync with achrive, remove segmentatioin if folder has been removed
						if FolderModel().load(existSegmentation['_id'],level=AccessType.READ,user=user):
							# if existSegmentation['creatorId'] == user['_id']:
							# Access control may not necessary because if folder is available for current user, 
							# its all attached segmentations should be accessible as well
							segmentationOfCurrentUser.append(existSegmentation)

						else:
							needToRemove.append(existSegmentation)
					for each in needToRemove:
						originalFolder['segmentation'].remove(each)

					FolderModel().updateFolder(originalFolder)

				print '128'
				print len(originalFolder['segmentation'])
				# check editing segmentations
				if 'editing' not in originalFolder.keys():
					print 'There is no edited linked yet'
				else:
					if str(user['_id']) not in originalFolder['editing'].keys():
						print 'There is no edited linked for this user'
					else:
						if len(originalFolder['editing'][str(user['_id'])]) != 0:
							for existEditingSegmentation in originalFolder['editing'][str(user['_id'])]:

								# Sync with achrive, remove segmentatioin if item has been removed
								if FolderModel().load(existEditingSegmentation['_id'],level=AccessType.READ,user=user):
								
									segmentationOfCurrentUser.append(existEditingSegmentation)

								else:
									needToRemove.append(existEditingSegmentation)
							for each in needToRemove:
								originalFolder['editing'][str(user['_id'])].remove(each)

							FolderModel().updateFolder(originalFolder)
				return segmentationOfCurrentUser
			else:
				return 'No any segmentations nor editing(currentUser) linked in original [folder] '

	@access.user
	@autoDescribeRoute(
		Description('Remove a segmentation item from original item,  and remove their parent folders at the same time')
		.param('originalItemId','Original item Id.',paramType='path')
		.param('segmentationItemId','Segmentation item Id.',paramType='path')
		.errorResponse())
	def segmentationRemove(self, originalItemId, segmentationItemId):
		user = self.getCurrentUser()
		
		originalItem = ItemModel().load(originalItemId,level=AccessType.READ,user=user)
		segmentationItem = ItemModel().load(segmentationItemId,level=AccessType.READ,user=user)

		originalFolder = FolderModel().load(originalItem['folderId'],level=AccessType.READ,user=user)
		segmentationFolder = FolderModel().load(segmentationItem['folderId'],level=AccessType.READ,user=user)

		# Unlink item
		if 'segmentation' not in originalItem.keys():
			return 'There is no segmentation linked to this [item]'
		else:
			if len(originalItem['segmentation']) != 0:
				for existSegmentation in originalItem['segmentation']:
					
					# if not existSegmentation 
					#		return null
					if existSegmentation['_id'] == segmentationItem['_id']:
						if existSegmentation['creatorId'] == user['_id']:
							originalItem['segmentation'].remove(existSegmentation)
							ItemModel().updateItem(originalItem)
							
						else:
							return 'Contact Creator for removing segmentation'
					else:
						return 'Specified Segmentation is not exist'
			else:
				return 'No any segmentations linked in original [item] '

		# Unlink folder
		if 'segmentation' not in originalFolder.keys():
			return 'There is no segmentation linked to this [folder]'
		else:
			if len(originalFolder['segmentation']) != 0:
				for existSegmentation in originalFolder['segmentation']:
					
					# if not existSegmentation 
					#		return null
					if existSegmentation['_id'] == segmentationFolder['_id']:
						if existSegmentation['creatorId'] == user['_id']:
							originalFolder['segmentation'].remove(existSegmentation)
							FolderModel().updateFolder(originalFolder)
						else:
							return 'Contact Creator for removing segmentation'
					else:
						return 'Specified Segmentation is not exist'
			else:
				return 'No any segmentations linked in original [folder] '

		return originalItem

	@access.user
	@autoDescribeRoute(
		Description('Link a segmentation item to original item, and link their parent folders at the same time')
		.param('originalItemId','Original item Id.',paramType='path')
		.param('segmentationItemId','Segmentation item Id.',paramType='path')
		.errorResponse())
	def segmentationLink(self, originalItemId, segmentationItemId):
		user = self.getCurrentUser()
		originalItem = ItemModel().load(originalItemId,level=AccessType.READ,user=user)
		segmentationItem = ItemModel().load(segmentationItemId,level=AccessType.READ,user=user)
		originalFolder = FolderModel().load(originalItem['folderId'],level=AccessType.READ,user=user)
		segmentationFolder = FolderModel().load(segmentationItem['folderId'],level=AccessType.READ,user=user)

		segmentationItem['timeStamp'] = datetime.datetime.utcnow()
		segmentationFolder['timeStamp'] = datetime.datetime.utcnow()
		# Link item
		if 'segmentation' in segmentationItem.keys():
			return 'Segmentation [item] has a segmentation linked on it, please remove its segmentation first'
		if 'segmentation' in originalItem.keys():	
			isExist = False
			#	There is an exist segmentation
			for existSegmentation in originalItem['segmentation']:
				if existSegmentation['_id'] == segmentationItem['_id']:
					isExist = True
					#	Same user update a same item, normally same item will belong to the same user
					if existSegmentation['creatorId'] == segmentationItem['creatorId']:
						existSegmentation['timeStamp'] = datetime.datetime.utcnow()
					#	Different user update a same item will make a new segmentation record
					else:
						# originalItem assignment could be a *danger* action in originalItem loop
						originalItem['segmentation'].append(segmentationItem)
			if not isExist:
				originalItem['segmentation'].append(segmentationItem)
		else:
			originalItem['segmentation'] = []
			originalItem['segmentation'].append(segmentationItem)
		ItemModel().updateItem(originalItem)

		# Link Folder
		if 'segmentation' in segmentationFolder.keys():
			return 'Segmentation [folder] has a segmentation linked on it, please remove its segmentation first'
		if 'segmentation' in originalFolder.keys():	
			isExist = False
			#	There is an exist segmentation
			for existSegmentation in originalFolder['segmentation']:
				if existSegmentation['_id'] == segmentationFolder['_id']:
					isExist = True
					#	Same user update a same item, normally same item will belongs to the same user
					if existSegmentation['creatorId'] == segmentationFolder['creatorId']:
						existSegmentation['timeStamp'] = datetime.datetime.utcnow()
					#	Different user update a same item will make a new segmentation record
					else:
						originalFolder['segmentation'].append(segmentationFolder)
			if not isExist:
				originalFolder['segmentation'].append(segmentationFolder)
		else:
			originalFolder['segmentation'] = []
			originalFolder['segmentation'].append(segmentationFolder)
		FolderModel().updateFolder(originalFolder)
		return originalItem

	@access.user
	@autoDescribeRoute(
		Description('Link a segmentation item to original item, and link their parent folders at the same time')
		.param('originalFolderId','Original item Id.',paramType='path')
		.param('segmentationEditingFolderId','Segmentation item Id.',paramType='path')
		.errorResponse())
	def segmentationLinkEditing(self,originalFolderId,segmentationEditingFolderId):
		user = self.getCurrentUser()

		originalFolder = FolderModel().load(originalFolderId,level=AccessType.READ,user=user)
		copiedSegmentationFolder = FolderModel().load(segmentationEditingFolderId,level=AccessType.READ,user=user)
		for itemsInOriginal in FolderModel().childItems(originalFolder):

			referenceSegs = [seg['_id'] for seg in itemsInOriginal['segmentation']]

			for itemInCopiedSegmentationFolder in FolderModel().childItems(copiedSegmentationFolder):

				if itemInCopiedSegmentationFolder['copyOfItem'] in referenceSegs:

					if 'segmentation' in itemInCopiedSegmentationFolder.keys():
						return 'Segmentation [folder] has a segmentation linked on it, please remove its segmentation first'
					
					if 'editing' not in itemsInOriginal.keys():
						itemsInOriginal['editing'] = {}

					# print itemsInOriginal['editing'].keys()
					# print user['_id'] in itemsInOriginal['editing'].keys()
					if str(user['_id']) in itemsInOriginal['editing'].keys():
						isExist = False

						#	There is an exist editing segmentation
						for existEditingSegmentation in itemsInOriginal['editing'][str(user['_id'])]:
							# it should never be same, if this api is called means copied from collection is made which will assign
							# a different _id fro new copy. If editing copy is used for editing this api should not be called 
							if existEditingSegmentation['_id'] == itemInCopiedSegmentationFolder['_id']:
								isExist = True
								return """There must be an error please control behavior from fontend because it should never be same,
												if this api is called means copied from collection is made which will assign
												a different _id fro new copy. If editing copy is used for editing this api should not be called"""
							
						if not isExist:
							itemsInOriginal['editing'][str(user['_id'])].append(itemInCopiedSegmentationFolder)
					else:
						itemsInOriginal['editing'][str(user['_id'])] = []
						itemsInOriginal['editing'][str(user['_id'])].append(itemInCopiedSegmentationFolder)
					ItemModel().updateItem(itemsInOriginal)

		# Link Folder
		if 'segmentation' in copiedSegmentationFolder.keys():
			return 'Segmentation [folder] has a segmentation linked on it, please remove its segmentation first'
		
		if 'editing' not in originalFolder.keys():
			originalFolder['editing'] = {}

		# print str(user['_id']) in originalFolder['editing'].keys()
		if str(user['_id'])  in originalFolder['editing'].keys():

			isExist = False
			#	There is an exist segmentation
			for existEditingSegmentation in originalFolder['editing'][str(user['_id'])]:
				if existEditingSegmentation['_id'] == copiedSegmentationFolder['_id']:
					isExist = True

					existEditingSegmentation['timeStamp'] = datetime.datetime.utcnow()

			if not isExist:
				originalFolder['editing'][str(user['_id'])].append(copiedSegmentationFolder)

		else:
			originalFolder['editing'][str(user['_id'])] = []
			originalFolder['editing'][str(user['_id'])].append(copiedSegmentationFolder)
		FolderModel().updateFolder(originalFolder)

		return itemsInOriginal


	@access.user
	@autoDescribeRoute(
		Description('Filesystem files update after segmentation')
		.param('targetFileId','target File Id.',paramType='path')
		.param('sourceFileId','source File Id.',paramType='path')
		.errorResponse())
	def fileUpdate(self,targetFileId,sourceFileId):
		token = self.getCurrentToken()
		client = girder_client.GirderClient(apiUrl='http://localhost:8888/api/v1')
		client.setToken(token['_id'])
		stream = client._streamingFileDownload(sourceFileId)
		size = int(stream.headers.get('Content-Length'))
		file = client.uploadFileContents(targetFileId,StringIO(stream.content),size)
	#	sourceFile = FileModel().load(sourceFileId,user=self.getCurrentUser(), level=AccessType.WRITE)
	#	stream=FileModel().download(sourceFile)
	#	obj=Upload().createUploadToFile(sourceFile,user=self.getCurrentUser(),size=sourceFile['size'])
	#	print obj['_id']
	@describeRoute(
		Description('Search for record.')
		.responseClass('SSR')
		.param('jobId', 'List record of particular job.', required=False)
		.param('userId', 'List all records created by this user.',
				 required=False)
		.param('dockerImage', 'List all this dockerImage created by this user.',
				 required=False)
		.param('title', 'List all this title created by this user.',
				 required=False)
		.pagingParams(defaultSort='lowerName')
		.errorResponse()
		.errorResponse('Read access was denied.', 403)
	)
	@access.user
	def findAllRecord(self,params):
		limit, offset, sort = self.getPagingParameters(params, 'lowerName')
		query = {}
		user=self.getCurrentUser()
		print len(user['groups'])
		fields = list(Record().baseFields)
		if user['admin']:
			if 'jobId' in params:
				job = Job().load(params.get('jobId'), force=True)
				Job().requireAccess(
					job, user=self.getCurrentUser(), level=AccessType.READ)
				query['job.jobId'] = job['_id']
			if 'userId' in params:
				user = User().load(
					params.get('userId'), user=self.getCurrentUser(),
					level=AccessType.READ)
				query['creator._id'] = user['_id']
				fields = ['task.dockerImage']
				if 'dockerImage' in params:
					query['task.dockerImage'] = params.get('dockerImage')
					fields = ['task.title']
					if 'title' in params:
						query['task.title'] = params.get('title')
						fields = ['created','job']
			print query
			# fields = list(Record().baseFields)
			# print fields
			# print list(Record().find(query, limit=limit, offset=offset, sort=sort, fields=fields))
			return list(Record().find(query, limit=limit, offset=offset, sort=sort, fields=fields))
		elif len(user['groups']):
			if 'jobId' in params:
				job = Job().load(params.get('jobId'), force=True)
				Job().requireAccess(
					job, user=self.getCurrentUser(), level=AccessType.READ)
				query['job.jobId'] = job['_id']
			if 'userId' in params:
				user = User().load(
					params.get('userId'), user=self.getCurrentUser(),
					level=AccessType.READ)
				query['creator._id'] = user['_id']
			fields = list(Record().baseFields)
			AllAccessibleRecord=[]
			for eachGroup in user['groups']:
				query['creator.groups'] = eachGroup
				AllAccessibleRecord.extend(list(Record().find(query, limit=limit, offset=offset, sort=sort, fields=fields)))
			# print list(Record().find(query, limit=limit, offset=offset, sort=sort, fields=fields))
			return AllAccessibleRecord

	@describeRoute(
		Description('Update visualizer informations.')
		.responseClass('SSR')
		.param('jobId', 'Record with articular job.', required=True,paramType='path')
		.param('VisualizerName', 'Visualizer Name.', required=True)
		.param('VisualizerTarget', 'Visualizer Target.',
				 required=True)
		.errorResponse()
		.errorResponse('Read access was denied.', 403)
	)
	@access.user
	def visualizerUpdate(self,jobId,params):
		name = params.get('VisualizerName')
		targetId = params.get('VisualizerTarget')
		visualizerInfo = {
			'Name' : name,
			'TargetId': targetId
		}
		Record().update_visualizerInfo(jobId,visualizerInfo)
	@access.user
	@autoDescribeRoute(
		Description("Prepare Inputs into single folder under user's Workspace")
		.responseClass('Scippy')
		.param('OriImageArr', 'Array that contains Original Images(item id).',required=True)
		.param('SegmentationArr', 'Array that contains Segmentation File(file id).',required=False)
		.param('name', 'User defined Images(project) name.',required=True)
		.errorResponse()
		.errorResponse('Read access was denied.', 403))
	def prepareInputs(self,params):
		user = self.getCurrentUser()

		filters = {}
		filters['name'] = 'Workspace'
		parentType = 'user'


		workspaceFolder = list(FolderModel().childFolders(
				parentType=parentType, parent=user, user=user,
				filters=filters))[0]

		parent = FolderModel().load(
			id=workspaceFolder.get('_id'), user=user, level=AccessType.WRITE, exc=True)
		now = datetime.datetime.now().strftime("%s")
		if(params.get('name')):
			newFolder = FolderModel().createFolder(
				parent=parent, name=params.get('name'), parentType='folder', creator=user,
				description='Combination series can be customized by user later on', public='True', reuseExisting='False')
			newFolderOri = FolderModel().createFolder(
				parent=newFolder, name='Original', parentType='folder', creator=user,
				description='Folder for all series items, in order to separate with result item', public='True', reuseExisting='False')
			if params.get('SegmentationArr') is not None:
				print 'not none?'
				print params.get('SegmentationArr')
				newItemSeg = ItemModel().createItem(
					folder=newFolder, name='Segmentation', creator=user,
					description='Item for all segmentation files, in order to separate with result item', reuseExisting='False')
		else:
			newFolder = FolderModel().createFolder(
				parent=parent, name=now, parentType='folder', creator=user,
				description='Combination series can be customized by user later on', public='True', reuseExisting='False')
			newFolderOri = FolderModel().createFolder(
				parent=newFolder, name='Original', parentType='folder', creator=user,
				description='Folder for all series items, in order to separate with result item', public='True', reuseExisting='False')
			if len(params.get('SegmentationArr')):
				newItemSeg = ItemModel().createItem(
					folder=newFolder, name='Segmentation', creator=user,
					description='Item for all segmentation files, in order to separate with result item', reuseExisting='False')

		for x in eval(params.get('OriImageArr')):
			srcItem = ItemModel().load(x,level=AccessType.READ,user=user)
			newItem = ItemModel().createItem(
				folder=newFolderOri, name=srcItem.get('name'), creator=user)

			# copy metadata and other extension values
			filteredItem = ItemModel().filter(newItem, user)
			for key in srcItem:
				if key not in filteredItem and key not in newItem:
					newItem[key] = copy.deepcopy(srcItem[key])
			# add a reference to the original item
			newItem['copyOfItem'] = srcItem['_id']
			newItem = ItemModel().save(newItem, triggerEvents=False)

			# Give listeners a chance to change things
			events.trigger('model.item.copy.prepare', (srcItem, newItem))
			# copy files
			fileModel = FileModel()
			for file in ItemModel().childFiles(item=srcItem):
				# Avoid sychronizer conflict, will cause to unable to download
				# if file['imported']:
				# 	del file['path']
				# 	del file['imported']
				fileModel.copyFile(file, creator=user, item=newItem)

			# Reload to get updated size value
			newItem = ItemModel().load(newItem['_id'], force=True)
			events.trigger('model.item.copy.after', newItem)

		if params.get('SegmentationArr') is not None:
			for y in eval(params.get('SegmentationArr')):
				srcFile = FileModel().load(y,level=AccessType.READ,user=user)		
				# Avoid sychronizer conflict, will cause to unable to download
				# if srcFile['imported']:
				# 	del srcFile['path']
				# 	del srcFile['imported']
				fileModel.copyFile(srcFile, creator=user, item=newItemSeg)
		if params.get('SegmentationArr') is not None:
			return {'newTaskFolder':newFolder,'originalFolderUnderTask':newFolderOri,'segmentationItemUnderTask':newItemSeg}
		else:
			return {'newTaskFolder':newFolder,'originalFolderUnderTask':newFolderOri}
	

	@access.public(scope=TokenScope.DATA_READ)
	@filtermodel(model=SSRFolderModel)
	@autoDescribeRoute(
			Description('Search for folders by certain properties.')
			.notes('You must pass either a "folderId" or "text" field'
						 'to specify how you are searching for folders.  '
						 'If you omit one of these parameters the request will fail and respond : '
						 '"Invalid search mode."')
			.responseClass('Folder', array=True)
			.param('parentType', "Type of the folder's parent", required=False,
						 enum=['folder', 'user', 'collection'])
			.param('parentId', "The ID of the folder's parent.", required=False)
			.param('text', 'Pass to perform a text search.', required=False)
			.param('name', 'Pass to lookup a folder by exact name match. Must '
						 'pass parentType and parentId as well when using this.', required=False)
			.pagingParams(defaultSort='lowerName')
			.errorResponse()
			.errorResponse('Read access was denied on the parent resource.', 403)
	)
	def findFolder(self, parentType, parentId, text, name, limit, offset, sort):
			"""
			Get a list of folders with given search parameters. Currently accepted
			search modes are:

			1. Searching by parentId and parentType, with optional additional
				 filtering by the name field (exact match) or using full text search
				 within a single parent folder. Pass a "name" parameter or "text"
				 parameter to invoke these additional filters.
			2. Searching with full text search across all folders in the system.
				 Simply pass a "text" parameter for this mode.
			"""

			user = self.getCurrentUser()
			if parentType and parentId:
					parent = self.model(parentType).load(
							parentId, user=user, level=AccessType.READ, exc=True)

					filters = {}
					if text:
							filters['$text'] = {
									'$search': text
							}
					if name:
							filters['name'] = name

					return list(SSRFolderModel().childFolders(
							parentType=parentType, parent=parent, user=user,
							offset=offset, limit=limit, sort=sort, filters=filters))
			elif text:
					return list(SSRFolderModel().textSearch(
							text, user=user, limit=limit, offset=offset, sort=sort))
			else:
					raise RestException('Invalid search mode.')



	@access.public(scope=TokenScope.DATA_READ)
	@filtermodel(model=SSRItemModel)
	@autoDescribeRoute(
			Description('List or search for items.')
			.notes('You must pass either a "itemId" or "text" field'
						 'to specify how you are searching for items.  '
						 'If you omit one of these parameters the request will fail and respond : '
						 '"Invalid search mode."')
			.responseClass('Item', array=True)
			.param('folderId', 'Pass this to list all items in a folder.',
						 required=False)
			.param('text', 'Pass this to perform a full text search for items.',
						 required=False)
			.param('name', 'Pass to lookup an item by exact name match. Must '
						 'pass folderId as well when using this.', required=False)
			.pagingParams(defaultSort='lowerName')
			.errorResponse()
			.errorResponse('Read access was denied on the parent folder.', 403)
	)
	def findItem(self, folderId, text, name, limit, offset, sort):
				"""
				Get a list of items with given search parameters. Currently accepted
				search modes are:

				1. Searching by folderId, with optional additional filtering by the name
					 field (exact match) or using full text search within a single parent
					 folder. Pass a "name" parameter or "text" parameter to invoke these
					 additional filters.
				2. Searching with full text search across all items in the system.
					 Simply pass a "text" parameter for this mode.
				"""
				user = self.getCurrentUser()

				if folderId:
						folder = SSRFolderModel().load(
								id=folderId, user=user, level=AccessType.READ, exc=True)
						filters = {}
						if text:
								filters['$text'] = {
										'$search': text
								}
						if name:
								filters['name'] = name

						return list(SSRFolderModel().childItems(
								folder=folder, limit=limit, offset=offset, sort=sort, filters=filters))
				elif text is not None:
						return list(SSRItem().textSearch(
								text, user=user, limit=limit, offset=offset, sort=sort))
				else:
						raise RestException('Invalid search mode.')

	@access.user(scope=TokenScope.DATA_WRITE)
	@filtermodel(model=SSRFolderModel)
	@autoDescribeRoute(
		Description("Create a new task folder under user's Workspace Or create a non-inheritance folder under collection ")
		.param('parentType', "Type of the folder's parent", required=False,
							 enum=['folder', 'user', 'collection'], default='folder')
		.param('parentId', "The ID of the folder's parent.", required=False)
		.param('name', 'User defined task name.',required=True)
		.param('description', 'Description for the folder.', required=False,
							 default='', strip=True)
		.param('reuseExisting', 'Return existing folder if it exists rather than '
					 'creating a new one.', required=False,
					 dataType='boolean', default=False)
		.param('public', 'Whether the folder should be publicly visible. By '
					 'default, inherits the value from parent folder, or in the '
					 'case of user or collection parentType, defaults to False.',
					 required=False, dataType='boolean')
		.jsonParam('metadata', 'A JSON object containing the metadata keys to add',
									 paramType='form', requireObject=True, required=False)
		.errorResponse()
		.errorResponse('Read access was denied.', 403))
	def ssrCreateFolder(self, public, parentType, parentId, name, description,
										 reuseExisting, metadata):
		if not parentId:

			user = self.getCurrentUser()

			filters = {}
			filters['name'] = 'Workspace'
			parentType = 'user'

			workspaceFolder = list(FolderModel().childFolders(
					parentType=parentType, parent=user, user=user,
					filters=filters))[0]


			parent = FolderModel().load(
				id=workspaceFolder.get('_id'), user=user, level=AccessType.WRITE, exc=True)
			now = datetime.datetime.now().strftime("%s")
			if(name):
				newFolder = FolderModel().createFolder(
						parent=parent, name=name, parentType='folder', creator=user,
						description='Task folder for saving results', public='True', reuseExisting='False')
			else:
				newFolder = FolderModel().createFolder(
					parent=parent, name=now, parentType='folder', creator=user,
					description='Task folder for saving results', public='True', reuseExisting='False')
			return newFolder
		else:

			user = self.getCurrentUser()
			parent = self.model(parentType).load(
					id=parentId, user=user, level=AccessType.WRITE, exc=True)

			newFolder = SSRFolderModel().createFolder(
					parent=parent, name=name, parentType=parentType, creator=user,
					description=description, public=public, reuseExisting=reuseExisting, inheritPolicy=False)
			if metadata:
					newFolder = SSRFolderModel().setMetadata(newFolder, metadata)
			return newFolder

def load(info):
	girderRoot = info['serverRoot']
	info['apiRoot'].SSR = SSR()
	SSRRoot = Webroot(_template)
	SSRRoot.updateHtmlVars(girderRoot.vars)
	SSRRoot.updateHtmlVars({'title': 'SSR'})
	info['serverRoot'].ssr = SSRRoot
	info['serverRoot'].girder = girderRoot

	events.bind('jobs.job.update.after', 'SSR',store_record)
	events.bind('data.process', 'SSR',update_record)