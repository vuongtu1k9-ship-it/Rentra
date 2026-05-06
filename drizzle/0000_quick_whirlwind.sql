CREATE TABLE "Activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"action" text,
	"message" text,
	"context" text,
	"requestId" text,
	"startDate" timestamp with time zone,
	"endDate" timestamp with time zone,
	"level" text,
	"metadata" jsonb,
	"limitValue" integer,
	"skip" integer,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Cart" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer DEFAULT 1,
	"addAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "File" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"filename" text NOT NULL,
	"mimetype" varchar(100),
	"size" bigint,
	"path" text,
	"status" varchar(50) DEFAULT 'pending',
	"addAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Order" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"cart" jsonb NOT NULL,
	"shippingInfo" jsonb,
	"shippingFee" integer DEFAULT 0,
	"total" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'pending',
	"paid" boolean DEFAULT false,
	"paidAt" timestamp with time zone,
	"addAt" timestamp with time zone DEFAULT now(),
	"editAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Product" (
	"id" serial PRIMARY KEY NOT NULL,
	"sellerId" integer NOT NULL,
	"name" text NOT NULL,
	"price" integer DEFAULT 0,
	"description" text,
	"category" varchar(150),
	"status" boolean DEFAULT true,
	"media" jsonb,
	"quantity" integer DEFAULT 0,
	"mass" integer,
	"expired" date,
	"lwh" jsonb,
	"latitude" real,
	"longitude" real,
	"addAt" timestamp with time zone DEFAULT now(),
	"editAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "media_limit" CHECK (jsonb_array_length(COALESCE("Product"."media", '[]'::jsonb)) <= 5)
);
--> statement-breakpoint
CREATE TABLE "Review" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"rating" integer DEFAULT 5,
	"cmt" jsonb NOT NULL,
	"addAt" timestamp with time zone DEFAULT now(),
	"editAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" text,
	"role" varchar(50) DEFAULT 'user',
	"profile" jsonb,
	"vietqrId" varchar(100),
	"addAt" timestamp with time zone DEFAULT now(),
	"editAt" timestamp with time zone DEFAULT now(),
	"lastActiveAt" timestamp with time zone,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "File" ADD CONSTRAINT "File_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_User_id_fk" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;