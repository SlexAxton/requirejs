/**
 * @license RequireJS order Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
 * Available via the MIT, GPL or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint nomen: false, plusplus: false */
/*global require: false, window: false, document: false, setTimeout: false */

//>>includeStart("useStrict", pragmas.useStrict);
"use strict";
//>>includeEnd("useStrict");

(function () {
    //Sadly necessary browser inference due to differences in the way
    //that browsers load and execute dynamically inserted javascript
    //and whether the script/cache method works.
    //Currently, Gecko and Opera do not load/fire onload for scripts with
    //type="script/cache" but they execute injected scripts in order
    //unless the 'async' flag is present.
    var supportsInOrderExecution = ((window.opera && Object.prototype.toString.call(window.opera) === "[object Opera]") ||
                               //If Firefox 2 does not have to be supported, then
                               //a better check may be:
                               //('mozIsLocallyAvailable' in window.navigator)
                               ("MozAppearance" in document.documentElement.style)),
        readyRegExp = /^(complete|loaded)$/;

    //Callback used by the type="script/cache" callback that indicates a script
    //has finished downloading.
    function scriptCacheCallback(evt) {
        var node = evt.currentTarget || evt.srcElement,
            context, contextName, moduleName, waiting,
            oSequence, oLookup,
            index, readyScripts, readyCount = 0;

        if (evt.type === "load" || readyRegExp.test(node.readyState)) {
            //Pull out the name of the module and the context.
            contextName = node.getAttribute("data-requirecontext");
            moduleName = node.getAttribute("data-requiremodule");
            context = require.s.contexts[contextName];
            oLookup = context.orderSequenceLookup;
            waiting = context.orderWaiting;

            //Do a lookup for the index of that module in the sequence (indexed instead of a search)
            index = oLookup[moduleName];
            //Mark this cache request as loaded
            context.orderSequence[index].loaded = true;
            
            //Loop through the waiting resources and see if we can inject anything
            while(readyCount < waiting.length && context.orderSequence[oLookup[waiting[readyCount]]].loaded) {
                ++readyCount;
            }

            //Inject scripts that have all their dependencies at this point
            if (readyCount) {
                //Grab scripts that we can load
                readyScripts = waiting.slice(0,readyCount);
                //Remove them from the shared waiting array
                context.orderWaiting = waiting.slice(readyCount);
                //Require the ready scripts as normal modules
                require(readyScripts, contextName);
            }

            //Clean out the left-over objects if everything has loaded
            //to try to be memory friendly
            if (!context.orderWaiting.length) {
                context.orderSequence = [];
                context.orderSequenceLookup = {};
            }

            //Remove this script tag from the DOM
            //Use a setTimeout for cleanup because some older IE versions vomit
            //if removing a script node while it is being evaluated.
            setTimeout(function () {
                node.parentNode.removeChild(node);
            }, 15);
        }
    }

    require.plugin({
        prefix: "order",

        /**
         * This callback is prefix-specific, only gets called for this prefix
         */
        require: function (name, deps, callback, context) {
            //No-op, require never gets these order items, they are always
            //a dependency, see load for the action.
        },

        /**
         * Called when a new context is defined. Use this to store
         * context-specific info on it.
         */
        newContext: function (context) {
            require.mixin(context, {
                orderWaiting: [],
                orderSequence: [],
                orderSequenceLookup: {}
            });
        },

        /**
         * Called when a dependency needs to be loaded.
         */
        load: function (name, contextName) {
            var context = require.s.contexts[contextName],
                url = require.nameToUrl(name, null, contextName);

            //Make sure the async attribute is not set for any pathway involving
            //this script.
            require.s.skipAsync[url] = true;
            if (supportsInOrderExecution) {
                //Just a normal script tag append, but without async attribute
                //on the script.
                require([name], contextName);
            } else {
                //Credits to Steve Souders (in EFWS) and Kyle Simpson (in LABJS)
                //for finding that scripts with type="script/cache" allow scripts
                //to be downloaded into browser cache but not executed. Use that
                //so that subsequent addition of a real type="text/javascript"
                //tag will cause the scripts to be executed immediately in the
                //correct order.
                context.orderWaiting.push(name);
                context.orderSequence.push({"name": name, "loaded": false});
                context.orderSequenceLookup[name] = context.orderSequence.length - 1;
                context.loaded[name] = false;
                require.attach(url, contextName, name, scriptCacheCallback, "script/cache");
            }
        },

        /**
         * Called when the dependencies of a module are checked.
         */
        checkDeps: function (name, deps, context) {
            //No-op, checkDeps never gets these order items, they are always
            //a dependency, see load for the action.
        },

        /**
         * Called to determine if a module is waiting to load.
         */
        isWaiting: function (context) {
            return !!context.orderWaiting.length;
        },

        /**
         * Called when all modules have been loaded. Not needed for this plugin.
         * State is reset as part of scriptCacheCallback. 
         */
        orderDeps: function (context) {
        }
    });
}());
