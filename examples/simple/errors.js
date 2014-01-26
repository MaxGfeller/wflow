var wflow = require('../../index.js');
var FsAdapter = require('wflow-adapter-fs');

var workflowDefinition = [
	{ 'sequence': [
		function(next) {
			console.log('Step 1');
			this.answer = 43;
			next();
		},
		function(next) {
			console.log('Step 2');
			if(this.answer !== 42) {
				return next(new Error('Answer is wrong!'))
			}
			next();
		},
		function(next) {
			console.log('Am i being called?');
			next();
		}
	] }
];

wflow.setAdapter(new FsAdapter({
	dir: 'workflow-data'
}));
wflow.setDefinition(workflowDefinition);

wflow.run(function() {
	console.log('Finished!')
});

wflow.on('error', function(err) {
	console.log('Error: ' + err.message);
});