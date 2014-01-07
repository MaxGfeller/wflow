var wflow = require('../../index.js');

var workflowDefinition = [
	{ 'sequence': [
		function(next) {
			console.log('Hello ' + this.name + ', this is step 1');
			this.secretNumber = 42;

			next();
		},
		function(next) {
			console.log('The secret number is: ' + this.secretNumber);
			next();
		},
		function(next) {
			setTimeout(function() {
				console.log('Here is step 3 (a little late)');
				next();
			}, 2000);			
		},
		{ 'parallel': [
			function(next) {
				console.log('x');
				next();
			},
			function(next) {
				console.log('y');
				next();
			},
			function(next) {
				console.log('z');
				next();
			}
		]}
	] }
];

wflow.setDefinition(workflowDefinition);

wflow.run({
	name: 'Max'
}, function() {
	console.log('Finished!')
});

wflow.on('beforeCall', function(payload) {
	console.log('before call');
});