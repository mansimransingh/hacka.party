'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Subscriber = mongoose.model('Subscriber'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, subscriber;

/**
 * Subscriber routes tests
 */
describe('Subscriber CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Subscriber
		user.save(function() {
			subscriber = {
				name: 'Subscriber Name'
			};

			done();
		});
	});

	it('should be able to save Subscriber instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Subscriber
				agent.post('/subscribers')
					.send(subscriber)
					.expect(200)
					.end(function(subscriberSaveErr, subscriberSaveRes) {
						// Handle Subscriber save error
						if (subscriberSaveErr) done(subscriberSaveErr);

						// Get a list of Subscribers
						agent.get('/subscribers')
							.end(function(subscribersGetErr, subscribersGetRes) {
								// Handle Subscriber save error
								if (subscribersGetErr) done(subscribersGetErr);

								// Get Subscribers list
								var subscribers = subscribersGetRes.body;

								// Set assertions
								(subscribers[0].user._id).should.equal(userId);
								(subscribers[0].name).should.match('Subscriber Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Subscriber instance if not logged in', function(done) {
		agent.post('/subscribers')
			.send(subscriber)
			.expect(401)
			.end(function(subscriberSaveErr, subscriberSaveRes) {
				// Call the assertion callback
				done(subscriberSaveErr);
			});
	});

	it('should not be able to save Subscriber instance if no name is provided', function(done) {
		// Invalidate name field
		subscriber.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Subscriber
				agent.post('/subscribers')
					.send(subscriber)
					.expect(400)
					.end(function(subscriberSaveErr, subscriberSaveRes) {
						// Set message assertion
						(subscriberSaveRes.body.message).should.match('Please fill Subscriber name');
						
						// Handle Subscriber save error
						done(subscriberSaveErr);
					});
			});
	});

	it('should be able to update Subscriber instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Subscriber
				agent.post('/subscribers')
					.send(subscriber)
					.expect(200)
					.end(function(subscriberSaveErr, subscriberSaveRes) {
						// Handle Subscriber save error
						if (subscriberSaveErr) done(subscriberSaveErr);

						// Update Subscriber name
						subscriber.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Subscriber
						agent.put('/subscribers/' + subscriberSaveRes.body._id)
							.send(subscriber)
							.expect(200)
							.end(function(subscriberUpdateErr, subscriberUpdateRes) {
								// Handle Subscriber update error
								if (subscriberUpdateErr) done(subscriberUpdateErr);

								// Set assertions
								(subscriberUpdateRes.body._id).should.equal(subscriberSaveRes.body._id);
								(subscriberUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Subscribers if not signed in', function(done) {
		// Create new Subscriber model instance
		var subscriberObj = new Subscriber(subscriber);

		// Save the Subscriber
		subscriberObj.save(function() {
			// Request Subscribers
			request(app).get('/subscribers')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Subscriber if not signed in', function(done) {
		// Create new Subscriber model instance
		var subscriberObj = new Subscriber(subscriber);

		// Save the Subscriber
		subscriberObj.save(function() {
			request(app).get('/subscribers/' + subscriberObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', subscriber.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Subscriber instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Subscriber
				agent.post('/subscribers')
					.send(subscriber)
					.expect(200)
					.end(function(subscriberSaveErr, subscriberSaveRes) {
						// Handle Subscriber save error
						if (subscriberSaveErr) done(subscriberSaveErr);

						// Delete existing Subscriber
						agent.delete('/subscribers/' + subscriberSaveRes.body._id)
							.send(subscriber)
							.expect(200)
							.end(function(subscriberDeleteErr, subscriberDeleteRes) {
								// Handle Subscriber error error
								if (subscriberDeleteErr) done(subscriberDeleteErr);

								// Set assertions
								(subscriberDeleteRes.body._id).should.equal(subscriberSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Subscriber instance if not signed in', function(done) {
		// Set Subscriber user 
		subscriber.user = user;

		// Create new Subscriber model instance
		var subscriberObj = new Subscriber(subscriber);

		// Save the Subscriber
		subscriberObj.save(function() {
			// Try deleting Subscriber
			request(app).delete('/subscribers/' + subscriberObj._id)
			.expect(401)
			.end(function(subscriberDeleteErr, subscriberDeleteRes) {
				// Set message assertion
				(subscriberDeleteRes.body.message).should.match('User is not logged in');

				// Handle Subscriber error error
				done(subscriberDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Subscriber.remove().exec();
		done();
	});
});