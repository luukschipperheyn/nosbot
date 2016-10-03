import firebase from 'firebase/app.js';
import 'firebase/auth.js';
import 'firebase/database.js';
import $ from 'jquery';

var NosBot = function ( button, outputElement ) {
	this.button = button;
	this.outputElement = outputElement;
	this.initializeFirebase();
	this.bindHandlers();
}


function getRandomKey ( object ) {
    var keys = Object.keys( object );
    return keys[ Math.floor( Math.random() * keys.length ) ];
}

function getKeyThatIsNot ( object, key ) {
	var keys = Object.keys( object );
	for( var i = 0; i < keys.length; i++ ) {
		if( keys[i] != key) {
			return keys[i];
		}
	}
}

function getRandomKeyThatIsNot ( object, key ) {
	var found = false;
	var randomKey;
	while ( found == false ) {
		randomKey = getRandomKey( object );
		if( randomKey != key ) {
			found = true;
		}
	}
	return randomKey;
}

NosBot.prototype = {
	bindHandlers : function () {
		$( this.button ).on( 'click', this.handleButtonClick.bind( this ) );
	},

	handleButtonClick : function () {
		this.getNewsFlash();
	},

	initializeFirebase : function () {
		$.ajax( {
			url : '/config.json',
			dataType : 'json'
		} ).done( function ( config ) {
			firebase.initializeApp(config);
		} );
	},

	getNewsFlash : function () {
		firebase.database().ref('/pivot-words').once('value').then(function(snapshot) {
		    return snapshot.val();
		}).then( function ( pivotWords ) {
			firebase.database().ref( '/sentences' ).once( 'value' ).then( function ( snapshot ) {
				return snapshot.val();
			}).then( function ( sentences ) {
				console.log( sentences );
				var randomPivotKey = getRandomKey( pivotWords );
				var pivotWord = pivotWords[ randomPivotKey ];

				var firstSentenceKeyKey = getRandomKey( pivotWord );
			    var firstSentenceKey = pivotWord[ firstSentenceKeyKey ];

			    var firstSentence = sentences[ firstSentenceKey ];
			    firstSentence.key = firstSentenceKey;
			    var firstSentenceText = firstSentence.text.slice( 0, firstSentence.text.indexOf( randomPivotKey ) );
			    

			    var secondSentenceKeyKey = getRandomKeyThatIsNot( pivotWord, firstSentenceKeyKey );
			    var secondSentenceKey = pivotWord[ secondSentenceKeyKey ];
			    var secondSentence = sentences[ secondSentenceKey ];
			    secondSentence.key = secondSentenceKey;
			    var secondSentenceText = secondSentence.text.slice( secondSentence.text.indexOf( randomPivotKey ) );

			    var newsFlash = firstSentenceText + secondSentenceText;

			    var $outputElement = $( this.outputElement );
			    $outputElement.empty();

			    var newsFlashElement = document.createElement( 'h1' );
			    $( newsFlashElement ).addClass( 'theme-title' );
			    newsFlashElement.innerHTML = newsFlash;
			    $outputElement.append( newsFlashElement );

			}.bind( this ));
		}.bind( this ) );
	}

};

export default NosBot;