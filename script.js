// --- Appwrite Initialization (PLACE YOUR APPWRITE CONFIG HERE) ---
// You will need to replace YOUR_PROJECT_ID and YOUR_APP_API_KEY
// Refer to Appwrite console -> Settings to get these.
// import { Client, Databases, Account, Storage, Functions } from 'appwrite'; // If using npm/ESM
// For direct <script> include (like in your HTML):
const client = new Appwrite.Client();
const databases = new Appwrite.Databases(client);
const account = new Appwrite.Account(client);
const storage = new Appwrite.Storage(client);
const functions = new Appwrite.Functions(client);

client
    .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite Endpoint (e.g., your self-hosted URL or Appwrite Cloud)
    .setProject('YOUR_PROJECT_ID'); // Your project ID

// --- Global Appwrite IDs (Update these with your Appwrite IDs) ---
const DATABASE_ID = 'YOUR_DATABASE_ID'; // e.g., 'global-knowledge-hub-db'
const ARTICLES_COLLECTION_ID = 'YOUR_ARTICLES_COLLECTION_ID'; // e.g., 'articles'
const FORUM_POSTS_COLLECTION_ID = 'YOUR_FORUM_POSTS_COLLECTION_ID'; // You'll need to create this in Appwrite
const MESSAGES_COLLECTION_ID = 'YOUR_MESSAGES_COLLECTION_ID'; // You'll need to create this in Appwrite
const CHAT_HISTORY_COLLECTION_ID = 'YOUR_CHAT_HISTORY_COLLECTION_ID'; // You'll need to create this in Appwrite
const USERS_COLLECTION_ID = 'YOUR_USERS_COLLECTION_ID'; // If you store custom user profiles beyond Appwrite's built-in User object

// --- Helper Functions to get Appwrite ID for new documents ---
// In a real Appwrite app, you'd use ID.unique() or ID.custom().
// For simplicity in this local code, we'll use a placeholder or Date.now()
// When you integrate with Appwrite, you'll use Appwrite's ID.unique()
const { ID } = Appwrite; // Destructure ID from the Appwrite SDK

// --- General Utility for Displaying Messages ---
function displayMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerText = message;
        element.style.color = isError ? 'red' : 'green';
    }
}

// --- Search Functionality (Static, will integrate with Appwrite later) ---
function searchField() {
    let searchInput = document.getElementById("searchInput").value.toLowerCase();
    let outputDiv = document.getElementById("output");
    let content = "";

    switch (searchInput) {
        case "student":
            content = `
                <h3>Student Advice</h3>
                <p>Focus on learning coding, networking, and continuous learning.</p>
                <ul>
                    <li>Join online coding platforms like Codecademy or FreeCodeCamp.</li>
                    <li>Engage in tech communities on GitHub or LinkedIn.</li>
                    <li>Start personal projects to build experience.</li>
                </ul>
            `;
            break;
        case "businessman":
            content = `
                <h3>Business Strategies</h3>
                <p>Develop strong branding, understand marketing, and manage finances wisely.</p>
                <ul>
                    <li>Create a business plan and define your target audience.</li>
                    <li>Use digital marketing tools to grow your brand.</li>
                    <li>Network with professionals and mentors.</li>
                </ul>
            `;
            break;
        case "politician":
            content = `
                <h3>Political Leadership</h3>
                <p>Stay informed, engage with the public, and develop leadership skills.</p>
                <ul>
                    <li>Follow global and national political trends.</li>
                    <li>Engage in constructive debates and discussions.</li>
                    <li>Build policies that support community development.</li>
                </ul>
            `;
            break;
        case "civil servant":
            content = `
                <h3>Civil Service Excellence</h3>
                <p>Be efficient, ethical, and committed to public service improvements.</p>
                <ul>
                    <li>Understand government policies and compliance.</li>
                    <li>Develop strong communication and leadership skills.</li>
                    <li>Advocate for impactful public programs.</li>
                </ul>
            `;
            break;
        default:
            content = `<h3>No results found.</h3><p>Try searching for another profession.</p>`;
    }

    outputDiv.innerHTML = content;
    outputDiv.style.display = "block";
}

