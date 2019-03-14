from girder.utility.model_importer import ModelImporter
from girder import logger

def store_record(event):

	if event.info['job'].get('module') != 'girder.plugins.slicer_cli_web_SSR.image_job':
		obj = event.info
		ssr = ModelImporter.model('record', plugin='SSR')
		try:
			ssr.store_record(obj)
		except Exception:
			logger.error('Could not create record from data')
			raise
def update_record(event):
	print '----------------- in update record -----------------'
	print 'job' not in event.info
	# print event.info['job'].get('module')
	if 'job' not in event.info:
		obj = event.info	# job id expected should add reference="$(inputname)" in xml when add docker images
		ssr = ModelImporter.model('record', plugin='SSR')
		try:
			ssr.update_record(obj)
		except Exception:
			logger.error('Could not create record from data')
			raise
	elif event.info['job'].get('module') == 'girder.plugins.slicer_cli_web_SSR.image_job':
		print 'Skip docker image pull or push'