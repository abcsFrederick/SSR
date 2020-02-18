import os
from girder.api.rest import Resource
from girder.utility.webroot import Webroot


_template = os.path.join(
    os.path.dirname(__file__),
    'webroot.mako'
)


class SSR(Resource):
    def __init__(self):
        super(SSR, self).__init__()
        self.resourceName = 'SSR'


def load(info):
    girderRoot = info['serverRoot']
    info['apiRoot'].SSR = SSR()
    SSRRoot = Webroot(_template)
    SSRRoot.updateHtmlVars(girderRoot.vars)
    SSRRoot.updateHtmlVars({'title': 'SSR'})
    info['serverRoot'].ssr = SSRRoot
    info['serverRoot'].girder = girderRoot
