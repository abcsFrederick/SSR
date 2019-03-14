import _ from 'underscore';
import Backbone from 'backbone';
import { splitRoute, parseQueryString } from 'girder/misc';

import events from './events';

// var router = new Backbone.Router();
import router from 'girder/router';

router.setQuery = function setQuery(name, value, options) {

    var curRoute = Backbone.history.fragment,
        routeParts = splitRoute(curRoute),
        queryString = parseQueryString(routeParts.name);
    // console.log('---------------- curRoute ----------------');
    // console.log(curRoute);
    // console.log('---------------- routeParts ----------------');
    // console.log(routeParts);
    // console.log('---------------- queryString ----------------');
    // console.log(queryString);
    // console.log('setQuery');
    // console.log(queryString);
    //Backbone.history.start()
    if (value === undefined || value === null) {
        delete queryString[name];
    } else {
        if(name === 'step' && value === 'dataSource'){
            this.flag = true;
        }else{
            this.flag = false;
        }
        queryString[name] = value;
    }
    var unparsedQueryString = $.param(queryString);
    if (unparsedQueryString.length > 0) {
        unparsedQueryString = '?' + unparsedQueryString;
    }
    // console.log(queryString)
    this._lastQueryString = queryString;
    console.log('setQuery   ------40------');
    console.log(routeParts.base + unparsedQueryString)
    // if(value==='datasource')
    // console.log(routeParts.base + unparsedQueryString);
    this.enabled(1);
    this.navigate(routeParts.base + unparsedQueryString, options);
};
// router.setQueryString = function setQuery(queryString, options) {
//     var route = splitRoute(Backbone.history.fragment).base
//         console.log(Backbone.history.fragment)
//     this.navigate(route + queryString, options);
// };
router.getQuery = function getQuery(name) {
    // console.log(this._lastQueryString)
    return (this._lastQueryString || {})[name];
};

router.execute = function execute(callback, args) {
    
    // console.log(args);
    var query = parseQueryString(args.pop());
    // console.log('router.execute');
    
    // console.log('in execute');
    // console.log(args);
    // console.log(query);
    // query.forEach(_.bind(function(obj) {
    //   if (obj['PreviewFile']||obj['PreviewFileAndSEG'])
    //   {
    //     this.new = false;
    //   }
    // },this));
    let _new = true;
    
    // console.log(_new)
    // if(_new){
    //     args.push(query);
    // }else{
        
        args.push(query);
    // }
    
    if (callback) {
        callback.apply(this, args);
    }

    // _.each(this._lastQueryString || {}, function (value, key) {
    //     if (!_.has(query, key)) {

    //         events.trigger('query:' + key, null, query);
    //     }
    // });
    _.each(query, function (value, key) {
        // console.log('query:' + key);
        events.trigger('query:' + key, value, query);
    });
    // events.trigger('query', query);
    this._lastQueryString = query;

};

export default router;
