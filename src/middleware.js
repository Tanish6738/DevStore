import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// import { NextResponse } from 'next/server';

// const isProtectedRoute = createRouteMatcher([
//   '/dashboard(.*)',
//   '/collections(.*)',
//   '/products(.*)',
//   '/create-collection(.*)',
//   '/profile(.*)',
//   '/favorites(.*)',
//   '/invites(.*)',
//   '/blog/create(.*)',
//   '/blog/edit(.*)',
// ]);

// export default clerkMiddleware(async (auth, req) => {
//   // Handle tool to product redirects first
//   const { pathname } = req.nextUrl;
  
//   // Redirect /add-product to /products
//   if (pathname === '/add-product') {
//     const url = req.nextUrl.clone();
//     url.pathname = '/products';
//     return NextResponse.redirect(url);
//   }
  
//   // Redirect /tools/[id] to /products/[id]
//   if (pathname.startsWith('/tools/')) {
//     const productId = pathname.replace('/tools/', '');
//     const url = req.nextUrl.clone();
//     url.pathname = `/products/${productId}`;
//     return NextResponse.redirect(url);
//   }

//   // Redirect /api/tools/[id] to /api/products/[id] (for backward compatibility)
//   if (pathname.startsWith('/api/tools/')) {
//     const productId = pathname.replace('/api/tools/', '');
//     const url = req.nextUrl.clone();
//     url.pathname = `/api/products/${productId}`;
    
//     // Preserve query parameters
//     if (req.nextUrl.search) {
//       url.search = req.nextUrl.search;
//     }
    
//     return NextResponse.redirect(url);
//   }

//   // Handle protected routes
//   if (isProtectedRoute(req)) {
//     await auth.protect();
//   }
// });

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// };