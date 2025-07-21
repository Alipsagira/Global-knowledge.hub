# Global Knowledge Hub

A dynamic web application designed to serve as a comprehensive knowledge sharing and interaction platform. Users can search for information, manage profiles, participate in discussions, send private messages, and interact with an AI assistant.

## ✨ Features

* **Information Search:** Search for professional advice based on career fields (e.g., Student, Businessman, Politician, Civil Servant).
* **User Authentication:** Register and log in using email and password.
* **User Profiles:** Save and manage personal details and career preferences to receive personalized advice.
* **Discussion Forum:** Post new discussions, view existing posts, comment on posts, and like discussions.
* **Private Messaging:** Send and receive private messages between users.
* **Interactive Dashboard:** View personal activity statistics (total posts, likes, messages sent).
* **AI Assistant:** Chat with an AI assistant for career-related guidance (simulated, ready for real AI integration).
* **Responsive Design:** Basic styling for a clean and user-friendly interface.

## 🚀 Technologies Used

* **Frontend:**
    * HTML5
    * CSS3
    * JavaScript (Vanilla JS)
* **Backend:**
    * **Appwrite:** Used for database management, user authentication, and likely for handling forum posts, messages, and chat history.

## ⚙️ Setup and Installation

Follow these steps to get your Global Knowledge Hub up and running.

### 1. Clone the Repository

First, clone this repository to your local machine:

bash
git clone <your-repository-url>
cd global-knowledge-hub


### 2\. Backend Setup (Appwrite)

This project relies on Appwrite for its backend services.

#### If you're using Appwrite Cloud:

