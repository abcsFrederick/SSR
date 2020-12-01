<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Droid+Sans:400,700">
    <!-- <link rel="stylesheet" href="${staticPublicPath}/built/fontello/css/fontello.css">
    <link rel="stylesheet" href="${staticPublicPath}/built/fontello/css/animation.css"> -->
    <link rel="icon" type="image/jpg" href="${staticPublicPath}/built/assets/SSRLogo.jpg">
    <link rel="stylesheet" href="${staticPublicPath}/built/girder_lib.min.css">
    <link rel="icon" type="image/png" href="${staticPublicPath}/built/Girder_Favicon.png">
    % for plugin in pluginCss:
    <link rel="stylesheet" href="${staticPublicPath}/built/plugins/${plugin}/plugin.min.css">
    % endfor
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/three.js/93/three.min.js"></script>

    <!--<script type="text/javascript" src="https://cdn.rawgit.com/mrdoob/three.js/master/examples/js/loaders/STLLoader.js"></script>-->
  </head>
  <body>
    <div id="g-global-info-apiroot" class="hide">${apiRoot}</div>
    <div id="g-global-info-staticroot" class="hide">${staticPublicPath}</div>
    <script src="${staticPublicPath}/built/girder_lib.min.js"></script>
    <script src="${staticPublicPath}/built/girder_app.min.js"></script>
    <script>
    $(function () {
      $('body').addClass('SSR-body')
      // girder.router.enabled(false);
      girder.events.trigger('g:appload.before');
      // window.app=girder.plugins
      var app = new girder.plugins.SSR.App({
        el: 'body',
        parentView: null
      });
      app.bindRoutes();
      
      girder.events.trigger('g:appload.after');
    });
    </script>
    % for plugin in pluginJs:
    <script src="${staticPublicPath}/built/plugins/${plugin}/plugin.min.js"></script>
    % endfor
  </body>
</html>
