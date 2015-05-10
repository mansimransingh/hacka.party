'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Subscriber = mongoose.model('Subscriber'),
	_ = require('lodash');

/**
 * Create a Subscriber
 */
exports.create = function(req, res) {
	var subscriber = new Subscriber(req.body);
	subscriber.user = req.user;

	subscriber.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(subscriber);
		}
	});
};

/**
 * Show the current Subscriber
 */
exports.read = function(req, res) {
	res.jsonp(req.subscriber);
};

/**
 * Update a Subscriber
 */
exports.update = function(req, res) {
	var subscriber = req.subscriber ;

	subscriber = _.extend(subscriber , req.body);

	subscriber.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(subscriber);
		}
	});
};

/**
 * Delete an Subscriber
 */
exports.delete = function(req, res) {
	var subscriber = req.subscriber ;

	subscriber.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(subscriber);
		}
	});
};

/**
 * List of Subscribers
 */
exports.list = function(req, res) { 
	Subscriber.find().sort('-created').populate('user', 'displayName').exec(function(err, subscribers) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(subscribers);
		}
	});
};

/**
 * Subscriber middleware
 */
exports.subscriberByID = function(req, res, next, id) { 
	Subscriber.findById(id).populate('user', 'displayName').exec(function(err, subscriber) {
		if (err) return next(err);
		if (! subscriber) return next(new Error('Failed to load Subscriber ' + id));
		req.subscriber = subscriber ;
		next();
	});
};

/**
 * Subscriber authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.subscriber.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
