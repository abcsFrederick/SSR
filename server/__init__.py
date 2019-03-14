import os
import copy
from girder import events
from girder.api.rest import Resource,filtermodel
from girder.utility.webroot import Webroot
from girder.api.describe import Description, autoDescribeRoute,describeRoute
from girder.api import access
from girder.models.file import File as FileModel
from girder.models.folder import Folder as FolderModel
from girder.models.item import Item as ItemModel
from girder.constants import AccessType
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
		self.route('POST',('folder',),self.ssrCreateFolder)
		self.route('GET',('segmentationCheck',':originalItemId'),self.segmentationCheck)
		self.route('GET',('segmentationCheckFolder',':originalFolderId'),self.segmentationCheckFolder)
		self.route('PUT',(':targetFileId',':sourceFileId'),self.fileUpdate)
		self.route('PUT', ('Visualizer',':jobId'),self.visualizerUpdate)
		self.route('PUT',('segmentationLink',':originalItemId',':segmentationItemId'),self.segmentationLink)
		self.route('DELETE',('segmentationRemove',':originalItemId',':segmentationItemId'),self.segmentationRemove)
		
	@access.user
	@autoDescribeRoute(
		Description('Check segmentations item of current user')
		.param('originalItemId','Original item Id.',paramType='path')
		.errorResponse())
	def segmentationCheck(self,originalItemId):
		user = self.getCurrentUser()
		
		originalItem = ItemModel().load(originalItemId,level=AccessType.READ,user=user)
		segmentationOfCurrentUser = []
		needToRemove = []
		if 'segmentation' not in originalItem.keys():
			return 'There is no segmentation linked to this [item] '
		else:
			if len(originalItem['segmentation']) != 0:
				for existSegmentation in originalItem['segmentation']:
					# Sync with achrive, remove segmentatioin if item has been removed
					if ItemModel().load(existSegmentation['_id'],level=AccessType.READ,user=user):
						if existSegmentation['creatorId'] == user['_id']:
							segmentationOfCurrentUser.append(existSegmentation)
					else:
						needToRemove.append(existSegmentation)
				for each in needToRemove:
					originalItem['segmentation'].remove(each)

				ItemModel().updateItem(originalItem)
				return segmentationOfCurrentUser
			else:
				return 'No any segmentations linked in original [item] '

	@access.user
	@autoDescribeRoute(
		Description('Check segmentations folder of current user')
		.param('originalFolderId','Original Folder Id.',paramType='path')
		.errorResponse())
	def segmentationCheckFolder(self,originalFolderId):
		user = self.getCurrentUser()
		
		originalFolder = FolderModel().load(originalFolderId,level=AccessType.READ,user=user)
		segmentationOfCurrentUser = []
		needToRemove = []
		if 'segmentation' not in originalFolder.keys():
			return 'There is no segmentation linked to this [folder]'
		else:
			if len(originalFolder['segmentation']) != 0:

				for existSegmentation in originalFolder['segmentation']:
					# Sync with achrive, remove segmentatioin if folder has been removed
					if FolderModel().load(existSegmentation['_id'],level=AccessType.READ,user=user):
						if existSegmentation['creatorId'] == user['_id']:
							segmentationOfCurrentUser.append(existSegmentation)
					else:
						needToRemove.append(existSegmentation)
				for each in needToRemove:
					originalFolder['segmentation'].remove(each)

				FolderModel().updateFolder(originalFolder)
				return segmentationOfCurrentUser
			else:
				return 'No any segmentations linked in original [folder] '

	@access.user
	@autoDescribeRoute(
		Description('Remove a segmentation item from original item,  and remove their parent folders at the same time')
		.param('originalItemId','Original item Id.',paramType='path')
		.param('segmentationItemId','Segmentation item Id.',paramType='path')
		.errorResponse())
	def segmentationRemove(self,originalItemId,segmentationItemId):
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
	def segmentationLink(self,originalItemId,segmentationItemId):
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
					#	Same user update a same item, normally same item will belongs to the same user
					if existSegmentation['creatorId'] == segmentationItem['creatorId']:
						existSegmentation['timeStamp'] = datetime.datetime.utcnow()
					#	Different user update a same item will make a new segmentation record
					else:
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
	@access.user
	@autoDescribeRoute(
		Description("Create a new task folder under user's Workspace")
		.param('name', 'User defined task name.',required=True)
		.errorResponse()
		.errorResponse('Read access was denied.', 403))
	def ssrCreateFolder(self,params):
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
					description='Task folder for saving results', public='True', reuseExisting='False')
		else:
			newFolder = FolderModel().createFolder(
				parent=parent, name=now, parentType='folder', creator=user,
				description='Task folder for saving results', public='True', reuseExisting='False')
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