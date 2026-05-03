# Next.js UX Polish & Enhancements

This document tracks future enhancements to the Larder & Leaf codebase focusing on User Experience, Error Handling, and Application Resiliency.

## High Priority: Error Boundaries and Loading States
Next.js provides built-in file conventions to handle network latency and errors gracefully. Implementing these will significantly improve the perceived performance and reliability of the app.

- [ ] **`src/app/loading.tsx`**: Add a global skeleton loader or loading spinner to provide immediate visual feedback while server components fetch initial data (e.g., loading the Dashboard inventory).
- [ ] **`src/app/error.tsx`**: Create a branded, user-friendly fallback UI that catches unexpected server or client errors (e.g., if Prisma loses connection).
- [ ] **`src/app/not-found.tsx`**: Add a custom 404 page for unmatched routes.
- [ ] **Feature-Specific Loading States**: Implement inline `Suspense` boundaries for slower components (like the AI meal generator or Vision API calls) so the rest of the page remains interactive while waiting.

## Medium Priority: Progressive Web App (PWA) Features
- [ ] **`manifest.json`**: Add a web app manifest to allow users to install Larder & Leaf to their home screen on mobile devices.
- [ ] **Favicon & Icons**: Generate and include proper Apple Touch Icons and varied favicon sizes.
- [ ] **Service Worker**: (Optional) Add a basic service worker for offline fallback if the connection drops.

## Low Priority: Micro-Animations & Interactivity
- [ ] Add subtle enter/exit transitions to modals (`AddItemModal`, `DeleteConfirmModal`).
- [ ] Implement skeleton loaders inside the datatable when filtering/searching.
