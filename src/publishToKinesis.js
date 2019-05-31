'use strict';
/* global require */
const _ = require('highland');

function toFirehose(firehose, streamName, opts) {
	opts = opts || {};
	var batchTime = opts.batchTime || 500;
	var batchNumber = opts.batchNumber || 200;

	return _.pipeline(
		_.map(function(x) {
			return {Data: x, PartitionKey: 'f'};
		}),
		_.batchWithTimeOrCount(batchTime, batchNumber),
		_.flatMap(function(batch) {
			var params = {
				StreamName: streamName,
				Records: batch,
			};
			var promise = firehose.putRecords(params).promise().then(
				function(data) {
					console.log(data);
					var items = _(batch).zip(_(data.RequestResponses));
					return items.map(function(item) {
						var record = item[0];
						var result = item[1];
						if (result.ErrorCode) {
							throw {
								Record: record.Data,
								ErrorCode: result.ErrorCode,
								ErrorMessage: result.ErrorMessage,
							};
						}
						else {
							return {
								Record: record.Data,
								RecordId: result.RecordId,
							};
						}
					});
				},
				function(err) {
					// If the whole request failed then we'll emit a
					// separate error for every item in the batch, since
					// the caller is thinking in terms of individual
					// records.
					return _(batch).map(function(record) {
						// This synthetic error mimicks what a single-item
						// service failure might look like.
						throw {
							Record: record.Data,
							ErrorCode: 'InternalFailure',
							ErrorMessage: 'PutRecordBatch call failed: ' + err.message,
						};
					});
				}
			);
			return _(promise).flatten();
		})
	);
}

module.exports = toFirehose;