// --- User Registration & Login (Appwrite Authentication) ---
async function registerUser() {
    let email = document.getElementById("registerEmail").value;
    let password = document.getElementById("registerPassword").value;

    try {
        await account.create(ID.unique(), email, password);
        displayMessage("registerMessage", "Registration successful! Please log in.", false);
    } catch (error) {
        displayMessage("registerMessage", error.message, true);
    }
}

async function loginUser() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    try {
        await account.createEmailPasswordSession(email, password);
        const user = await account.get();
        displayMessage("loginMessage", `Welcome, ${user.email}!`, false);
        document.getElementById("userGreeting").innerText = user.email;
        document.getElementById("welcome").style.display = "block";
        // Optionally save user profile here if you have a custom users collection
        loadUserProfile(); // Load profile data if logged in
        loadDashboard(); // Load dashboard stats
    } catch (error) {
        displayMessage("loginMessage", error.message, true);
    }
}

async function logoutUser() {
    try {
        await account.deleteSession('current');
        displayMessage("loginMessage", "You have logged out.", false);
        document.getElementById("userGreeting").innerText = '';
        document.getElementById("welcome").style.display = "none";
        // Clear local storage items that are tied to the user session if any
        localStorage.removeItem("userName");
        localStorage.removeItem("careerField");
        // Reload page or update UI to reflect logged out state
        window.location.reload();
    } catch (error) {
        displayMessage("loginMessage", error.message, true);
    }
}

// --- Profile Preferences (Appwrite Database Integration) ---
async function saveProfile() {
    let name = document.getElementById("profileName").value;
    let career = document.getElementById("careerField").value;

    if (!name) {
        displayMessage("profileMessage", "Please enter your name.", true);
        return;
    }

    try {
        const user = await account.get(); // Get current logged-in user
        if (user) {
            // Check if user's profile already exists in a 'user_profiles' collection
            // Or use Appwrite's Users service to update user preferences directly if schema supports
            // For simplicity, we'll store it in a 'user_profiles' collection
            const userProfileData = {
                userId: user.$id,
                name: name,
                careerField: career
            };

            // This assumes you have a 'user_profiles' collection in Appwrite
            // You'd typically query first to see if a document for this user already exists
            // For demonstration, we'll try to create or update.
            // In a real app, you'd manage document IDs carefully (e.g., use user.$id as document ID)

            try {
                 await databases.createDocument(
                    DATABASE_ID,
                    USERS_COLLECTION_ID, // Assume you have a collection named 'users' or 'user_profiles'
                    user.$id, // Use user ID as document ID for easier retrieval
                    userProfileData
                );
                displayMessage("profileMessage", "Profile updated successfully!", false);
            } catch (error) {
                 // If document already exists, update it
                 if (error.code === 409) { // 409 Conflict - document with ID already exists
                      await databases.updateDocument(
                        DATABASE_ID,
                        USERS_COLLECTION_ID,
                        user.$id,
                        userProfileData
                    );
                    displayMessage("profileMessage", "Profile updated successfully!", false);
                 } else {
                    throw error; // Re-throw other errors
                 }
            }
            displayCareerAdvice(career);
        } else {
            displayMessage("profileMessage", "Please log in to save your profile.", true);
        }
    } catch (error) {
        displayMessage("profileMessage", error.message, true);
    }
}

async function loadUserProfile() {
    try {
        const user = await account.get();
        if (user) {
            const response = await databases.getDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                user.$id
            );
            document.getElementById("profileName").value = response.name;
            document.getElementById("careerField").value = response.careerField;
            displayCareerAdvice(response.careerField);
        }
    } catch (error) {
        console.error("Error loading user profile:", error);
        // Likely no profile yet, so just display default advice
        displayCareerAdvice("");
    }
}


function displayCareerAdvice(career) {
    let adviceText = "";

    switch (career) {
        case "student":
            adviceText = "As a student, focus on learning, networking, and gaining practical experience.";
            break;
        case "business":
            adviceText = "Business success requires branding, strategic networking, and financial management.";
            break;
        case "politician":
            adviceText = "Effective politicians engage with the public, develop policies, and lead with vision.";
            break;
        case "civilServant":
            adviceText = "Civil servants contribute to public service efficiency and uphold ethical standards.";
            break;
        default:
            adviceText = "Choose your profession to receive personalized guidance.";
    }

    document.getElementById("adviceText").innerText = adviceText;
    document.getElementById("personalizedAdvice").style.display = "block";
}

