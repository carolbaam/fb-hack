
module.exports = {
    "globals":{
        "AccountKit_OnInteractive":true,
        "AccountKit":false,
    },

    "extends": "airbnb",
    "rules": {
        "semi": 2,
        "global-require": 0,
        "no-unused-expressions": ["error", { "allowTaggedTemplates": true }]
        
    },
    "env": {
        "browser": true
    },
    "settings": {
        "import/core-modules": [
            '@uifabric/icons'
        ]
    },
    "parser": "babel-eslint"
};