from tests import base
from girder.models.user import User


def setUpModule():
    base.enabledPlugins.append('SSR')
    base.startServer()


def tearDownModule():
    base.stopServer()


class SSRTestCase(base.TestCase):
    def setUp(self):
        base.TestCase.setUp(self)

        self.users = [
            User().createUser(
                'user%d' % n,
                'testpassword',
                'Test',
                'User',
                'user%d@example.com' % n
            ) for n in [0]
        ]
        self.assertTrue(True)
