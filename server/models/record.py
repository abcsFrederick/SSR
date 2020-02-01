
from bson.objectid import ObjectId
from girder.models.model_base import Model
from girder.utility.model_importer import ModelImporter
# from girder.models.folder import Folder
# from girder.constants import AccessType

class Record(Model):

	baseFields = (
		'_id',
		'creator',
		'created',
		'job',
		'task',
		'visualizer'
	)
	def initialize(self):
		self.name = 'SSR'
		self.ensureIndices(['created', 'creatorId'])

	def store_record(self,obj):
		print '------------------ in store_record ------------------'
		jobStatus = obj['job'].get('status')
		if jobStatus:
			creatorId =  obj['job'].get('userId')
			User = ModelImporter.model('user')
			user = User.load(creatorId, force=True)
			created = obj['job'].get('created')
			# print obj['job']
			jobId = obj['job'].get('jobInfoSpec').get('reference')
			# print obj['job'].get('jobInfoSpec')
			title = obj['job'].get('title')

			mode = obj['job'].get('kwargs').get('task').get('mode')
			query = {'job.jobId':ObjectId(jobId)}
			existRecord =  Record().findOne(query)

			if not existRecord:
				
				if mode == 'docker':
					dockerimage = obj['job'].get('kwargs').get('task').get('docker_image')
					inputs = obj['job'].get('kwargs').get('inputs')

					doc = {
						'creator':user,
						'created':created,
						'job':{
							'jobId':ObjectId(jobId),
							'status':jobStatus
						},
						'task':{
								'title':title,
								'mode':mode,
								'dockerImage':dockerimage,
								'inputs':inputs,
								'outputs':'',
						},
						'visualizer':''
					}
					print 'new job'
					print jobId
					self.collection.insert_one(doc)
			else:
				print 'exist job'
				print jobId
				existRecord['job']['status'] = jobStatus
				self.collection.save(existRecord)
				# if jobStatus == 3:
				# 	print '------------------------- job status = 3 -----------------------------'
				# 	folderId = obj['job'].get('kwargs').get('outputs').get('outputJson').get('parent_id')
				# 	name = obj['job'].get('kwargs').get('outputs').get('outputJson').get('name')
				# 	# print folderId
				# 	# print name
				# 	folder = Folder().load(
    #             id=folderId, user=user, level=AccessType.READ, exc=True)
				# 	# print folder
				# 	filters = {}
				# 	filters['name'] = name
				# 	outputItem = Folder().childItems(
    #             folder=folder, filters=filters)
				# 	print list(outputItem)
				# 	existRecord['task']['outputs'] = outputItem

	def update_record(self,obj):
		print '--------------- in update_record ---------------'
		query = {'job.jobId':ObjectId(obj['reference'])}
		existRecord =  Record().findOne(query)
		print obj
		existRecord['task']['outputs']=obj['file']
		self.collection.save(existRecord)

	def update_visualizerInfo(self,jobId,visualizerInfo):
		query = {'job.jobId':ObjectId(jobId)}
		print query
		existRecord =  Record().findOne(query)
		# Multiple visualizer support?
		existRecord['visualizer']=visualizerInfo
		print existRecord
		self.collection.save(existRecord)
