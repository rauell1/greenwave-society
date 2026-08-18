# CMS communications

The communications module stores campaign drafts and immutable recipient delivery records. Active newsletter subscribers are snapshotted only after a compare-and-swap claim moves a campaign into `sending`, preventing accidental duplicate sends. Every recipient has provider ID, attempt count, delivery status, and a bounded error record.

Sending requires `communications.send`, the `cms.communications` feature flag, and `RESEND_API_KEY`. Campaigns remain drafts when the provider is not configured. Every marketing message includes the existing Greenwave brand shell, logo, official `info@greenwave.rauell.systems` sender, and a per-subscriber unsubscribe link. Unsubscribed addresses are excluded from future snapshots.

Apply `20260810190000_cms_communications` to an isolated database branch and seed RBAC before enabling the feature. Provider domain verification and webhook-based delivered/bounced/complained events remain deployment prerequisites before production activation.
