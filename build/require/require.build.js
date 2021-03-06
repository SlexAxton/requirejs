//A build file that builds require in different configurations via pragmas.
({
    baseUrl: ".",
    dir: "build",
    optimize: "none",
    skipModuleInsertion: true,
    pragmas: {
        requireExcludeModify: true,
        requireExcludePlugin: true,
        requireExcludePageLoad: true,
        requireExcludeContext: true
    },

    modules: [
        {
            name: "nomodifypluginspagecontext-require",
            includeRequire: true
        },
        {
            name: "nomodifypluginspage-require",
            includeRequire: true,
            override: {
                pragmas: {
                    requireExcludeModify: true,
                    requireExcludePlugin: true,
                    requireExcludePageLoad: true
                }
            }
        },
        {
            name: "nomodifypluginscontext-require",
            includeRequire: true,
            override: {
                pragmas: {
                    requireExcludeModify: true,
                    requireExcludePlugin: true,
                    requireExcludeContext: true
                }
            }
        },
        {
            name: "nomodifyplugins-require",
            includeRequire: true,
            override: {
                pragmas: {
                    requireExcludeModify: true,
                    requireExcludePlugin: true
                }
            }
        },
        {
            name: "nomodify-require",
            includeRequire: true,
            override: {
                pragmas: {
                    requireExcludeModify: true
                }
            }
        },
        {
            name: "noplugins-require",
            includeRequire: true,
            override: {
                pragmas: {
                    requireExcludePlugin: true
                }
            }
        },
        {
            name: "require",
            includeRequire: true,
            override: {
                pragmas: {
                }
            }
        },
        {
            name: "allplugins-require",
            include: ["require/i18n", "require/text", "require/jsonp", "require/order"],
            includeRequire: true,
            override: {
                pragmas: {
                }
            }
        },
        {
            name: "transportD-require",
            include: ["require/i18n", "require/text", "require/jsonp", "require/order", "require/transportD"],
            includeRequire: true,
            override: {
                pragmas: {
                }
            }
        }

    ]
})

