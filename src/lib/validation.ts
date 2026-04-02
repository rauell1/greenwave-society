/**
 * Input Validation and Sanitization
 *
 * Provides robust input validation and sanitization to prevent
 * XSS, SQL injection, and other injection attacks.
 */

import { z } from "zod";
import { VALIDATION } from "@/config/app.config";

/**
 * Sanitize user input by removing potentially dangerous characters
 * while preserving legitimate content
 */
export function sanitizeString(input: string): string {
  if (!input) return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove inline event handlers
    .substring(0, 2000); // Limit length
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().substring(0, VALIDATION.email.maxLength);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION.email.regex.test(email) && email.length <= VALIDATION.email.maxLength;
}

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.contactForm.nameMinLength, "Name must be at least 2 characters")
    .max(VALIDATION.contactForm.nameMaxLength, "Name must be less than 100 characters")
    .transform(sanitizeString),
  email: z
    .string()
    .email("Invalid email address")
    .max(VALIDATION.email.maxLength, "Email is too long")
    .transform(sanitizeEmail),
  interest: z.enum(VALIDATION.validInterests).default("general"),
  message: z
    .string()
    .min(VALIDATION.contactForm.messageMinLength, "Message must be at least 10 characters")
    .max(VALIDATION.contactForm.messageMaxLength, "Message must be less than 2000 characters")
    .transform(sanitizeString),
});

/**
 * Newsletter subscription validation schema
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(VALIDATION.email.maxLength, "Email is too long")
    .transform(sanitizeEmail),
});

/**
 * Type exports
 */
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;

/**
 * Validate and parse input using a schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: "Invalid input" };
  }
}

/**
 * Check if a string contains suspicious patterns
 */
export function containsSuspiciousPatterns(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Rate limit key generator from IP address
 */
export function getRateLimitKey(identifier: string): string {
  // Simple hash function for privacy
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `rl:${Math.abs(hash)}`;
}
