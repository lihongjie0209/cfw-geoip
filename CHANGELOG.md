# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-20

### Added
- Initial release of CFW-GeoIP service
- IP geolocation lookup using MaxMind GeoLite2-City database
- Support for both IPv4 and IPv6 addresses
- Integration with Cloudflare R2 for database storage
- Multi-level caching strategy using Cache API
- CORS support for cross-origin requests
- mmdb-lib integration with Buffer polyfill for Cloudflare Workers compatibility
- Comprehensive API documentation
- Automated deployment scripts
- GitHub Actions workflow for CI/CD

### Features
- `/` endpoint for client IP lookup
- `/{ip}` endpoint for specific IP lookup
- JSON response format with detailed geolocation data
- Support for Chinese and English location names
- Error handling and validation
- Cache headers for browser caching
- Environment variable configuration

### Technical
- Built on Cloudflare Workers platform
- Uses MaxMind GeoLite2-City database
- Implements mmdb-lib for database parsing
- Buffer polyfill for Node.js compatibility
- TypeScript type definitions included
- Comprehensive test suite

### Documentation
- Complete setup and deployment guide
- API reference documentation
- Contributing guidelines
- License information
- Example usage and responses

## [Unreleased]

### Planned
- Database auto-update functionality
- Rate limiting implementation
- Analytics and usage tracking
- Additional response formats (XML, CSV)
- Batch IP lookup endpoint
- WebSocket support for real-time queries
