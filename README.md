# Trucking Expense Tracker

[live website link](https://truck24.vercel.app/)

![Trucking Expense Tracker Dashboard](https://raw.githubusercontent.com/jaskarnvir/truck24/refs/heads/main/4.png) 

![Trucking Expense Tracker Dashboard](https://raw.githubusercontent.com/jaskarnvir/truck24/refs/heads/main/2.png) 

![Trucking Expense Tracker Dashboard](https://raw.githubusercontent.com/jaskarnvir/truck24/refs/heads/main/3.png) 

![Trucking Expense Tracker Dashboard](https://raw.githubusercontent.com/jaskarnvir/truck24/refs/heads/main/1.png) 



A comprehensive web application designed to help truck drivers and owner-operators manage their trucking-related finances and vehicle maintenance with ease.

## Purpose

The Trucking Expense Tracker provides a centralized platform to track income, and expenses, manage your fleet of trucks, and keep a detailed log of all maintenance activities. This application aims to simplify the bookkeeping process for trucking professionals, offering clear insights into their business's financial health and ensuring vehicles are well-maintained.

## Features

The application is built with a user-friendly interface and is packed with features to streamline your trucking management needs:

*   **Secure Authentication:** User registration and login system powered by Firebase Authentication.
*   **Responsive Dashboard:** A central hub to get a quick overview and navigate through the app's features, fully responsive for desktop and mobile use.
*   **Expense Tracking:**
    *   Record and categorize all your business expenses (e.g., fuel, insurance, tolls).
    *   Add detailed descriptions and assign expenses to specific trucks.
    *   Easily edit and delete expense entries.
*   **Income Management:**
    *   Track your pay and income from different clients.
    *   Record pay periods, amounts, and any relevant notes.
*   **Fleet Management:**
    *   Maintain a digital record of all the trucks in your fleet.
    *   Store essential details like make, model, year, VIN, and license plate.
*   **Maintenance Log:**
    *   Keep a comprehensive history of all maintenance and repairs for each truck.
    *   Log details such as service type, mileage, cost, and a description of the work performed.
*   **Advanced Reporting:**
    *   **Data Export:** Export your financial and maintenance data to CSV or printable PDF format within a selected date range.
    *   **Tax Reports:** Generate tax-ready reports with monthly, quarterly, or annual summaries of your income and expenses, broken down by category.
*   **Modern UI/UX:**
    *   Sleek and intuitive interface built with **shadcn/ui**.
    *   Smooth page transitions and animations using **Framer Motion**.
    *   Dark and light mode support, respecting system preferences.

## Technology Stack

This application is built with a modern and robust set of technologies:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore and Authentication)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **State Management:** [React Context API](https://reactjs.org/docs/context.html)
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Tables:** [TanStack Table](https://tanstack.com/table/v8)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need to have the following installed on your machine:

*   [Node.js](https://nodejs.org/en/) (v18 or newer)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/trucking-expense-tracker.git
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd trucking-expense-tracker
    ```

3.  **Install dependencies:**
    ```sh
    npm install
    ```

4.  **Set up Firebase:**
    *   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    *   In your new project, go to **Build > Authentication** and enable the **Email/Password** sign-in method.
    *   Go to **Build > Firestore Database** and create a new database. Start in **test mode** for easy setup (you can change the security rules later).
    *   Go to your Project Settings (click the gear icon) and in the "General" tab, find the "Your apps" section.
    *   Click the web icon (`</>`) to register a new web app.
    *   After registering, Firebase will provide you with a `firebaseConfig` object. Copy these keys.

5.  **Create an environment file:**
    *   In the root of your project, create a file named `.env.local`.
    *   Add your Firebase configuration keys to this file:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
        NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
        ```

### Running the Application

Once the setup is complete, you can run the development server:

```sh
npm run dev

