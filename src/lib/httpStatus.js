/**
 * Centralized HTTP Status Codes
 * Reference: RFC 9110 / IANA HTTP Status Code Registry
 */

export const HttpStatusCode = Object.freeze({
    // =============================
    // 1xx Informational
    // =============================
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,

    // =============================
    // 2xx Success
    // =============================
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NoContent: 204,

    // =============================
    // 3xx Redirection
    // =============================
    MovedPermanently: 301,
    Found: 302,
    NotModified: 304,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,

    // =============================
    // 4xx Client Errors
    // =============================
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    Conflict: 409,
    Gone: 410,
    UnsupportedMediaType: 415,
    UnprocessableEntity: 422,
    TooManyRequests: 429,

    // =============================
    // 5xx Server Errors
    // =============================
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
});