// --- Discussion Forum System (Appwrite Database Integration) ---
async function postDiscussion() {
    let title = document.getElementById("postTitle").value;
    let content = document.getElementById("postContent").value;

    if (!title || !content) {
        displayMessage("postMessage", "Please enter a title and content.", true);
        return;
    }

    try {
        const user = await account.get(); // Get current logged-in user
        await databases.createDocument(
            DATABASE_ID,
            FORUM_POSTS_COLLECTION_ID,
            ID.unique(),
            {
                title: title,
                content: content,
                authorId: user.$id, // Store author's ID
                authorEmail: user.email, // Store author's email for display
                comments: [], // Initialize with empty array
                likes: 0,
                createdAt: new Date().toISOString()
            }
        );
        displayMessage("postMessage", "Discussion posted!", false);
        document.getElementById("postTitle").value = '';
        document.getElementById("postContent").value = '';
        displayPosts(); // Refresh posts
    } catch (error) {
        displayMessage("postMessage", error.message, true);
    }
}

async function displayPosts() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            FORUM_POSTS_COLLECTION_ID,
            [
                Appwrite.Query.orderDesc('$createdAt') // Order by creation time, newest first
            ]
        );
        const posts = response.documents;
        let postsList = document.getElementById("postsList");
        postsList.innerHTML = "";

        posts.forEach((post) => {
            let postDiv = document.createElement("div");
            postDiv.classList.add("post");
            // Note: The comments and likes system here will become more complex with Appwrite,
            // potentially requiring separate collections for comments or more advanced queries.
            // For now, it's simplified.
            postDiv.innerHTML = `<h3>${post.title}</h3><p>By ${post.authorEmail} on ${new Date(post.createdAt).toLocaleDateString()}</p><p>${post.content}</p>
                                 <p>👍 ${post.likes} Likes <button onclick="likePost('${post.$id}')">Like</button></p>
                                 <div class="comment-box">
                                    <textarea id="commentInput${post.$id}" placeholder="Write a comment..."></textarea>
                                    <button onclick="addComment('${post.$id}')">Comment</button>
                                    <div id="commentsList${post.$id}"></div>
                                 </div>`;
            postsList.appendChild(postDiv);
            displayComments(post.$id); // Display comments for each post
        });
    } catch (error) {
        console.error("Error displaying posts:", error);
        document.getElementById("postsList").innerHTML = `<p>Error loading discussions: ${error.message}</p>`;
    }
}

