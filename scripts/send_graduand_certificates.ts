/**
 * Script: send_graduand_certificates.ts
 * Purpose: Sends personalized completion certificate emails to the 12 verified YPG Cohort I graduands.
 *
 * Usage:
 *   npx tsx scripts/send_graduand_certificates.ts --dry-run
 *   npx tsx scripts/send_graduand_certificates.ts --test-to=your-email@domain.com
 *   npx tsx scripts/send_graduand_certificates.ts --send-all
 *   npx tsx scripts/send_graduand_certificates.ts --send-to=slug --email=address@domain.com
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import fs from "fs";
import path from "path";
import { VERIFIED_GRADUANDS, findGraduandBySlugOrId } from "../src/lib/events/graduand-registry";
import { sendGraduationCertificateEmail } from "../src/lib/events/email";
import { SITE_URL } from "../src/lib/email-template";

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const testToArg = args.find((a) => a.startsWith("--test-to="))?.split("=")[1];
  const sendAll = args.includes("--send-all");
  const sendToSlug = args.find((a) => a.startsWith("--send-to="))?.split("=")[1];
  const customEmail = args.find((a) => a.startsWith("--email="))?.split("=")[1];

  console.log("==========================================================");
  console.log(" GREENWAVE SOCIETY • YPG COHORT I CERTIFICATE DISPATCHER");
  console.log("==========================================================");
  console.log(`Site Base URL: ${SITE_URL}`);
  console.log(`Resend API Key: ${process.env.RESEND_API_KEY ? "CONFIGURED (Length: " + process.env.RESEND_API_KEY.length + ")" : "NOT SET (Simulation Mode)"}`);
  console.log(`Total Verified Graduands: ${VERIFIED_GRADUANDS.length}`);
  console.log("----------------------------------------------------------");

  // Summary of all 12 graduands and their current email status
  console.log("GRADUAND REGISTRY & STATUS:");
  for (const g of VERIFIED_GRADUANDS) {
    const pngPath = path.join(process.cwd(), "public", "certificates", "cohort-1", "canonical", `${g.slug}.png`);
    const pdfPath = path.join(process.cwd(), "public", "certificates", "cohort-1", "canonical", `${g.slug}.pdf`);
    const hasPng = fs.existsSync(pngPath);
    const hasPdf = fs.existsSync(pdfPath);
    console.log(
      ` [${g.id}] ${g.fullName.padEnd(20)} | Email: ${(g.email || "PENDING").padEnd(30)} | PNG: ${hasPng ? "OK" : "MISSING"} | PDF: ${hasPdf ? "OK" : "MISSING"}`
    );
  }
  console.log("----------------------------------------------------------");

  if (isDryRun) {
    console.log("\n[DRY RUN MODE] Previews of links and email dispatches:");
    for (const g of VERIFIED_GRADUANDS) {
      const portalUrl = `${SITE_URL}/events/graduation-cohort-1/certificate?token=${g.accessToken}`;
      console.log(`\n• Graduand: ${g.fullName} (${g.credentialId})`);
      console.log(`  Recipient: ${g.email || "No email on file (awaiting input)"}`);
      console.log(`  Access Pass Link: ${portalUrl}`);
      console.log(`  Certificate File: /certificates/cohort-1/canonical/${g.slug}.png`);
    }
    console.log("\nDry run complete. No emails were dispatched.");
    return;
  }

  // Handle single test email
  if (testToArg) {
    const sample = VERIFIED_GRADUANDS[0]; // Victor Frankline
    console.log(`\nSending sample test certificate to: ${testToArg}`);
    console.log(`Using sample graduand: ${sample.fullName} (${sample.credentialId})`);

    const pngPath = path.join(process.cwd(), "public", "certificates", "cohort-1", "canonical", `${sample.slug}.png`);
    const certBuffer = fs.existsSync(pngPath) ? fs.readFileSync(pngPath) : undefined;
    const portalUrl = `${SITE_URL}/events/graduation-cohort-1/certificate?token=${sample.accessToken}`;

    const sent = await sendGraduationCertificateEmail({
      to: testToArg,
      name: sample.fullName,
      credentialId: sample.credentialId,
      ticketNumber: sample.ticketNumber,
      certificatePortalUrl: portalUrl,
      pod: sample.pod,
      capstoneTitle: sample.capstoneTitle,
      certBuffer,
    });

    console.log(`Test email dispatch result: ${sent ? "SUCCESS" : "FAILED"}`);
    return;
  }

  // Handle sending to a specific graduand with optional custom email
  if (sendToSlug) {
    const target = findGraduandBySlugOrId(sendToSlug);
    if (!target) {
      console.error(`Error: Graduand slug '${sendToSlug}' not found.`);
      return;
    }

    const emailToSend = customEmail || target.email;
    if (!emailToSend) {
      console.error(`Error: Graduand '${target.fullName}' has no email on file. Use --email=address@domain.com.`);
      return;
    }

    console.log(`\nDispatching certificate email to: ${target.fullName} <${emailToSend}>`);
    const pngPath = path.join(process.cwd(), "public", "certificates", "cohort-1", "canonical", `${target.slug}.png`);
    const certBuffer = fs.existsSync(pngPath) ? fs.readFileSync(pngPath) : undefined;
    const portalUrl = `${SITE_URL}/events/graduation-cohort-1/certificate?token=${target.accessToken}`;

    const sent = await sendGraduationCertificateEmail({
      to: emailToSend,
      name: target.fullName,
      credentialId: target.credentialId,
      ticketNumber: target.ticketNumber,
      certificatePortalUrl: portalUrl,
      pod: target.pod,
      capstoneTitle: target.capstoneTitle,
      certBuffer,
    });

    console.log(`Result: ${sent ? "DELIVERED" : "FAILED"}`);
    return;
  }

  // Handle send-all
  if (sendAll) {
    console.log("\nDispatching official certificate emails to all graduands with registered emails...");
    let sentCount = 0;
    let skipCount = 0;

    for (const g of VERIFIED_GRADUANDS) {
      if (!g.email) {
        console.log(`Skipping ${g.fullName}: No email on file.`);
        skipCount++;
        continue;
      }

      console.log(`Sending to ${g.fullName} <${g.email}>...`);
      const pngPath = path.join(process.cwd(), "public", "certificates", "cohort-1", "canonical", `${g.slug}.png`);
      const certBuffer = fs.existsSync(pngPath) ? fs.readFileSync(pngPath) : undefined;
      const portalUrl = `${SITE_URL}/events/graduation-cohort-1/certificate?token=${g.accessToken}`;

      const sent = await sendGraduationCertificateEmail({
        to: g.email,
        name: g.fullName,
        credentialId: g.credentialId,
        ticketNumber: g.ticketNumber,
        certificatePortalUrl: portalUrl,
        pod: g.pod,
        capstoneTitle: g.capstoneTitle,
        certBuffer,
      });

      if (sent) {
        sentCount++;
        console.log(`  -> Delivered successfully to ${g.email}`);
      } else {
        console.log(`  -> Delivery failed for ${g.email}`);
      }
    }

    console.log("\n==========================================================");
    console.log(`DISPATCH COMPLETED: ${sentCount} sent, ${skipCount} skipped.`);
    console.log("==========================================================");
    return;
  }

  console.log("\nNo action specified. Run with --dry-run, --test-to=<email>, or --send-all.");
}

main().catch(console.error).finally(() => process.exit(0));
