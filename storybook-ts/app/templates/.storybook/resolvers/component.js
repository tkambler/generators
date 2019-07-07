const path = require('path');

module.exports = (componentDir) => {

  return {
    apply: function(resolver) {
      resolver.plugin('module', function(request, callback) {
        if (request.request.indexOf('#component/') === 0) {
          const relPath = path.relative(componentDir, request.path);
          const componentName = relPath.split('/')[0];
          const targetPath = path.resolve(componentDir, componentName, request.request.substr(11));
          const obj = {
            path: request.path,
            request: targetPath,
            query: request.query,
            directory: request.directory
          };
          this.doResolve('resolve', obj, 'Resolving ...', request.context, callback);
        }
        else {
          callback();
        }
      });
    }
  };
  
}
