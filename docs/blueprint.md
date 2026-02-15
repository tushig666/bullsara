# **App Name**: Bullsara

## Core Features:

- User Authentication: Secure user authentication using Firebase Auth for login and signup.
- Lottery Listing & Display: Display active lotteries in a grid format on the home page, each featuring car image, model, year, and remaining tickets.
- Lottery Detail Page: Detailed view for each lottery, including a swipeable image slider, car info, and ticket purchase panel with quantity selector and total price calculation.
- Payment Prototype: Modal-based payment flow prototype using a QPay QR placeholder, allowing users to initiate ticket purchases.
- Admin Panel: Admin interface to create, edit, and manage lotteries, view orders, confirm payments, generate tickets, draw winners, and view dashboard stats.
- Ticket Generation: Cloud function to generate lottery tickets upon successful payment confirmation, storing ticket information in Firestore.
- Winner Selection: Cloud function to randomly select a winner and update the lottery document with the winning ticket and user.

## Style Guidelines:

- Primary color: Desaturated light grey (#D3D3D3) for a subtle, metallic look.
- Background color: Pure black (#000000) for a luxury dark UI.
- Accent color: Slightly lighter desaturated gray (#969696) for hover states and subtle highlights, ensuring contrast.
- Body and headline font: 'Inter', a sans-serif font known for its versatility, lending a modern, neutral appearance to both headlines and body text.
- Note: currently only Google Fonts are supported.
- Minimal, thin white icons for navigation and actions. Scale and subtle glow on hover.
- Luxury spacing with generous padding and margins for a premium feel, inspired by high-end fashion brands.
- Framer Motion for fade-in sections, image hover zoom, and smooth page transitions to enhance user experience.