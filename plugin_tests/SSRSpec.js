girderTest.importPlugin('jobs');
girderTest.importPlugin('worker');
girderTest.importPlugin('NCIAuth');
girderTest.addScript('AMI_plugin');
girderTest.addScript('d3_plugin');
girderTest.addScript('Archive');
girderTest.importPlugin('SSR_task');
girderTest.importPlugin('SSR');
girderTest.startApp();

$(function () {
    describe('Test SSR', function () {
        it('Hold this place', function () {
        });
    });
});
