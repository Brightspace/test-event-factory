'use strict';
/* global require module */
const uuidv4 = require('uuid/v4');
const testTopic = 'activityId-objectType-Action';

function generateStandardEvent() {
	const parts = testTopic.split('-');
	const ActivityId = parts[0];
	const ObjectType = parts[1];
	const Action = parts[2];
	const timestampMS = `/Date(${Date.now()})/`;
	const event = {
		EventType: 'NotifierDeploymentTestEvent',
		Timestamp: timestampMS,
		Version: '0.1',
		EventId: uuidv4(),
		TenantId: uuidv4(),
		EventBody: {
			EventTypeGuid: uuidv4(),
			Activity: { Id: ActivityId, Type: 'some type'},
			Object: { Type: ObjectType, Id: 'some id' },
			Action: Action,
			Actor: { Type: 'User', Id: 'some id' },
			Context: { Type: 'some type', Id: 'some id' },
			Timestamp: timestampMS
		}
	};
	return event;
}

function generateUserInteractionEvent() {
	const parts = testTopic.split('-');
	const ToolId = parts[0];
	const Activity = parts[1];
	const UserInteractionType = parts[2];
	const timestampMS = `/Date(${Date.now()})/`;
	const event = {
		TenantId: uuidv4(),
		EventId: uuidv4(),
		EventType: 'UserInteractionEvent',
		Timestamp: timestampMS,
		EventBody: {
			UserId: 1,
			RoleId: 2,
			OrgUnitId: 3,
			ToolId: ToolId,
			Activity: Activity,
			ObjectId: 4,
			UserInteractionType: UserInteractionType,
			ObjectName: null,
			ObjectType: null,
			ImpersonatingUserId: null,
			ObjectUri: null,
			ContentTopicId: null,
			ObjectProperties: null,
			EventTypeGuid: 'a7d0d3ea-b161-4693-83b8-8290e711ab40'
		}
	};
	return event;
}

function generateEventsMix(eventsCount) {
	const events = [];
	for (let i = 0; i < eventsCount; i++) {
		if (i % 2) {
			events.push(generateStandardEvent());
		} else {
			events.push(generateUserInteractionEvent());
		}
	}
	return events;
}

module.exports = {
	generateStandardEvent,
	generateUserInteractionEvent,
	generateEventsMix
};
