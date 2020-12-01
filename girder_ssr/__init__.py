import os
from girder.api.rest import Resource
from girder.utility.webroot import Webroot
from girder import plugin

_template = os.path.join(
    os.path.dirname(__file__),
    'webroot.mako'
)


class SSR(Resource):
    def __init__(self):
        super(SSR, self).__init__()
        self.resourceName = 'SSR'


class SSRPlugin(plugin.GirderPlugin):
    DISPLAY_NAME = 'SSR'
    CLIENT_SOURCE_PATH = 'web_client'
    def load(self, info):
        girderRoot = info['serverRoot']
        info['apiRoot'].SSR = SSR()
        SSRRoot = Webroot(_template)
        SSRRoot.updateHtmlVars(girderRoot.vars)
        SSRRoot.updateHtmlVars({'title': 'SSR'})
        info['serverRoot'].ssr = SSRRoot
        info['serverRoot'].girder = girderRoot
