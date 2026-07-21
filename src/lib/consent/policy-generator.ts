/**
 * Legal Policy Generator (Privacy Policy, Cookie Policy, Terms of Service)
 * Generates custom markdown/HTML legal policies with dynamically populated cookie scan tables.
 */

export interface PolicyParams {
  organizationName: string;
  websiteUrl: string;
  contactEmail: string;
  address: string;
  dpoEmail?: string;
  detectedCookies?: Array<{
    name: string;
    domain: string;
    category: string;
    expiry: string;
    description: string;
  }>;
}

export function generatePrivacyPolicy(params: PolicyParams): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `# Privacy Policy for ${params.organizationName}

**Last Updated:** ${dateStr}

At **${params.organizationName}** ("we", "us", or "our"), accessible from [${params.websiteUrl}](${params.websiteUrl}), one of our main priorities is the privacy of our visitors and members. This Privacy Policy document outlines the types of personal data collected, how it is processed, and your explicit rights under the **General Data Protection Regulation (GDPR)**, **California Consumer Privacy Act (CCPA/CPRA)**, and the **Kenya Data Protection Act, 2019**.

---

## 1. Information We Collect

We collect information to empower youth, facilitate environmental conservation initiatives, and optimize user experience.

### A. Information You Explicitly Provide
* **Member Registration:** Full name, email address, phone number, county, occupation, motivation statement, and conservation interest areas.
* **Contact & Inquiries:** Name, email address, subject, and message content when submitting contact forms.
* **Newsletter Subscriptions:** Email address for sending impact reports and program updates.

### B. Information Automatically Collected
* **Log & Usage Data:** IP addresses (anonymized/hashed), browser type, referring/exit pages, date/time stamps, and page view metrics.
* **Cookie & Device Data:** Preferences and consent tokens recorded via our Consent Management Platform (CMP).

---

## 2. Legal Basis for Processing (GDPR Compliance)

We process your personal data under the following legal bases:
1. **Consent:** When you opt into non-essential cookies, newsletter subscriptions, or voluntary community membership.
2. **Legitimate Interests:** To protect our platform against unauthorized access, maintain network security, and measure community impact.
3. **Legal Obligation:** To comply with statutory data retention and regulatory reporting requirements.

---

## 3. How We Use Your Information

* Facilitating youth environmental programs, tree planting campaigns, and conservation projects.
* Sending transactional receipts, membership status notifications, and updates.
* Ensuring compliance with privacy laws and maintaining transparent consent logs.
* Improving website performance and security infrastructure.

---

## 4. Your Privacy Rights (GDPR & CCPA)

Depending on your geographic region, you possess the following enforceable data rights:

* **Right to Access & Portability:** Request copies of your personal data stored in our systems.
* **Right to Rectification:** Request correction of inaccurate or incomplete information.
* **Right to Erasure ("Right to be Forgotten"):** Request permanent deletion of your personal records.
* **Right to Restrict or Object:** Limit how we process your information.
* **CCPA "Do Not Sell or Share":** We **do not sell** your personal information. You may opt out of third-party sharing anytime.

To exercise your privacy rights, please contact our Data Protection Officer at [${params.dpoEmail || params.contactEmail}](mailto:${params.dpoEmail || params.contactEmail}).

---

## 5. Contact Information

If you have questions regarding this Privacy Policy, please contact:

**${params.organizationName}**  
Address: ${params.address}  
Email: [${params.contactEmail}](mailto:${params.contactEmail})  
Data Protection Officer: [${params.dpoEmail || params.contactEmail}](mailto:${params.dpoEmail || params.contactEmail})
`;
}

export function generateCookiePolicy(params: PolicyParams): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const cookies = params.detectedCookies || [
    {
      name: 'greenwave_cookie_consent_v2',
      domain: params.websiteUrl,
      category: 'Strictly Necessary',
      expiry: '1 Year',
      description: 'Stores visitor cookie category consent choices and preferences.',
    },
    {
      name: '_ga',
      domain: 'google.com',
      category: 'Analytics',
      expiry: '2 Years',
      description: 'Google Analytics identifier used to measure website usage and impact.',
    },
    {
      name: '_fbp',
      domain: 'facebook.com',
      category: 'Marketing',
      expiry: '3 Months',
      description: 'Meta pixel tag used to measure social campaign reach.',
    },
  ];

  const cookieRows = cookies
    .map(
      (c) =>
        `| **${c.name}** | \`${c.domain}\` | ${c.category} | ${c.expiry} | ${c.description} |`
    )
    .join('\n');

  return `# Cookie Policy for ${params.organizationName}

**Last Updated:** ${dateStr}

This Cookie Policy explains how **${params.organizationName}** ("we", "us") uses cookies and similar tracking technologies when you visit [${params.websiteUrl}](${params.websiteUrl}).

---

## 1. What Are Cookies?

Cookies are small text files placed on your computer or mobile device when visiting websites. They are widely used to make websites work efficiently, provide security, and supply analytical insights.

---

## 2. Active Cookies & Trackers Inventory

Our automated cookie scanner continuously audits trackers active on our platform:

| Cookie Name | Provider / Domain | Category | Expiration | Purpose |
| :--- | :--- | :--- | :--- | :--- |
${cookieRows}

---

## 3. Cookie Categories

* **Strictly Necessary:** Essential for navigating the site, authenticating users, and preventing fraud. These cannot be disabled.
* **Analytics & Performance:** Provide aggregated statistical insights into visitor counts, popular pages, and user journeys.
* **Functional Preferences:** Remember your chosen language (from 35 supported languages), region, and layout settings.
* **Marketing & Outreach:** Help measure campaign conversion rates and support community outreach.

---

## 4. Managing Your Preferences

You can change or withdraw your cookie consent at any time by clicking the **"Cookie Settings"** floating button on the bottom left of any page on our website.
`;
}

export function generateTermsOfService(params: PolicyParams): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `# Terms of Service for ${params.organizationName}

**Last Updated:** ${dateStr}

Welcome to **${params.organizationName}**. By accessing or using our website [${params.websiteUrl}](${params.websiteUrl}) and participating in our programs, you agree to be bound by these Terms of Service.

---

## 1. Member Eligibility & Code of Conduct

* Membership is open to all individuals committed to youth empowerment and environmental protection.
* Users agree to provide accurate registration information and maintain respectful communication.

---

## 2. Intellectual Property Rights

All content, logos, materials, and digital assets on this site are the property of **${params.organizationName}** unless explicitly stated otherwise.

---

## 3. Contact Us

For questions regarding these Terms, contact us at [${params.contactEmail}](mailto:${params.contactEmail}).
`;
}
