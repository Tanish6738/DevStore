# Environment Setup Instructions

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devtoolkit?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Optional: External APIs
LINK_PREVIEW_API_KEY=your_api_key_here

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

## Setup Steps

### 1. MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and add it to `MONGODB_URI`
5. Replace `<username>`, `<password>`, and `<cluster>` with your actual values

### 2. Clerk Authentication Setup

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Get your publishable key and secret key from the dashboard
4. Add them to your `.env.local` file

#### Clerk Webhook Setup (for user creation)

1. In your Clerk dashboard, go to Webhooks
2. Create a new webhook endpoint: `http://localhost:3000/api/auth/webhook`
3. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the webhook secret and add it to `CLERK_WEBHOOK_SECRET`

### 3. Install Dependencies

```bash
npm install
```

### 4. Seed the Database

```bash
npm run seed
```

This will populate your database with predefined developer tools and tags.

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Verification

1. Visit http://localhost:3000/api/status to check database connection
2. Sign up/sign in to test authentication
3. Check that user is created in MongoDB after Clerk registration
4. Visit /dashboard to test protected routes
5. Visit /explore to see predefined tools

## Troubleshooting

### Database Connection Issues
- Verify MongoDB URI is correct
- Check network access (whitelist IP in MongoDB Atlas)
- Ensure database user has proper permissions

### Authentication Issues
- Verify Clerk keys are correct
- Check webhook endpoint is accessible
- Ensure webhook secret matches

### Seeding Issues
- Run `npm run seed` after database connection is established
- Check console for any error messages during seeding

## Optional Enhancements

### Link Preview API (Optional)
For better URL metadata fetching, you can use a service like:
- LinkPreview.net
- Microlink.io
- Custom scraping service

Add your API key to `LINK_PREVIEW_API_KEY` in `.env.local`
