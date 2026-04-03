ALTER TABLE "platform_accounts"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "facebook_oauth_sessions" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pages" JSONB,
    "redirect_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),

    CONSTRAINT "facebook_oauth_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "facebook_oauth_sessions_state_key" ON "facebook_oauth_sessions"("state");
CREATE INDEX "facebook_oauth_sessions_user_id_status_idx" ON "facebook_oauth_sessions"("user_id", "status");

ALTER TABLE "facebook_oauth_sessions"
ADD CONSTRAINT "facebook_oauth_sessions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
