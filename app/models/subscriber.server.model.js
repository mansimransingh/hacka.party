'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Subscriber Schema
 */
var SubscriberSchema = new Schema({
//	name: {
//		type: String,
//		default: '',
//		required: 'Please fill Subscriber name',
//		trim: true
//	},
	email: {
		type: String,
		default: '',
		required: 'Please enter your email address',
		trim:true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Subscriber', SubscriberSchema);
