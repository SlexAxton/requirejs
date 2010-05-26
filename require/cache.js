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
                data = {
                    name: url
                },
                head = require.s.head,
                node = head.ownerDocument.createElement("script");
            
            // Remove the script node after we're done loading it
            node.onload = function() {
                context.loaded[url] = true;
                head.removeChild(node);
            };

            //Hold on to the data for later dependency resolution in orderDeps.
            context.cacheWaiting.push(data);

            context.loaded[name] = false;
            
            //Set the type of the node to 'script/cache' via Souders EFWS and LABjs methods
            node.type = "script/cache";
            node.charset = "utf-8";
            node.src = url;

            //Use async so Gecko does not block on executing the script if something
            //like a long-polling comet tag is being run first. Gecko likes
            //to evaluate scripts in DOM order, even for dynamic scripts.
            //It will fetch them async, but only evaluate the contents in DOM
            //order, so a long-polling script tag can delay execution of scripts
            //after it. But telling Gecko we expect async gets us the behavior
            //we want -- execute it whenever it is finished downloading. Only
            //Helps Firefox 3.6+
            node.setAttribute("async", "async");

            head.appendChild(node);
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
