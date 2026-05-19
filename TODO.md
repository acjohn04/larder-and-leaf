# Next.js UX Polish & Enhancements

This document tracks future enhancements to the Larder & Leaf codebase focusing on User Experience, Error Handling, and Application Resiliency.

## High Priority: Error Boundaries and Loading States

Next.js provides built-in file conventions to handle network latency and errors gracefully. Implementing these will significantly improve the perceived performance and reliability of the app.

- [ ] **Feature-Specific Loading States**: Implement inline `Suspense` boundaries for slower components (like the AI meal generator or Vision API calls) so the rest of the page remains interactive while waiting.

## Low Priority: Micro-Animations & Interactivity

- [ ] Add subtle enter/exit transitions to modals (`AddItemModal`, `DeleteConfirmModal`).
- [ ] Implement skeleton loaders inside the datatable when filtering/searching.

## Deployment & Infrastructure

- [ ] **Non-root user exploration**: Investigate and implement a secure non-root user strategy for Docker containers (e.g., using `su-exec` or better volume permission management) to improve production security posture while maintaining SQLite write access.
