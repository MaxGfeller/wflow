var wflow = function() {
	this.participants = {};
	this.payload = null;
}

wflow.prototype.types = {
	SEQUENCE: 'sequence',
	CONDITION: 'condition',
	PARTICIPANT: 'participant',
	CONCURRENT: 'concurrent'
}

wflow.prototype.registerParticipant = function(name, participant) {
	this.participants[name] = participant;
}

wflow.prototype.setAdapter = function(adapter) {
  this.adapter = adapter;
}

wflow.prototype.setDefinition = function(definition) {
  this.definition = definition;
}

wflow.prototype.run = function(payload, cb) {
	this.payload = payload || {};
	cb = cb || function() {};
	this._processSequence(this.definition, cb);
}

wflow.prototype._processSequence = function(sequence, cb) {
	var l = sequence.length;
	var i = 0;

	var processSequenceItem = function() {
		if(i === l) return cb();

		var seqItem = sequence[i];
		i++;

		if(typeof seqItem === 'object') {
			this._processWflowElement(seqItem, processSequenceItem);
		} else if(typeof seqItem === 'function') {
			seqItem.call(this.payload, processSequenceItem);
		}
	}.bind(this)

	processSequenceItem();
}

wflow.prototype._processConcurrent = function(concurrents, cb) {
	var l = concurrents.length;
	var i = 0;

	var processConcurrentItem = function() {
		i++;
		if(i === l) return cb();
	}

	concurrents.forEach(function(concurrent) {
		concurrent.call(this.payload, processConcurrentItem);
	});
}

wflow.prototype._runParticipant = function(participant) {
	var p = this.participants[participant.participant];

	if(!p) return console.error('Participant not found: ' + participant.participant);

	var func = p[participant.action];

	if(!func) return console.error('Participant action not found: ' + participant.action);
	
	func.call(p);
}

wflow.prototype.pause = function() {

}

wflow.prototype.resume = function() {

}

wflow.prototype._processWflowElement = function(el, cb) {
	var type = Object.keys(el)[0];

	switch(type) {
		case this.types.SEQUENCE: this._processSequence(el[type], cb);
			break;
		case this.types.CONCURRENT: this._processConcurrent(el[type], cb);
			break;
		case this.types.PARTICIPANT: this._runParticipant(el);
			break;
		default: return console.error('Element type not known: ' + type);
	}
}

module.exports = new wflow();