1.  **Sign Up/Log In:** Go to [Appwrite Cloud](https://cloud.appwrite.io/) and create an account or log in.

2.  **Create a New Project:**

      * In the Appwrite Console, click "Create project".
      * **Name:** `Global Knowledge Hub`
      * **Project ID:** `global-knowledge-hub` (or a similar unique ID like `your-name-knowledge-hub`)

3.  **Get Project ID and Endpoint:** Once your project is created, navigate to **Settings** in your Appwrite console. Copy your **Project ID** and **API Endpoint** (e.g., `https://cloud.appwrite.io/v1`).

4.  **Create Databases and Collections:**
    You will need to create the following Databases and Collections within your Appwrite project:

      * **Database:**

          * **Name:** `Global Knowledge Hub DB`
          * **Database ID:** `global-knowledge-hub-db` (or a similar unique ID)

      * **Collections within `Global Knowledge Hub DB`:**

          * **`articles` (for search content - although currently hardcoded in JS):**

              * **Collection ID:** `articles`
              * **Attributes:**
                  * `title` (String, Size: 255, Required)
                  * `content` (String, Size: 65535+, Required)
                  * `isPublished` (Boolean, Required, Default: false)
                    *(Note: The search functionality in the provided JS is currently static. You would typically fetch articles from this collection.)*

          * **`users` (for user profiles, beyond Appwrite's built-in User object):**

              * **Collection ID:** `users`
              * **Attributes:**
                  * `userId` (String, Size: 36, Required - will store Appwrite's `$id` for the user)
                  * `name` (String, Size: 255, Required)
                  * `careerField` (String, Size: 255, Required)

          * **`forum_posts`:**

              * **Collection ID:** `forum_posts`
              * **Attributes:**
                  * `title` (String, Size: 255, Required)
                  * `content` (String, Size: 65535+, Required)
                  * `authorId` (String, Size: 36, Required - will store the ID of the user who posted)
                  * `authorEmail` (String, Size: 255, Required)
                  * `comments` (JSON, Required - will store an array of comment objects)
                  * `likes` (Integer, Required, Default: 0)
                  * `createdAt` (Datetime, Required)

          * **`messages`:**

              * **Collection ID:** `messages`
              * **Attributes:**
                  * `senderId` (String, Size: 36, Required)
                  * `senderEmail` (String, Size: 255, Required)
                  * `recipientEmail` (String, Size: 255, Required)
                  * `content` (String, Size: 65535+, Required)
                  * `timestamp` (Datetime, Required)

          * **`chat_history`:**

              * **Collection ID:** `chat_history`
              * **Attributes:**
                  * `userId` (String, Size: 36, Required)
                  * `userMessage` (String, Size: 65535+, Required)
                  * `aiResponse` (String, Size: 65535+, Required)
                  * `timestamp` (Datetime, Required)

    **Important for Collections:** After creating each collection, go to its **Permissions** tab and set appropriate read/write permissions for "users" (e.g., "Any" or specific roles for read, "Users" role for create/update/delete, depending on your desired access control). For `forum_posts`, `messages`, and `chat_history`, ensure logged-in users can create documents. For `articles`, you might only allow admin read access.

#### If you're self-hosting Appwrite:

1.  Follow the [Appwrite self-hosting documentation](https://appwrite.io/docs/installation) to install Appwrite (typically using Docker).
2.  Once installed, access your Appwrite console and follow the same steps as above for "Appwrite Cloud" to create your project, database, and collections.

### 3\. Frontend Configuration

Open `script.js` in your text editor and update the Appwrite client configuration and collection IDs:

javascript
// --- Appwrite Initialization (PLACE YOUR APPWRITE CONFIG HERE) ---
const client = new Appwrite.Client();
const databases = new Appwrite.Databases(client);
const account = new Appwrite.Account(client);
const storage = new Appwrite.Storage(client);
const functions = new Appwrite.Functions(client);

client
    .setEndpoint('YOUR_APPWRITE_ENDPOINT') // e.g., '[https://cloud.appwrite.io/v1](https://cloud.appwrite.io/v1)' or 'http://localhost/v1' if self-hosting
    .setProject('YOUR_PROJECT_ID'); // e.g., 'global-knowledge-hub'

// --- Global Appwrite IDs (Update these with your Appwrite IDs) ---
const DATABASE_ID = 'YOUR_DATABASE_ID'; // e.g., 'global-knowledge-hub-db'
const ARTICLES_COLLECTION_ID = 'articles';
const USERS_COLLECTION_ID = 'users';
const FORUM_POSTS_COLLECTION_ID = 'forum_posts';
const MESSAGES_COLLECTION_ID = 'messages';
const CHAT_HISTORY_COLLECTION_ID = 'chat_history';


**Make sure to replace `YOUR_PROJECT_ID`, `YOUR_APPWRITE_ENDPOINT`, and `YOUR_DATABASE_ID` with the actual values from your Appwrite console.** Also, ensure the collection IDs match what you named them in Appwrite.

### 4\. Include Appwrite SDK

Ensure your `index.html` includes the Appwrite SDK script. It should look like this (usually placed before your `script.js` tag, often at the end of `<body>`):

html
<script src="[https://unpkg.com/appwrite@latest/dist/appwrite.js](https://unpkg.com/appwrite@latest/dist/appwrite.js)"></script>
<script src="script.js"></script>


### 5\. Run the Application

You can open `index.html` directly in your web browser. For a better development experience, you might use a simple local web server (like Live Server extension for VS Code or `npx http-server`).

## 🚀 Usage

1.  **Register/Login:** Use the "Register" and "Login" forms to create and manage user accounts.
2.  **Search:** Type a profession (e.g., "student", "businessman", "politician", "civil servant") into the search box and click "Search" to get advice.
3.  **Profile:** Log in, then fill out your name and select your profession to save your profile. Personalized advice will be displayed.
4.  **Forum:** Create new discussion posts with a title and content. View existing posts, add comments, and like posts.
5.  **Messaging:** Send private messages to other users by entering their email (note: this requires the recipient to be a registered user). Check your inbox for messages.
6.  **Dashboard:** See a summary of your activity (posts, likes, messages).
7.  **AI Assistant:** Type questions into the chat box to get simulated AI responses.

## 📁 File Structure


.
├── index.html          # Main HTML structure of the application
├── style.css           # All CSS styles for the application
└── script.js           # All JavaScript for dynamic functionality and Appwrite integration
├── README.md           # This file


## ⚠️ Important Notes

* **Firebase Legacy Code:** The provided JavaScript was adapted from Firebase examples. All Firebase-specific code has been replaced with Appwrite SDK calls, but ensure you have correctly configured your Appwrite Project ID, Endpoint, Database ID, and Collection IDs.
  * **Security & Permissions:** In a production Appwrite application, carefully configure your Collection **Permissions** to ensure data security and user access control.
  * **AI Simulation:** The AI assistant is currently a client-side simulation. For a real AI, you would integrate a service like Google Gemini, OpenAI, etc., using Appwrite Functions (serverless functions) to protect your API keys.
  * **User Management:** The current user profile saving assumes a separate `users` collection. Appwrite also has rich built-in user management, and you might extend that directly rather than using a separate collection for basic profiles.
  * **Comments/Replies:** The current comment and reply system stores them as nested arrays within the `forum_posts` document. For very large-scale applications with deep nesting or many comments, it's often more performant to create a separate `comments` collection with relationships to `forum_posts` documents.

## 🤝 Contributing

Contributions are welcome\! If you have suggestions or improvements, please open an issue or submit a pull request.

## 📄 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).

