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

function timeToFrames ( hms ) {
	var a = hms.split(':'); // split it at the colons
	var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 

	return Math.floor( seconds * 25);
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
			    
			    timeToFrames( firstSentence.startTime );

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

			    var avsCodeElement = document.createElement( 'pre' );
			    $( avsCodeElement ).addClass( 'hidden' );
			    avsCodeElement.innerHTML += 
				    'LoadPlugin("C:\\Program Files (x86)\\AviSynth\\plugins\\ffms2.dll")\n'+
				    'FFmpegSource2("D:\\Users\\Arvid Jense\\Desktop\\VPROhack\\intro.mp4",atrack=-1)\n'+
					'intro = last\n'+
					'FFmpegSource2("D:\\Users\\Arvid Jense\\Desktop\\VPROhack\\'+ firstSentence.filename +'.m4v",atrack=-1)\n'+
					'Trim(last , ' + timeToFrames(firstSentence.startTime) +','+timeToFrames(firstSentence.endTime)+')\n'+
					'video1 = last\n'+
					'FFmpegSource2("D:\\Users\\Arvid Jense\\Desktop\\VPROhack\\'+ secondSentence.filename +'.m4v",atrack=-1)\n'+
					'Trim(last , ' + timeToFrames(secondSentence.startTime) +','+timeToFrames(secondSentence.endTime)+')\n'+
					'video2 = last\n'+
				    'FFmpegSource2("D:\\Users\\Arvid Jense\\Desktop\\VPROhack\\outro.mp4",atrack=-1)\n'+
					'outro = last\n'+
					'AlignedSplice(intro,video1,video2,outro)';
				$outputElement.append( avsCodeElement );

				newsFlashElement.onclick = function () {
					$( avsCodeElement ).toggleClass( 'hidden' );
				};

			}.bind( this ));
		}.bind( this ) );
	}

};

export default NosBot;