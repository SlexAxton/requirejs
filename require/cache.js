/**
 * @license RequireJS jsonp Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
 * Available via the MIT, GPL or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint nomen: false, plusplus: false */
/*global require: false, setTimeout: false */

//>>includeStart("useStrict", pragmas.useStrict);
"use strict";
//>>includeEnd("useStrict");

(function () {
    //A place to hold callback functions
    require._cache = {};

    require.plugin({
        prefix: "cache",

        /**
         * This callback is prefix-specific, only gets called for this prefix
         */
        require: function (name, deps, callback, context) {
            //No-op, require never gets the script cache blocks since they aren't executed
            //We could potentially return the script nodes here, but that could be awkward
        },

        /**
         * Called when a new context is defined. Use this to store
         * context-specific info on it.
         */
        newContext: function (context) {
            require.mixin(context, {
                cacheWaiting: []
            });
        },

        /**
         * Called when a dependency needs to be loaded.
         */
        load: function (url, contextName) {
            var context = require.s.contexts[contextName],
                name    = 'c-' + url;
            
            function cacheCallback() {
                context.loaded[name] = true;
                require.checkLoaded(contextName);
                //Remove the script element from the Head
                this.parentNode.removeChild(this);
            };
            
            context.cacheWaiting.push({
                name: name
            });
            
            //Attach a script to the dom and remove it once it loads
            //Set the type of the node to 'script/cache' via Souders EFWS and LABjs methods
            require.attach(url, contextName, "require/cache", cacheCallback, "script/cache");
        },

        /**
         * Called when the dependencies of a module are checked.
         */
        checkDeps: function (name, deps, context) {
            //No-op, checkDeps never gets these cached items, they are
            //never executed, and will be checked when they're loaded for real
        },

        /**
         * Called to determine if a module is waiting to load.
         */
        isWaiting: function (context) {
            return !!context.cacheWaiting.length;
        },

        /**
         * Called when all modules have been loaded.
         */
        orderDeps: function (context) {
            //Clear up state since further processing could
            //add more things to fetch.
            var i, dep, waitAry = context.cacheWaiting;
            context.cacheWaiting = [];
            for (i = 0; (dep = waitAry[i]); i++) {
                context.defined[dep.name] = dep.value;
            }
        }
    });
}());
