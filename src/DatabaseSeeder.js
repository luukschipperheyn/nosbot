var firebase = require('firebase');
var fs = require( 'fs' );
var config = require( __dirname + '/../config.json' );
var pivotWords = [
	'verder',
	'maar',
	'beetje',
	'in',
	'door',
	'te worden',
	'hoe',
	'over',
	'op wat',
	'dit soort',
	'dit',
	'en',
	'of',
	'en/of',
	'bovendien',
	'ook',
	'verder',
	'eveneens',
	'ten eerste',
	'daarnaast',
	'evenals',
	'maar ook',
	'tevens',
	'gevolgd door',
	'ten slotte',
	'maar',
	'echter',
	'toch',
	'daarentegen',
	'anderzijds',
	'in tegenstelling tot',
	'hoewel',
	'tenzij',
	'desondanks',
	'hier',
	'waarop',
	'daar',
	'waarvandaan',
	'waarin',
	'toen',
	'eerst',
	'vervolgens',
	'terwijl',
	'daarna',
	'vroeger',
	'later',
	'nu',
	'dan',
	'als',
	'al',
	'bijna',
	'dadelijk',
	'daardoor',
	'doordat',
	'door',
	'waardoor',
	'zodat',
	'ten gevolge van',
	'vervolgens',
	'zodoende',
	'kortom',
	'samenvattend',
	'al met al',
	'met andere woorden',
	'om kort te gaan',
	'dus',
	'aldus',
	'concluderend',
	'kortom',
	'dat betekent',
	'ter conclusie',
	'tot slot',
	'zoals',
	'hetzelfde',
	'als',
	'in vergelijking met',
	'bijvoorbeeld',
	'zo', 
	'ter illustratie',
	'door middel van',
	'om te',
	'opdat',
	'daartoe',
	'daarmee',
	'want',
	'omdat',
	'daarom',
	'namelijk',
	'immers',
	'aangezien',
	'dus',
	'daardoor',
	'als',
	'indien',
	'mits',
	'stel dat',
	'tenzij',
];


var DatabaseSeeder = function () {
	this.initializeFirebase();
	this.seedPivotWords()
		.then( this.seedSentences.bind( this ) )
		.then( function () {
			console.log( 'done' );
			process.exit()
		} )
		.catch( function ( e ) {
			console.log( e );
			process.exit( 1 );
		});
}

DatabaseSeeder.prototype = {

	seedPivotWords : function () {
		return this.clearPivotWords();//
		//	.then( this.addPivotWords.bind( this ) );
	},

	clearPivotWords : function () {
		var ref = this.database.ref( 'pivot-words' );

		return ref.remove();
	},

	addPivotWords : function () {
		return Promise.all( pivotWords.map( this.addPivotWord.bind( this ) ) );
	},

	addPivotWord : function ( pivotWord ) {
		return this.database.ref( 'pivot-words' ).push( pivotWord );
	},

	initializeFirebase : function () {
		firebase.initializeApp({
		  serviceAccount: "service-account.json",
		  databaseURL: config.databaseURL
		});
    	this.database = firebase.database();
	},

	checkAccess : function () {
		// As an admin, the app has access to read and write all data, regardless of Security Rules
		var db = firebase.database();
		var ref = db.ref("restricted_access/secret_document");
		ref.once("value", function(snapshot) {
		  console.log(snapshot.val());
		});
	},

	seedSentences : function () {
		return this.clearSentences()
			.then( this.parseDataDir.bind( this ) );
	},

	clearSentences : function () {
		console.log( 'clearing sentences' );
		var ref = this.database.ref( 'sentences' );

		return ref.remove();
	},

	parseDataDir : function () {
		var dataDir = __dirname + '/../data';

		return Promise.all( fs.readdirSync( dataDir ).map( function ( filename ) {
			return this.parseText( dataDir, filename );
		}.bind( this ) ) );
	},

	parseText : function ( directory, filename ) {
		var fs = require('fs');
		var array = fs.readFileSync( directory + '/' + filename ).toString().split("\n");
		var sentence = {
			filename: filename
		};
		var sentences = [];
		for(i in array) {
			var string = array[i];
		    var isTimestamp = /^[0-9]{2}\:/.test( string );
		    var isText = /^[a-zA-Z]/.test( string );
		    if( isTimestamp ) {
		    	sentence.startTime = string.match( /^\S*/ )[0];
		    	sentence.endTime = string.match( /\S*$/ )[0];
		    } else if ( isText && string != "WEBVTT" ) {
		    	sentence.text = string;
		    	sentence.pivotWords = pivotWords.filter( function ( pivotWord ) {
		    		return string.indexOf( " " + pivotWord + " " ) !== -1 || string.indexOf( pivotWord + " " ) == 0;
		    	} );
		    	if( sentence.pivotWords.length > 0 ) {
		    		sentences.push( JSON.parse( JSON.stringify( sentence ) ) );
		    	}
		    }
		}
		
		return Promise.all( sentences.map( this.writeSentence.bind( this ) ) );
	},

	writeSentence : function(sentence) {
		var ref = this.database.ref( 'sentences' )
			.push( sentence );

		return ref.then( function () {
			return Promise.all( sentence.pivotWords.map( function ( pivotWord ) {
				this.database.ref( 'pivot-words/' + pivotWord ).push( ref.key );
			}.bind ( this ) ) );
		}.bind( this ) );
	}

};

new DatabaseSeeder();