async function addComment(postId) {
    let commentText = document.getElementById(`commentInput${postId}`).value;
    if (!commentText) return;

    try {
        const user = await account.get();
        // Assuming comments are stored directly within the post document as an array of objects
        // This is okay for simple cases, but for scalable comments, a separate 'comments' collection
        // with a relationship to 'posts' would be better.
        const post = await databases.getDocument(DATABASE_ID, FORUM_POSTS_COLLECTION_ID, postId);
        let comments = post.comments || [];
        comments.push({ text: commentText, authorId: user.$id, authorEmail: user.email, createdAt: new Date().toISOString() });

        await databases.updateDocument(
            DATABASE_ID,
            FORUM_POSTS_COLLECTION_ID,
            postId,
            { comments: comments }
        );
        document.getElementById(`commentInput${postId}`).value = '';
        displayComments(postId); // Refresh comments for this post
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}

async function displayComments(postId) {
    try {
        const post = await databases.getDocument(DATABASE_ID, FORUM_POSTS_COLLECTION_ID, postId);
        let comments = post.comments || [];
        let commentsList = document.getElementById(`commentsList${postId}`);
        commentsList.innerHTML = "";

        comments.forEach((comment) => {
            let commentDiv = document.createElement("div");
            commentDiv.classList.add("comment-box"); // Reusing class, maybe rename for clarity
            commentDiv.innerHTML = `<p><strong>${comment.authorEmail}:</strong> ${comment.text}</p>`;
            commentsList.appendChild(commentDiv);
        });
    } catch (error) {
        console.error("Error displaying comments:", error);
    }
}


async function likePost(postId) {
    try {
        const post = await databases.getDocument(DATABASE_ID, FORUM_POSTS_COLLECTION_ID, postId);
        const currentLikes = post.likes || 0;
        await databases.updateDocument(
            DATABASE_ID,
            FORUM_POSTS_COLLECTION_ID,
            postId,
            { likes: currentLikes + 1 }
        );
        displayPosts(); // Refresh all posts to show updated like count
    } catch (error) {
        console.error("Error liking post:", error);
    }
}

// --- Private Messaging System (Appwrite Database Integration) ---
async function sendMessage() {
    let recipientEmail = document.getElementById("recipient").value;
    let messageContent = document.getElementById("messageContent").value;

    if (!recipientEmail || !messageContent) {
        displayMessage("messageStatus", "Please enter recipient and message.", true);
        return;
    }

    try {
        const currentUser = await account.get();
        // For a real messaging system, you'd verify recipient exists and get their ID
        // For simplicity, we'll just store the message directly
        await databases.createDocument(
            DATABASE_ID,
            MESSAGES_COLLECTION_ID, // You'll need to create this collection
            ID.unique(),
            {
                senderId: currentUser.$id,
                senderEmail: currentUser.email,
                recipientEmail: recipientEmail,
                content: messageContent,
                timestamp: new Date().toISOString()
            }
        );
        displayMessage("messageStatus", "Message sent!", false);
        document.getElementById("recipient").value = '';
        document.getElementById("messageContent").value = '';
        displayInbox();
    } catch (error) {
        displayMessage("messageStatus", error.message, true);
    }
}

async function displayInbox() {
    try {
        const currentUser = await account.get();
        const response = await databases.listDocuments(
            DATABASE_ID,
            MESSAGES_COLLECTION_ID,
            [
                Appwrite.Query.equal('recipientEmail', currentUser.email), // Filter messages for current user
                Appwrite.Query.orderDesc('timestamp')
            ]
        );
        const messages = response.documents;
        let messagesList = document.getElementById("messagesList");
        messagesList.innerHTML = "";

        messages.forEach((msg) => {
            let messageDiv = document.createElement("div");
            messageDiv.classList.add("message-box"); // Reusing this class
            messageDiv.innerHTML = `<p><strong>From:</strong> ${msg.senderEmail}</p><p>${msg.content}</p><small>${new Date(msg.timestamp).toLocaleString()}</small>`;
            messagesList.appendChild(messageDiv);
        });
    } catch (error) {
        console.error("Error displaying inbox:", error);
        document.getElementById("messagesList").innerHTML = `<p>Error loading messages: ${error.message}</p>`;
    }
}


// --- AI Chatbot Integration (Simulated AI Response, Appwrite Database for History) ---
async function sendMessageAI() { // Renamed to avoid conflict with private message send
    let userMessage = document.getElementById("userMessage").value;
    if (!userMessage) return;

    document.getElementById("chatHistory").innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;
    document.getElementById("userMessage").value = ''; // Clear input

    let userProfile = {};
    try {
        const user = await account.get();
        const profileResponse = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            user.$id
        );
        userProfile = profileResponse;
    } catch (error) {
        console.warn("Could not load user profile for AI. Using generic response.");
    }

    // Simulated AI Response (Replace with actual API call to a real AI service if desired)
    let aiResponse = getAIResponseSimulated(userMessage, userProfile);
    document.getElementById("chatHistory").innerHTML += `<p><strong>AI:</strong> ${aiResponse}</p>`;

    // Store Chat in Appwrite Database
    try {
        const currentUser = await account.get();
        await databases.createDocument(
            DATABASE_ID,
            CHAT_HISTORY_COLLECTION_ID, // You'll need to create this collection
            ID.unique(),
            {
                userId: currentUser.$id,
                userMessage: userMessage,
                aiResponse: aiResponse,
                timestamp: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error("Error storing chat history:", error);
    }
}

// Simulated AI Response Function (Replace with actual API call)
function getAIResponseSimulated(message, userProfile) {
    let responses = {
        "student": [
            "Focus on building projects to showcase your skills.",
            "Networking with professionals can unlock great opportunities.",
            "Consider internships for hands-on experience."
        ],
        "business": [
            "Branding and digital presence are essential for business growth.",
            "Understanding financial management leads to long-term success.",
            "A strong marketing strategy can boost customer engagement."
        ],
        "politician": [
            "Connecting with people and building trust is key in leadership.",
            "Stay informed about policy changes and community needs.",
            "Strategic communication improves public engagement."
        ],
        "civil servant": [
            "Efficiency and ethical standards drive impactful public service.",
            "Continuous learning helps you adapt to policy reforms.",
            "Engage in programs that create sustainable change."
        ]
    };

    let category = userProfile?.careerField?.toLowerCase() || message.toLowerCase(); // Use profile or message
    let responseOptions = responses[category] || ["I’m here to assist you! Ask me anything about your career."];

    return responseOptions[Math.floor(Math.random() * responseOptions.length)];
}

async function loadChatHistory() {
    try {
        const currentUser = await account.get();
        const response = await databases.listDocuments(
            DATABASE_ID,
            CHAT_HISTORY_COLLECTION_ID,
            [
                Appwrite.Query.equal('userId', currentUser.$id),
                Appwrite.Query.orderAsc('timestamp'), // Order chronologically
                Appwrite.Query.limit(20) // Limit to last 20 messages for example
            ]
        );
        const chats = response.documents;
        let chatHistoryDiv = document.getElementById("chatHistory");
        chatHistoryDiv.innerHTML = "";

        chats.forEach(chat => {
            chatHistoryDiv.innerHTML += `<p><strong>You:</strong> ${chat.userMessage}</p>`;
            chatHistoryDiv.innerHTML += `<p><strong>AI:</strong> ${chat.aiResponse}</p>`;
        });
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; // Scroll to bottom
    } catch (error) {
        console.error("Error loading chat history:", error);
        document.getElementById("chatHistory").innerHTML = `<p>Error loading chat: ${error.message}</p>`;
    }
}

// --- Dashboard Stats (Appwrite Database Integration) ---
async function loadDashboard() {
    try {
        const postsResponse = await databases.listDocuments(DATABASE_ID, FORUM_POSTS_COLLECTION_ID);
        const posts = postsResponse.documents;
        let likes = 0;
        posts.forEach(post => {
            likes += post.likes || 0;
        });

        // For messages, count messages sent *by* the current user
        const currentUser = await account.get();
        const messagesResponse = await databases.listDocuments(
            DATABASE_ID,
            MESSAGES_COLLECTION_ID,
            [
                Appwrite.Query.equal('senderId', currentUser.$id)
            ]
        );
        const messages = messagesResponse.documents;

        document.getElementById("postCount").innerText = posts.length;
        document.getElementById("likeCount").innerText = likes;
        document.getElementById("messageCount").innerText = messages.length;
    } catch (error) {
        console.error("Error loading dashboard stats:", error);
        document.getElementById("postCount").innerText = 'Error';
        document.getElementById("likeCount").innerText = 'Error';
        document.getElementById("messageCount").innerText = 'Error';
    }
}


// --- Initial Load Functions (Combined `window.onload` logic) ---
document.addEventListener('DOMContentLoaded', async (event) => {
    // Check login status first
    try {
        const user = await account.get();
        if (user) {
            document.getElementById("userGreeting").innerText = user.email;
            document.getElementById("welcome").style.display = "block";
            await loadUserProfile(); // Load profile if logged in
        }
    } catch (error) {
        console.log("No user logged in.", error);
        // User is not logged in, ensure welcome section is hidden
        document.getElementById("welcome").style.display = "none";
    }

    displayPosts(); // Load forum posts on page load
    displayInbox(); // Load messages on page load
    loadDashboard(); // Load dashboard stats
    loadChatHistory(); // Load chat history
    // requestNotificationPermission(); // Only if using Web Push Notifications
});

// Important: Add Appwrite SDK to your HTML before your script.js
// <script src="https://unpkg.com/appwrite@latest/dist/appwrite.js"></script>
