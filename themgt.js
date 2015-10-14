var express = require('express');
var fs = require('fs');

var app = express();

var map = {};

app.listen(1337);

app.get('/', function(req, res) {
	generateSample(res);
});

function generateSample(res) {
	readSource(res);
}

function readSource(res) {
	fs.readFile('./source.txt', 'utf8', function(error, data) {
		buildMap(data, res)
	});
}

function buildMap(data, res) {
    fs.readFile('./map.json', 'utf8', function(error, fileData) {
        if (error) {

            var sentences = data.match(/\(?[^\.\?\!]+[\.!\?]\)?/g);
        	for (var i = 0; i < sentences.length; i++) {
        		addSentenceToMap(sentences[i]);
        	}
	
            fs.writeFile('./map.json', JSON.stringify(map), function (err) {
                console.log("Map file write error: " + err)
            })
                        
        }
        else {
            map = JSON.parse(fileData)
        }
        res.send(generateSentences())
        
    })
    
    
}

function addSentenceToMap(sentence) {
	var wordArray = sentence.split(" ");
	
	for (i = 0; i < wordArray.length; i++) {
		var word = wordArray[i].replace(/[.!?{}\"]/g,"").replace(/\s{2,}/g," ");
		if (word == 'some' || word == 'sort' || word == 'every') {
		    word = 'foo';
		}
		var nextWord = "$";
		
		if (i  < wordArray.length - 1) {
			nextWord = wordArray[i+1].replace(/[.!?{}\"]/g,"").replace(/\s{2,}/g," ")
		}
		
        if(nextWord == 'some' || nextWord == 'sort' || nextWord == 'every') {
            nextWord = 'foo';
        }

		var transitionsHistogram = map[word];

		if (transitionsHistogram == null) {
			transitionsHistogram = {};
		}
		
		var wordFrequency = transitionsHistogram[nextWord];
		if (wordFrequency == null) {
			wordFrequency = 0
		}
		wordFrequency++;
		transitionsHistogram[nextWord] = wordFrequency;
		
		map[word] = transitionsHistogram;
	}
}

function generateNextWord(word) {
	var transitionHistogram = map[word];
	var weightedWords = [];
	for (nextWord in transitionHistogram) {
		var frequency = transitionHistogram[nextWord];
		for (var i = 0; i < frequency; i++) {
			weightedWords.push(nextWord);
		}
	}
	
	var p = (Math.random()*4294967296) % weightedWords.length;
	return weightedWords[p]
}

function randomWord() {
	return Object.keys(map)[(Math.random() *4294967296) % Object.keys(map).length];
}

var minSentenceLength = 3;
var maxSentenceLength = 30;

function generateSentence() {
	var currentWord = randomWord();
	var result = currentWord;
	result = result.charAt(0).toUpperCase() + result.slice(1)
	
	for (i = 1; i < maxSentenceLength; i++) {
		currentWord = generateNextWord(currentWord);
		
		if (currentWord == "$") {
			if (i > minSentenceLength) {
				return result + ". ";
			}
			else {
				currentWord = randomWord();
			}
		}
		
		result += " " + currentWord
	}
	
	return result + ". ";
} 

var minSentences = 5;
var maxSentences = 10;

function generateSentences() {
	var result = "";
	for (var i = 0; i < maxSentences; i++) {
		result += generateSentence();
	}

	return result
}