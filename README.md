# Smart Review Summarizer

This project is a web application that uses GenAI to summarize customer reviews and provide product improvement suggestions. It also incorporates an LSTM model to filter out potentially fake reviews, ensuring more reliable insights. It allows users to browse products and, based on their role (customer or service provider), interact with AI-generated content.

## Features

-   **Role-Based Access:** Users can choose between "Customer" and "Service Provider" roles.
-   **Product Browsing:** Displays a list of products with images and titles.
-   **AI-Powered Summarization:**
    -   Customers can generate a summary of product reviews.
-  **Fake Review Detection**
    -   Utilizes an LSTM model to identify and filter out potentially fake reviews, ensuring that only genuine feedback is sent to Gemini API.
-   **AI-Powered Suggestions:**
    -   Service providers can generate suggestions for product improvement.
-   **Dynamic Content:** The interface adapts based on the user's role.
-   **Backend:** Node.js server with Express.js for API endpoints and server-side processing.
-   **Frontend:** HTML, CSS, and JavaScript for the user interface.

## Technologies Used

-   Node.js
-   Express.js
-   Google Cloud Vertex AI API
-   HTML
-   CSS
-   JavaScript
