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

(function (global) {
    //A place to hold callback functions
    require._order = {};

    require.plugin({
        prefix: "order",
        
        // Sadly necessary browser inference due to differences in the way
        // that browsers load and execute dynamically inserted javascript
        // and whether the script/cache method works.
        // Currently, Firefox and Opera can't use 'script/cache' but execute
        // injected scripts in order unless the 'async' flag is present.
        supportsInOrderExecution: (function(){
            return ((global.opera && Object.prototype.toString.call(global.opera) == "[object Opera]") || ('mozIsLocallyAvailable' in window.navigator));
        })(),


        /**
         * This callback is prefix-specific, only gets called for this prefix
         */
        require: function (name, deps, callback, context) {
            //No-op
        },

        /**
         * Called when a new context is defined. Use this to store
         * context-specific info on it.
         */
        newContext: function (context) {
            require.mixin(context, {
                orderWaiting: [],
                // This one doesn't get destroyed so we know what order to re-run the plugin
                // in after a 'script/cache' call.
                orderSequence:[]
            });
        },

        /**
         * Called when a dependency needs to be loaded.
         */
        load: function (name, contextName) {
            var context = require.s.contexts[contextName],
                url     = require.nameToUrl(name, null, contextName),
                orderCallback,
                scriptType; //Intentionally undefined if we want the default type
            
            if(this.supportsInOrderExecution) {
                //We can safely inject scripts without the async attribute and they will execute
                //in order, regardless of when they finished downloading.
                orderCallback = function(){};
                
                //do a regular require here, but add the names to require.s.skipAsync
                require.s.skipAsync[url] = true;
                
                //TODO:: Do a normal require call
                //QUESTION:: Perhaps we should detect this prior to getting to load? Might make it easier.
                
                //do we need to remove from skipAsync? Probably doesn't matter at this point...
            }
            else {
                //QUESTION:: Should we split this back out into the 'cache' plugin, to make this more clear?
                
                //We need a 'script/cache' technique to get all of our scripts on the disk
                //so when we inject them, they execute immediately, and in order
                //Credits to Steve Souders (in EFWS) and Kyle Simpson (in LABJS)
                orderCallback = function() {
                    context.loaded[name] = true;
                    require.checkLoaded(contextName);
                    
                    //TODO:: Reinject the script as a normal script if all of the elements in
                    //       context.orderSequence prior to the script here have finished as well.
                    //       We don't have to wait for ALL scripts to load, just the ones prior to
                    //       this one. This technique can have very good speed benefits.
                    
                    //Remove the script element from the Head
                    //Use a setTimeout for cleanup because some older IE versions vomit
                    //if removing a script node while it is being evaluated.
                    var scriptElem = this;
                    setTimeout(function () {
                        scriptElem.parentNode.removeChild(scriptElem);
                    }, 15);
                };
                
                //Merely convention, not a standard
                scriptType = 'script/cache';
                
                //This array is only used with the 'script/cache' method, so only fill it up in that case
                context.orderSequence.push({
                    name : name,
                    url  : url
                });
            }
            
            //Add the script to the waiting queue to avoid dupes
            context.orderWaiting.push({
                name : name,
                url  : url
            });
            
            //Attach a script to the dom and remove it once it loads
            //Set the type of the node to 'script/cache' via Souders EFWS and LABjs methods
            require.attach(url, contextName, "require/order", orderCallback, scriptType);
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
            return !!context.orderWaiting.length;
        },

        /**
         * Called when all modules have been loaded.
         */
        orderDeps: function (context) {
            context.orderWaiting = [];
        }
    });
}(this));
