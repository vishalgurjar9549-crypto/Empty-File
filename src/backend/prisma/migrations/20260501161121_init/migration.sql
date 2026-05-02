-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'INITIATED', 'PENDING', 'VERIFIED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'NEEDS_CORRECTION', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('AGENT_PROPERTY_ASSIGNED', 'AGENT_PROPERTY_UNASSIGNED', 'AGENT_TENANT_ASSIGNED', 'AGENT_TENANT_UNASSIGNED', 'PROPERTY_NOTE_CREATED', 'BOOKING_CREATED', 'BOOKING_APPROVED', 'BOOKING_REJECTED', 'OWNER_ACTIVITY', 'OWNER_CONTACT_INTEREST');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PROPERTY_VIEW', 'CONTACT_UNLOCK', 'CONTACT_ACCESS', 'PLAN_VIEW', 'PLAN_PURCHASE_CLICK');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TENANT', 'OWNER', 'AGENT', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "googleId" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "emailVerifyToken" TEXT,
    "emailVerifyExpiry" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpiry" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'TENANT',
    "city" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "lastPropertyUpdateAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "landmark" TEXT NOT NULL,
    "pricePerMonth" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL,
    "idealFor" TEXT[],
    "amenities" TEXT[],
    "images" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "adminFeedback" JSONB,
    "genderPreference" TEXT NOT NULL DEFAULT 'ANY',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "lastContactedAt" TIMESTAMP(3),
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "lastPropertyUpdateAt" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "propertyId" TEXT,
    "userId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "tenantId" TEXT,
    "tenantName" TEXT NOT NULL,
    "tenantEmail" TEXT NOT NULL,
    "tenantPhone" TEXT NOT NULL,
    "moveInDate" TIMESTAMP(3) NOT NULL,
    "message" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityPricing" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CityPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hasCallSupport" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantSubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "TenantSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_limits" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "city" TEXT,
    "contactLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyView" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "utr" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "subscriptionId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assisted_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "budget" INTEGER,
    "amount" INTEGER NOT NULL DEFAULT 50000,
    "paymentId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    "source" TEXT NOT NULL DEFAULT 'ASSISTED_UI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assisted_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPropertyAssignment" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignmentNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deactivatedAt" TIMESTAMP(3),

    CONSTRAINT "AgentPropertyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentTenantAssignment" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deactivatedAt" TIMESTAMP(3),

    CONSTRAINT "AgentTenantAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyNote" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "referenceId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseBody" JSONB NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 5,
    "nextRetryAt" TIMESTAMP(3),
    "lastError" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyReviewToken" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyReviewToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportProgress" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "lastProcessedRow" INTEGER NOT NULL DEFAULT 0,
    "totalInserted" INTEGER NOT NULL DEFAULT 0,
    "totalSkipped" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerifyToken_key" ON "User"("emailVerifyToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- CreateIndex
CREATE INDEX "Room_city_idx" ON "Room"("city");

-- CreateIndex
CREATE INDEX "Room_roomType_idx" ON "Room"("roomType");

-- CreateIndex
CREATE INDEX "Room_genderPreference_idx" ON "Room"("genderPreference");

-- CreateIndex
CREATE INDEX "Room_pricePerMonth_idx" ON "Room"("pricePerMonth");

-- CreateIndex
CREATE INDEX "Room_ownerId_idx" ON "Room"("ownerId");

-- CreateIndex
CREATE INDEX "Room_reviewStatus_idx" ON "Room"("reviewStatus");

-- CreateIndex
CREATE INDEX "Room_isActive_idx" ON "Room"("isActive");

-- CreateIndex
CREATE INDEX "Room_lastContactedAt_idx" ON "Room"("lastContactedAt");

-- CreateIndex
CREATE INDEX "Room_contactCount_idx" ON "Room"("contactCount");

