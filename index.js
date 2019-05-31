/* eslint-disable no-console */
/* global require console Buffer */
'use strict';
const NUM_EVENTS = 10; //max 500 for now
const eventGenerator = require('./src/eventGenerator');
const _ = require('highland');
const toFirehose = require('./src/publishToKinesis');
const AWS = require('aws-sdk');
const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.update({region:'ca-central-1'});
AWS.config.credentials = credentials;

const events = eventGenerator.generateEventsMix(NUM_EVENTS).map((x)=> new Buffer(JSON.stringify(x)));
_(events).pipe(
	toFirehose(new AWS.Kinesis(), 'TomAndJerry', {
		batchTime: 500,
		batchNumber: 100
	})
).each(
	x=> console.log(x.RecordId)
).errors(
	function(err) {
		console.error(err.ErrorCode, err.ErrorMessage);
	}
).done(
	()=>console.log('finished streaming events')
);
