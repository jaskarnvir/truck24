# Firebase Realtime Database Rules Implementation Guide

These rules ensure that users can only read and write their own data in the Realtime Database.

## How to Implement the Rules

1. Go to your Firebase console: https://console.firebase.google.com/
2. Select your project
3. Navigate to "Realtime Database" in the left sidebar
4. Click on the "Rules" tab
5. Copy and paste the rules from the `firebase-realtime-database-rules.json` file
6. Click "Publish"

## Rules Explanation

The rules follow this structure:

\`\`\`json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        
        // Subcollections with their own validation rules
        "expenses": { ... },
        "pay": { ... },
        "trucks": { ... },
        "maintenance": { ... }
      }
    }
  }
}
\`\`\`

### Security Features

1. **User-specific data protection**:
   - Each user can only access their own data under their user ID
   - All subcollections inherit this protection

2. **Data validation**:
   - Required fields are enforced for each data type
   - Data types are validated (numbers, strings, etc.)
   - Some basic business rules are enforced (e.g., amounts must be positive)

3. **Default deny policy**:
   - All other paths are explicitly denied access

### How These Rules Match Your CRUD Operations

The rules are designed to match the CRUD operations in your `firebase-service.ts` file:

- **Create operations** (addExpense, addPayEntry, etc.):
  - Allowed only for the authenticated user's own data
  - Data must conform to the validation rules

- **Read operations** (fetchExpenses, fetchPayEntries, etc.):
  - Allowed only for the authenticated user's own data

- **Update operations** (updateExpense, updatePayEntry, etc.):
  - Allowed only for the authenticated user's own data
  - Updated data must conform to the validation rules

- **Delete operations** (deleteExpense, deletePayEntry, etc.):
  - Allowed only for the authenticated user's own data

## Testing Your Rules

You can test your rules in the Firebase console:
1. Go to the "Rules Playground" tab in the Realtime Database section
2. Simulate different operations with different authentication states
3. Verify that the rules behave as expected
