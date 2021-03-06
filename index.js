var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var randomId = require('random-id');

var Wflow = function() {
	this.participants = {};
	this.payload = null;
	this.adapter = null;
}

inherits(Wflow, EventEmitter);

Wflow.prototype.types = {
	SEQUENCE: 'sequence',
	CONDITION: 'condition',
	PARTICIPANT: 'participant',
	PARALLEL: 'parallel'
}

Wflow.prototype.registerParticipant = function(name, participant) {
	this.participants[name] = participant;
}

Wflow.prototype.setAdapter = function(adapter) {
  this.adapter = adapter;
}

Wflow.prototype.setDefinition = function(definition) {
  this.definition = definition;
}

Wflow.prototype.run = function(payload, cb) {
	this.payload = payload || {};
	if(!cb) {
		if(typeof payload === 'function') {
			cb = payload;
			this.payload = {};
		} else {
			cb = function() {};
		}
	}

	if(this.adapter) this.adapter.initializeWorkflow(randomId(20,"aaaaa0"), this.definition, this.payload);
	setTimeout(this._processSequence.bind(this, this.definition, cb));
}

Wflow.prototype._processSequence = function(sequence, cb) {
	var l = sequence.length;
	var i = 0;

	var processSequenceItem = function(err) {
		if(err) {
			this.emit('error', err);
			return this.pause();
		}

		if(i === l) return cb();

		var seqItem = sequence[i];
		i++;

		if(typeof seqItem === 'object') {
			this._processWflowElement(seqItem, processSequenceItem);
		} else if(typeof seqItem === 'function') {
			this.emit('beforeCall', this.payload);
			seqItem.call(this.payload, processSequenceItem);
		}
	}.bind(this)

	processSequenceItem();
}

Wflow.prototype._processParallel = function(parallels, cb) {
	var l = parallels.length;
	var i = 0;

	var processParallelItem = function() {
		i++;
		if(i === l) return cb();
	}

	parallels.forEach(function(parallel) {
		setTimeout(function() {
			this.emit('beforeCall', this.payload);
			parallel.call(this.payload, processParallelItem);
		}.bind(this), 0);
	}.bind(this));
}

Wflow.prototype._runParticipant = function(participant) {
	var p = this.participants[participant.participant];

	if(!p) return console.error('Participant not found: ' + participant.participant);

	var func = p[participant.action];

	if(!func) return console.error('Participant action not found: ' + participant.action);
	
	func.call(p);
}

Wflow.prototype.pause = function() {

}

Wflow.prototype.resume = function() {

}

Wflow.prototype._processWflowElement = function(el, cb) {
	var type = Object.keys(el)[0];

	switch(type) {
		case this.types.SEQUENCE: this._processSequence(el[type], cb);
			break;
		case this.types.PARALLEL: this._processParallel(el[type], cb);
			break;
		case this.types.PARTICIPANT: this._runParticipant(el);
			break;
		default: return console.error('Element type not known: ' + type);
	}
}

module.exports = new Wflow();
