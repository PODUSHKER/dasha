const expressHbs = require('express-handlebars')

const hbsConfig = expressHbs.engine({
    layoutsDir: 'templates/layouts',
    defaultLayout: 'base',
    extname: 'hbs',
    
    runtimeOptions: {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true
    },

})

module.exports = hbsConfig;