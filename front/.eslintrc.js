
module.exports = {
    "globals":{
        "AccountKit":false,
    },

    "extends": ["airbnb", "react-app"],
    "rules": {
        "semi": 2,
        "global-require": 0,
        "no-unused-expressions": ["error", { "allowTaggedTemplates": true }],
        "no-unused-vars": 0
        
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