'use strict';

const
	merge = require('merge'),
	stack = require('@trenskow/stack');

class ApiError extends Error {

	static parse(data, statusCode, origin) {
		let error = new ApiError(merge(true, data, {
			message: data.message,
			statusCode: statusCode,
			origin: origin
		}));
		return error;
	}

	static _correctArguments(message, options) {
		
		if (typeof message === 'object' && message !== null && !options) {
			options = message;
			message = options.message;
		}

		options = options || {};

		return [ message, options ];

	}

	static stackToJSON(s) {
		return stack(s);
	}

	constructor(message, options) {

		[ message, options ] = ApiError._correctArguments(message, options);

		if (typeof message !== 'string') throw TypeError('Message must be of type string.');

		super(message);

		this._name = options.name;
		this._entity = options.entity;
		this._statusCode = options.statusCode || 500;

		delete options.message;
		delete options.name;
		delete options.entity;
		delete options.statusCode;

		this._options = options;

		if (typeof options.keyPath === 'string') options.keyPath = options.keyPath.split('.');

		this._keyPath = options.keyPath;

		this._origin = options.origin;

		this._underlying = options.underlying;

	}

	get name() {
		return this._name;
	}

	get entity() {
		return this._entity;
	}

	get statusCode() {
		return this._statusCode;
	}

	get keyPath() {
		return this._keyPath;
	}

	get options() {
		return this._options;
	}

	get origin() {
		return this._origin;
	}

	get underlying() {
		return this._underlying;
	}

	get actual() {
		return this._underlying || this;
	}

	get stacked() {
		return ApiError.stackToJSON(this.actual.stack);
	}

	toJSON(options = {}) {
		return {
			name: this.name ? this.name.split(/(?=[A-Z])/).join('-').toLowerCase() : undefined,
			message: this.message,
			entity: this.entity,
			keyPath: this.keyPath ? (this.keyPath.length > 0 ? this.keyPath.join('.') : undefined) : undefined,
			stack: options.includeStack ? this.stacked : undefined
		};
	}

}

class NotAuthorized extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Not authorized.', merge(options, {
			name: 'not-authorized',
			statusCode: 401
		}));
	}

}

class Forbidden extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Forbidden.', merge(options, {
			name: 'forbidden',
			statusCode: 403
		}));
	}

}

class NotFound extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Resource not found.', merge(options, {
			name: options.name || 'not-found',
			statusCode: 404
		}));
	}

}

class Conflict extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Resource already exists.', merge(options, {
			name: options.name || 'already-exists',
			statusCode: 409
		}));
	}

}

class MethodNotAllowed extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Method is not allowed.', merge(options, {
			name: options.name || 'method-not-allowed',
			statusCode: 405
		}));
	}

}

class BadRequest extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Bad request', merge(options, {
			name: options.name || 'bad-request',
			statusCode: 400
		}));
	}

}

class TooManyRequests extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Too many requests.', merge(options, {
			name: options.name || 'too-many-requests',
			statusCode: 429
		}));
	}

}

class PayloadTooLarge extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Payload too large.', merge(options, {
			name: options.name || 'payload-too-large',
			statusCode: 413
		}));
	}

}

class InternalError extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Internal server error.', merge(options, {
			name: options.name || 'internal-error',
			statusCode: 500
		}));
	}

}

class NotImplemented extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Not implemented.', merge(options, {
			name: options.name || 'not-implemented',
			statusCode: 501
		}));
	}

}

class ServiceUnavailable extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Service unavailable.', merge(options, {
			name: options.name || 'service-unavailable',
			statusCode: 503
		}));
	}

}

module.exports = exports = ApiError;
exports.NotAuthorized = NotAuthorized;
exports.Forbidden = Forbidden;
exports.NotFound = NotFound;
exports.Conflict = Conflict;
exports.MethodNotAllowed = MethodNotAllowed;
exports.BadRequest = BadRequest;
exports.TooManyRequests = TooManyRequests;
exports.PayloadTooLarge = PayloadTooLarge;
exports.InternalError = InternalError;
exports.NotImplemented = NotImplemented;
exports.ServiceUnavailable = ServiceUnavailable;