-- CreateIndex
CREATE INDEX "idx_room_city_created_desc" ON "Room"("city", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_room_city_price" ON "Room"("city", "pricePerMonth");

-- CreateIndex
CREATE INDEX "idx_room_ideal_for" ON "Room"("idealFor");

-- CreateIndex
CREATE INDEX "idx_event_property_type_created" ON "events"("propertyId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "idx_event_type_created" ON "events"("type", "createdAt");

-- CreateIndex
CREATE INDEX "idx_event_user_created" ON "events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_roomId_idx" ON "Booking"("roomId");

-- CreateIndex
CREATE INDEX "Booking_tenantId_idx" ON "Booking"("tenantId");

-- CreateIndex
CREATE INDEX "idx_booking_owner_status_created" ON "Booking"("ownerId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_booking_movein_status" ON "Booking"("moveInDate", "status");

-- CreateIndex
CREATE INDEX "idx_booking_status_created" ON "Booking"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_booking_active_duplicate_check" ON "Booking"("roomId", "tenantEmail", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CityPricing_city_plan_key" ON "CityPricing"("city", "plan");

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "City_isActive_idx" ON "City"("isActive");

-- CreateIndex
CREATE INDEX "City_name_idx" ON "City"("name");

-- CreateIndex
CREATE INDEX "TenantSubscription_tenantId_idx" ON "TenantSubscription"("tenantId");

-- CreateIndex
CREATE INDEX "TenantSubscription_plan_idx" ON "TenantSubscription"("plan");

-- CreateIndex
CREATE INDEX "TenantSubscription_city_idx" ON "TenantSubscription"("city");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSubscription_tenantId_city_key" ON "TenantSubscription"("tenantId", "city");

-- CreateIndex
CREATE INDEX "plan_limits_plan_idx" ON "plan_limits"("plan");

-- CreateIndex
CREATE UNIQUE INDEX "plan_limits_plan_city_key" ON "plan_limits"("plan", "city");

-- CreateIndex
CREATE INDEX "PropertyView_tenantId_idx" ON "PropertyView"("tenantId");

-- CreateIndex
CREATE INDEX "PropertyView_propertyId_idx" ON "PropertyView"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyView_tenantId_city_idx" ON "PropertyView"("tenantId", "city");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyView_tenantId_propertyId_key" ON "PropertyView"("tenantId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_subscriptionId_key" ON "Payment"("subscriptionId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_idx" ON "Payment"("tenantId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "assisted_requests_city_idx" ON "assisted_requests"("city");

-- CreateIndex
CREATE INDEX "assisted_requests_status_idx" ON "assisted_requests"("status");

-- CreateIndex
CREATE INDEX "assisted_requests_createdAt_idx" ON "assisted_requests"("createdAt");

-- CreateIndex
CREATE INDEX "assisted_requests_paymentId_idx" ON "assisted_requests"("paymentId");

-- CreateIndex
CREATE INDEX "assisted_requests_orderId_idx" ON "assisted_requests"("orderId");

-- CreateIndex
CREATE INDEX "AgentPropertyAssignment_agentId_idx" ON "AgentPropertyAssignment"("agentId");

-- CreateIndex
CREATE INDEX "AgentPropertyAssignment_propertyId_idx" ON "AgentPropertyAssignment"("propertyId");

-- CreateIndex
CREATE INDEX "AgentPropertyAssignment_assignedBy_idx" ON "AgentPropertyAssignment"("assignedBy");

-- CreateIndex
CREATE INDEX "AgentPropertyAssignment_isActive_idx" ON "AgentPropertyAssignment"("isActive");

-- CreateIndex
CREATE INDEX "AgentPropertyAssignment_createdAt_idx" ON "AgentPropertyAssignment"("createdAt");

-- CreateIndex
CREATE INDEX "AgentPropertyAssignment_agentId_isActive_idx" ON "AgentPropertyAssignment"("agentId", "isActive");

-- CreateIndex
CREATE INDEX "AgentPropertyAssignment_propertyId_isActive_idx" ON "AgentPropertyAssignment"("propertyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AgentPropertyAssignment_agentId_propertyId_key" ON "AgentPropertyAssignment"("agentId", "propertyId");

-- CreateIndex
CREATE INDEX "AgentTenantAssignment_agentId_idx" ON "AgentTenantAssignment"("agentId");

-- CreateIndex
CREATE INDEX "AgentTenantAssignment_tenantId_idx" ON "AgentTenantAssignment"("tenantId");

-- CreateIndex
CREATE INDEX "AgentTenantAssignment_assignedBy_idx" ON "AgentTenantAssignment"("assignedBy");

-- CreateIndex
CREATE INDEX "AgentTenantAssignment_isActive_idx" ON "AgentTenantAssignment"("isActive");

-- CreateIndex
CREATE INDEX "AgentTenantAssignment_createdAt_idx" ON "AgentTenantAssignment"("createdAt");

-- CreateIndex
CREATE INDEX "AgentTenantAssignment_agentId_isActive_idx" ON "AgentTenantAssignment"("agentId", "isActive");

-- CreateIndex
CREATE INDEX "AgentTenantAssignment_tenantId_isActive_idx" ON "AgentTenantAssignment"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AgentTenantAssignment_agentId_tenantId_key" ON "AgentTenantAssignment"("agentId", "tenantId");

-- CreateIndex
CREATE INDEX "PropertyNote_propertyId_idx" ON "PropertyNote"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyNote_authorId_idx" ON "PropertyNote"("authorId");

-- CreateIndex
CREATE INDEX "PropertyNote_isDeleted_idx" ON "PropertyNote"("isDeleted");

-- CreateIndex
CREATE INDEX "PropertyNote_createdAt_idx" ON "PropertyNote"("createdAt");

-- CreateIndex
CREATE INDEX "PropertyNote_propertyId_isDeleted_idx" ON "PropertyNote"("propertyId", "isDeleted");

-- CreateIndex
CREATE INDEX "PropertyNote_authorId_isDeleted_idx" ON "PropertyNote"("authorId", "isDeleted");

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_isRead_idx" ON "Notification"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_recipientId_createdAt_idx" ON "Notification"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_recipientId_type_referenceId_key" ON "Notification"("recipientId", "type", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_key_key" ON "idempotency_records"("key");

-- CreateIndex
CREATE INDEX "idempotency_records_key_userId_idx" ON "idempotency_records"("key", "userId");

-- CreateIndex
CREATE INDEX "idempotency_records_expiresAt_idx" ON "idempotency_records"("expiresAt");

-- CreateIndex
CREATE INDEX "idx_outbox_worker_poll" ON "outbox_events"("status", "nextRetryAt", "createdAt");

-- CreateIndex
CREATE INDEX "idx_outbox_aggregate_lookup" ON "outbox_events"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "idx_outbox_status" ON "outbox_events"("status");

-- CreateIndex
CREATE INDEX "idx_outbox_cleanup" ON "outbox_events"("status", "processedAt");

-- CreateIndex
CREATE INDEX "idx_outbox_created" ON "outbox_events"("createdAt");

-- CreateIndex
CREATE INDEX "phone_otps_userId_isUsed_expiresAt_idx" ON "phone_otps"("userId", "isUsed", "expiresAt");

-- CreateIndex
CREATE INDEX "phone_otps_expiresAt_idx" ON "phone_otps"("expiresAt");

-- CreateIndex
CREATE INDEX "email_otps_userId_isUsed_expiresAt_idx" ON "email_otps"("userId", "isUsed", "expiresAt");

-- CreateIndex
CREATE INDEX "email_otps_expiresAt_idx" ON "email_otps"("expiresAt");

-- CreateIndex
CREATE INDEX "email_otps_email_idx" ON "email_otps"("email");

-- CreateIndex
CREATE INDEX "idx_review_roomid" ON "Review"("roomId");

-- CreateIndex
CREATE INDEX "idx_review_userid" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "idx_review_createdat" ON "Review"("createdAt");

-- CreateIndex
CREATE INDEX "idx_review_room_rating" ON "Review"("roomId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "unique_room_user_review" ON "Review"("roomId", "userId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_roomId_idx" ON "Favorite"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_roomId_key" ON "Favorite"("userId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyReviewToken_token_key" ON "PropertyReviewToken"("token");

-- CreateIndex
CREATE INDEX "PropertyReviewToken_token_idx" ON "PropertyReviewToken"("token");

-- CreateIndex
CREATE INDEX "PropertyReviewToken_expiresAt_idx" ON "PropertyReviewToken"("expiresAt");

-- CreateIndex
CREATE INDEX "PropertyReviewToken_ownerId_idx" ON "PropertyReviewToken"("ownerId");

-- CreateIndex
CREATE INDEX "PropertyReviewToken_propertyId_expiresAt_usedAt_idx" ON "PropertyReviewToken"("propertyId", "expiresAt", "usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImportProgress_fileName_key" ON "ImportProgress"("fileName");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyView" ADD CONSTRAINT "PropertyView_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "TenantSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPropertyAssignment" ADD CONSTRAINT "AgentPropertyAssignment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPropertyAssignment" ADD CONSTRAINT "AgentPropertyAssignment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTenantAssignment" ADD CONSTRAINT "AgentTenantAssignment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTenantAssignment" ADD CONSTRAINT "AgentTenantAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyNote" ADD CONSTRAINT "PropertyNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyNote" ADD CONSTRAINT "PropertyNote_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyNote" ADD CONSTRAINT "PropertyNote_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_records" ADD CONSTRAINT "idempotency_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_otps" ADD CONSTRAINT "phone_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_otps" ADD CONSTRAINT "email_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyReviewToken" ADD CONSTRAINT "PropertyReviewToken_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyReviewToken" ADD CONSTRAINT "PropertyReviewToken_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
