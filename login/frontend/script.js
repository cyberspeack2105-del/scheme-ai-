const API = "http://127.0.0.1:8000";

async function register() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const image = document.getElementById("image").files[0];

    if (!name || !email || !password || !image) {
        alert("Please fill all fields");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("image", image);

    try {
        const response = await fetch(API + "/register", {
            method: "POST",
            body: formData // No Content-Type header needed, browser sets it for FormData
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration Successful!");
            window.location.href = "index.html";
        } else {
            alert(data.detail || "Registration failed");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong");
    }
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const formData = new FormData();
    formData.append("username", email); // OAuth2 expects 'username' (we use email as username)
    formData.append("password", password);

    try {
        const response = await fetch(API + "/login", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login Successful!");
            // Store token and user info
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "dashboard.html";
        } else {
            alert(data.detail || "Login failed");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong");
    }
}

// Dashboard logic
if (window.location.pathname.endsWith("dashboard.html")) {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        window.location.href = "index.html";
    } else {
        const user = JSON.parse(userStr);
        document.getElementById("userName").innerText = user.name;
        document.getElementById("userEmail").innerText = user.email;

        if (user.image_url) {
            // Ensure full URL if it's a relative path
            const imageUrl = user.image_url.startsWith("http") ? user.image_url : API + user.image_url;
            document.getElementById("userImage").src = imageUrl;
        }
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}
