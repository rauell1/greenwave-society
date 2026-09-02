CREATE TABLE "career_roles" (
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "is_open" BOOLEAN NOT NULL DEFAULT true,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "career_roles_pkey" PRIMARY KEY ("slug")
);

CREATE TABLE "career_applications" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "role_slug" TEXT NOT NULL,
  "role_title" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "availability" TEXT NOT NULL,
  "motivation" TEXT NOT NULL,
  "relevant_experience" TEXT NOT NULL,
  "collaboration_style" TEXT NOT NULL,
  "role_response" TEXT NOT NULL,
  "portfolio_url" TEXT,
  "candidate_email_subject" TEXT NOT NULL,
  "candidate_email_body" TEXT NOT NULL,
  "team_email_subject" TEXT NOT NULL,
  "team_email_body" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'new',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "career_applications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "career_applications_reference_key" ON "career_applications"("reference");
CREATE INDEX "career_applications_role_slug_created_at_idx" ON "career_applications"("role_slug", "created_at");
CREATE INDEX "career_applications_email_idx" ON "career_applications"("email");

INSERT INTO "career_roles" ("slug", "title", "is_open", "updated_at") VALUES
  ('external-communications-lead', 'External Communications Lead', true, CURRENT_TIMESTAMP),
  ('internal-communications-assistant', 'Internal Communications Assistant', true, CURRENT_TIMESTAMP),
  ('partnerships-lead', 'Partnerships Lead', true, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
