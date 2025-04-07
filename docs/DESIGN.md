# Design Document

> Written by: Avi Kumar, Nathan Flinchum, Katun Li, and Boluwatife Adeshina for COMP 426: Modern Web Programming at UNC-Chapel Hill.

## Feature Plan
### Feature 1: Chat

**Description:** Chat for real-time conversations between giver and receiver

**User(s):** Givers and Receivers

**Purpose:** Allow people to communicate about how they are to do the swipe transfer

**Technical Notes:**
- Using Supabase Realtime [broadcast] to create multiple channels through which users can chat with each other.

### Feature 2: Posting Requests
**Description:** Feature to post in real time when you are looking for a swipe or selling one

**User(s):** Givers and receivers

**Purpose:** Let people exchange swipes

**Technical Notes:**
- Database should have “Request” and “Donation” tables
- Seller has option to ‘take down’ or ‘close’ a sale after it has been completed—this won’t be an automatic process because first the giver and receiver will have to communicate
- Requests and donations will be posted on 2 different pages, and will have a button that the user can click on to start a chat with the poster if they are interested in the transaction.
- A seller can specify the number of swipes they want to give away. Everytime one is sold it is kept track of. When all have been sold, the 

### Feature 3: Schedule Dining Hall Visits

**Description:** Givers can give time slots for when they will be near or available to swipe people in

**User(s):** Givers

**Purpose:** Gives buyers a schedule that they can rely on

**Technical Notes:**
- When a user is creating a post, they will select days and times of their availability associated with that donation/purchase. The creator of the post will be able to edit their timeslots
- On the feed showing posts, for a specific user, they will be sorted by the ones who have the best time slot overlap with the user’s post.
### Feature 4: Availability Sharing (Real Time)

**Description:** Users can opt in to share stats/details about their approximate location (selecting from a predefined list i.e. Near Lenoir, Near Chase), whether they are on campus, planned meal time(s), when they were last active, etc. – things that facilitate coordination bc 2 users would need to meet up physically to share the swipes
**User(s):** Buyer and seller

**Purpose:** Allows them to communicate if they are available to swipe (or sell)

**Technical Notes:**
- Supabase Real Time presence for tracking activity/status, Supabase for keeping track of open posts (requests/donations – receivers & givers)

### Feature 5: Notifications
**Description:** If a seller is inside a dining hall and someone posts a request for a swipe, the seller get a notification 

**User(s):** Seller

**Purpose:** Allow sellers to easily know if someone is available to buy

**Technical Notes:**
- Use a Supabase trigger to call an API that sends an email when their request is accepted.

*Feel free to add more here if needed.*

## Backend Database Schema

![01780B0B-2FCD-46E2-9043-0CD45EA639A7](https://github.com/user-attachments/assets/2254a7a3-b1ae-4135-9918-b2a4ffba1733)


## High-Fidelity Prototype

![Figma Project](https://www.figma.com/design/HYX1xtb2fF3YgGF2LiZZSx/Swipe-Share?node-id=66-1137&t=MLH0GulhKrqBVdXz-1)