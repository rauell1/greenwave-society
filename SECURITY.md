# Security Policy

## Reporting a Vulnerability

We take the security of Greenwave Society's systems seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email us at: **info@greenwavesociety.org**

Include the following information:
- Type of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Status Updates**: Weekly until resolved
- **Resolution**: Depends on severity (Critical: 7 days, High: 30 days, Medium: 60 days, Low: 90 days)

### Responsible Disclosure

We ask that you:
- Give us reasonable time to fix the issue before public disclosure
- Make a good faith effort to avoid privacy violations and data destruction
- Do not exploit the vulnerability beyond what is necessary to demonstrate it

## Security Measures

### Implemented Protections

1. **Input Validation**
   - All user inputs validated using Zod schemas
   - Sanitization of HTML/script content
   - Email format validation

2. **Rate Limiting**
   - API endpoints limited to 100 requests per 15 minutes
   - Prevents brute force attacks
   - DDoS mitigation

3. **Security Headers**
   - Content Security Policy (CSP)
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection enabled

4. **Database Security**
   - Parameterized queries via Prisma ORM
   - No raw SQL execution
   - Connection pooling limits

5. **CORS Configuration**
   - Restricted to specific origins in production
   - No wildcard origins

6. **Logging & Monitoring**
   - Structured logging of all requests
   - Error tracking
   - Suspicious activity detection

### Best Practices for Contributors

1. **Never commit secrets**
   - Use environment variables
   - Check .gitignore includes .env

2. **Validate all inputs**
   - Use provided validation schemas
   - Sanitize user-generated content

3. **Use parameterized queries**
   - Never concatenate SQL
   - Use Prisma's type-safe queries

4. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Update vulnerable packages promptly

5. **Review code for XSS**
   - Avoid `dangerouslySetInnerHTML`
   - Sanitize before rendering user content

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Security Checklist for Deployment

- [ ] All environment variables set
- [ ] `SESSION_SECRET` is randomly generated (32+ characters)
- [ ] `NODE_ENV=production` is set
- [ ] CORS origins configured correctly
- [ ] HTTPS enabled
- [ ] Database backups scheduled
- [ ] Rate limiting enabled
- [ ] Security headers verified
- [ ] Dependencies up to date
- [ ] Logs monitored
- [ ] Health checks working

## Known Security Considerations

### Current Limitations

1. **SQLite Database**
   - File-based, not ideal for high-security applications
   - Recommend migration to PostgreSQL for production at scale

2. **In-Memory Rate Limiting**
   - Resets on application restart
   - For multiple instances, use Redis

3. **No Built-in Authentication**
   - Currently no admin panel
   - If adding, implement proper authentication

### Recommendations for Production

1. **Database**: Migrate to PostgreSQL with encryption at rest
2. **Secrets Management**: Use a secrets manager (AWS Secrets Manager, HashiCorp Vault)
3. **Rate Limiting**: Implement Redis-based rate limiting
4. **WAF**: Use a Web Application Firewall (Cloudflare, AWS WAF)
5. **DDoS Protection**: Use Cloudflare or similar service
6. **Monitoring**: Implement APM and security monitoring
7. **Backups**: Automated, encrypted, off-site backups
8. **Audit Logging**: Comprehensive audit trail for all actions

## Compliance

### Data Protection

- **GDPR**: User data handling follows GDPR principles
- **Data Minimization**: Only essential data collected
- **Right to Deletion**: Contact form for data deletion requests
- **Transparency**: Clear privacy policy on website

### Contact

For security concerns: info@greenwavesociety.org

For general inquiries: See README.md

---

Last Updated: 2026-04-02
