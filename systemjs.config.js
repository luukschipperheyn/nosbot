// @see https://github.com/systemjs/systemjs/blob/master/docs/config-api.md voor alle opties

System.config({
    baseURL: '/', // laad modules relatief tov de huidige URL
    transpiler: 'traceur',
    defaultJSExtensions: true // voegt .js toe aan geïmporteerde modules zonder extensie
});

// De map configuratie zorgt ervoor dat SystemJS weet waar hij modules kan vinden.
// Het kan een mapping zijn naar een bestand of naar een directory, dit laatste is vergelijkbaar met het 'paths' mechanisme van RequireJS
// alleen dan voor 1 map entry. Er is ook daadwerkelijk een 'paths' configuratie voor SystemJS beschikbaar overigens.
//
System.config({
    map: {
        jquery : 'node_modules/jquery/dist/jquery.min.js',  // in ES6 kan er nu gebruik worden gemaakt van `import $ from 'jquery'`.
        traceur : 'node_modules/traceur/bin/traceur.js',
        'hbs': 'node_modules/plugin-hbs/hbs.js',
        handlebars : 'node_modules/handlebars/dist/handlebars.min.js',
        'handlebars-runtime' : 'node_modules/handlebars/dist/handlebars.runtime.min.js',
        firebase : 'node_modules/firebase'
    }
});