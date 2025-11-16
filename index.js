import merge from '@trenskow/merge';
import stack from '@trenskow/stack';

class ApiError extends Error {

	static _type(name) {
		switch (name) {
			case 'not-authorized': return NotAuthorized;
			case 'payment-required': return PaymentRequired;
			case 'forbidden': return Forbidden;
			case 'not-found': return NotFound;
			case 'already-exists': return Conflict;
			case 'method-not-allowed': return MethodNotAllowed;
			case 'bad-request': return BadRequest;
			case 'too-many-requests': return TooManyRequests;
			case 'payload-too-large': return PayloadTooLarge;
			case 'internal-error': return InternalError;
			case 'not-implemented': return NotImplemented;
			case 'service-unavailable': return ServiceUnavailable;
			case 'aggregated': return Aggregated;
			default: return ApiError;
		}
	}

	static parse(data, statusCode, origin) {

		let options = merge({}, data, {
			message: data.message,
			statusCode: statusCode,
			origin: origin
		});

		options.errors = options.errors?.map((error) => ApiError.parse(error, statusCode, origin, error.stack));

		return new (this._type(data.name || 'bad-request'))(options);

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

		super();

		this.message = message;

		this._name = options.name;
		this._entity = options.entity;
		this._statusCode = options.statusCode || 500;
		this._stacked = options.stack;

		delete options.message;
		delete options.name;
		delete options.entity;
		delete options.statusCode;
		delete options.stack;

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
		return (this._underlying || {}).underlying || this._underlying || this;
	}

	get stacked() {
		if (this.actual._stacked) return this.actual._stacked;
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
		super(message || 'Not authorized.', merge({}, options, {
			name: 'not-authorized',
			statusCode: 401
		}));
	}

}

class PaymentRequired extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Payment required.', merge({}, options, {
			name: 'payment-required',
			statusCode: 402
		}));
	}

}

class Forbidden extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Forbidden.', merge({}, options, {
			name: 'forbidden',
			statusCode: 403
		}));
	}

}

class NotFound extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Resource not found.', merge({}, options, {
			name: options.name || 'not-found',
			statusCode: 404
		}));
	}

}

class Conflict extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Resource already exists.', merge({}, options, {
			name: options.name || 'already-exists',
			statusCode: 409
		}));
	}

}

class MethodNotAllowed extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Method is not allowed.', merge({}, options, {
			name: options.name || 'method-not-allowed',
			statusCode: 405
		}));
	}

}

class BadRequest extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Bad request', merge({}, options, {
			name: options.name || 'bad-request',
			statusCode: 400
		}));
	}

}

class TooManyRequests extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Too many requests.', merge({}, options, {
			name: options.name || 'too-many-requests',
			statusCode: 429
		}));
	}

}

class PayloadTooLarge extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Payload too large.', merge({}, options, {
			name: options.name || 'payload-too-large',
			statusCode: 413
		}));
	}

}

class InternalError extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Internal server error.', merge({}, options, {
			name: options.name || 'internal-error',
			statusCode: 500
		}));
	}

}

class NotImplemented extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Not implemented.', merge({}, options, {
			name: options.name || 'not-implemented',
			statusCode: 501
		}));
	}

}

class ServiceUnavailable extends ApiError {

	constructor(message, options) {
		[ message, options ] = ApiError._correctArguments(message, options);
		super(message || 'Service unavailable.', merge({}, options, {
			name: options.name || 'service-unavailable',
			statusCode: 503
		}));
	}

}

class Aggregated extends ApiError {

	constructor(message, options) {

		[ message, options ] = ApiError._correctArguments(message, options);

		super(message || 'Multiple errors occurred.', merge({}, options, {
			name: options.name || 'aggregated',
			statusCode: 400
		}));

		this._errors = options.underlying?.errors || options.errors || [];

	}

	_check(errors) {

		if (Array.isArray(errors) && errors.every((error) => {
			let prototype = Object.getPrototypeOf(error);
			while (prototype !== null) {
				if (prototype.constructor.name === 'ApiError') return true;
				prototype = Object.getPrototypeOf(prototype);
			}
			return false;
		})) return errors;

		throw new TypeError('Error must an array of type `ApiError`.');

	}

	add(error) {
		this._errors = this._errors.concat(this._check(Array.isArray(error) ? error : [error]));
	}

	get errors() {
		return this._errors;
	}

	set errors(errors) {
		this._errors = this._check(errors);
	}

	toJSON(options = {}) {
		return merge({}, super.toJSON(options), {
			errors: this._errors.map((error) => error.toJSON(options))
		});
	}

}

export default ApiError;

ApiError.NotAuthorized = NotAuthorized;
ApiError.Forbidden = Forbidden;
ApiError.PaymentRequired = PaymentRequired;
ApiError.NotFound = NotFound;
ApiError.Conflict = Conflict;
ApiError.MethodNotAllowed = MethodNotAllowed;
ApiError.BadRequest = BadRequest;
ApiError.TooManyRequests = TooManyRequests;
ApiError.PayloadTooLarge = PayloadTooLarge;
ApiError.InternalError = InternalError;
ApiError.NotImplemented = NotImplemented;
ApiError.ServiceUnavailable = ServiceUnavailable;
ApiError.Aggregated = Aggregated;

export {
	NotAuthorized,
	Forbidden,
	PaymentRequired,
	NotFound,
	Conflict,
	MethodNotAllowed,
	BadRequest,
	TooManyRequests,
	PayloadTooLarge,
	InternalError,
	NotImplemented,
	ServiceUnavailable,
	Aggregated
};
