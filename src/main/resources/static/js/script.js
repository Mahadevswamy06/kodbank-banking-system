document.addEventListener('DOMContentLoaded', () => {
    // Helper to show toasts
    window.showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };

    // Ensure we point to the correct Backend port (8080) during development
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE = (isLocal && window.location.port !== '8080')
        ? 'http://localhost:8080'
        : (isLocal ? '' : 'https://kodbank-banking-system-22iq.vercel.app');

    // --- REGISTRATION LOGIC ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const usernameInput = document.getElementById('username');
        const usernameStatus = document.getElementById('username-status');
        let usernameTimeout = null;

        // Check Username Availability (Debounced)
        usernameInput.addEventListener('input', () => {
            clearTimeout(usernameTimeout);
            const username = usernameInput.value.trim();
            if (username.length < 3) {
                usernameStatus.textContent = '';
                return;
            }

            usernameStatus.textContent = 'Checking...';
            usernameTimeout = setTimeout(async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/auth/check-username?username=${username}`);
                    const available = await res.json();
                    if (available) {
                        usernameStatus.textContent = '✅ Available';
                        usernameStatus.style.color = '#4ade80';
                    } else {
                        usernameStatus.textContent = '❌ Taken';
                        usernameStatus.style.color = '#f87171';
                    }
                } catch (err) {
                    usernameStatus.textContent = '';
                }
            }, 500);
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }

            const userData = {
                username: e.target.username.value,
                fullname: e.target.fullname.value,
                email: e.target.email.value,
                password: password,
                phone: e.target.phone.value
            };

            try {
                const response = await fetch(`${API_BASE}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    showToast('Registration successful! Redirecting...');
                    setTimeout(() => window.location.href = 'login.html', 2000);
                } else {
                    const error = await response.text();
                    showToast(error, 'error');
                }
            } catch (err) {
                showToast('Connection error', 'error');
            }
        });
    }

    // --- LOGIN LOGIC ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loginData = {
                username: e.target.username.value,
                password: e.target.password.value
            };

            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token); // Fallback if cookie fails
                    showToast('Login successful! Welcome back.');
                    setTimeout(() => window.location.href = 'dashboard.html', 1500);
                } else {
                    showToast('Invalid credentials', 'error');
                }
            } catch (err) {
                showToast('Login failed', 'error');
            }
        });
    }

    // --- DASHBOARD LOGIC ---
    let currentUser = null;
    const balanceBtn = document.getElementById('check-balance-btn');
    if (balanceBtn) {
        // Auth Guard: Redirect if no token
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Load user info on start
        fetchUserInfo();

        balanceBtn.addEventListener('click', async () => {
            const loader = document.getElementById('balance-loader');
            const display = document.getElementById('balance-display');
            const amountVal = document.getElementById('amount-value');

            balanceBtn.style.display = 'none';
            loader.style.display = 'block';
            display.style.display = 'none';

            try {
                // Wait for the animation feel
                await new Promise(r => setTimeout(r, 1500));

                const response = await fetch(`${API_BASE}/api/dashboard/balance`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    loader.style.display = 'none';
                    display.style.display = 'block';

                    // Count-up animation
                    animateValue(amountVal, 0, data.balance, 2000);

                    // Trigger confetti safely
                    try {
                        triggerConfetti();
                    } catch (confettiErr) {
                        console.warn('Confetti failed to launch:', confettiErr);
                    }

                    showToast('Balance updated successfully!');
                } else if (response.status === 401) {
                    localStorage.removeItem('token');
                    throw new Error('Session expired');
                } else {
                    const errorMsg = await response.text();
                    throw new Error(errorMsg || 'Failed to fetch balance');
                }
            } catch (err) {
                console.error('Balance Error:', err);
                if (err.message === 'Session expired') {
                    showToast('Session expired. Please login again.', 'error');
                    setTimeout(() => window.location.href = 'login.html', 2000);
                } else {
                    showToast('Error: ' + err.message, 'error');
                    loader.style.display = 'none';
                    loader.style.display = 'none';
                    balanceBtn.style.display = 'inline-block';
                }
            }
        });

        // --- NEW FEATURES: TRANSFER & HISTORY ---
        const transferBtn = document.getElementById('transfer-btn');
        const transferModal = document.getElementById('transfer-modal');
        const transferForm = document.getElementById('transfer-form');
        const cancelTransfer = document.getElementById('cancel-transfer');

        const historyBtn = document.getElementById('history-btn');
        const historySection = document.getElementById('history-section');
        const closeHistory = document.getElementById('close-history');
        const historyBody = document.getElementById('history-body');

        // Toggle Transfer Modal
        transferBtn.addEventListener('click', () => {
            transferModal.style.display = 'flex';
            gsap.from(".modal-content", { duration: 0.5, scale: 0.8, opacity: 0, ease: "back.out(1.7)" });
        });

        cancelTransfer.addEventListener('click', () => {
            transferModal.style.display = 'none';
        });

        // Handle Transfer Submission
        transferForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                receiverUsername: document.getElementById('receiver-name').value,
                amount: parseFloat(document.getElementById('transfer-amount').value),
                description: document.getElementById('transfer-desc').value
            };

            try {
                const response = await fetch(`${API_BASE}/api/dashboard/transfer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showToast('Transfer completed successfully!');
                    transferModal.style.display = 'none';
                    transferForm.reset();
                    // Auto-refresh balance if displayed
                    if (document.getElementById('balance-display').style.display === 'block') {
                        balanceBtn.click();
                    }
                } else {
                    const error = await response.text();
                    showToast(error, 'error');
                }
            } catch (err) {
                showToast('Failed to complete transfer', 'error');
            }
        });

        // Handle Transaction History
        historyBtn.addEventListener('click', async () => {
            historySection.style.display = 'block';
            historyBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Loading...</td></tr>';
            gsap.from("#history-section", { duration: 0.8, y: 30, opacity: 0, ease: "power2.out" });

            try {
                const response = await fetch(`${API_BASE}/api/dashboard/history`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.length === 0) {
                        historyBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">No transactions found</td></tr>';
                    } else {
                        historyBody.innerHTML = data.map(t => `
                            <tr style="border-bottom: 1px solid var(--glass-border);">
                                <td style="padding: 12px;">${new Date(t.timestamp).toLocaleDateString()}</td>
                                <td style="padding: 12px;">
                                    ${t.type === 'DEBIT' ? `<i class="fas fa-arrow-up text-debit"></i> To: ${t.receiver}` : `<i class="fas fa-arrow-down text-credit"></i> From: ${t.sender}`}
                                </td>
                                <td style="padding: 12px; color: #94a3b8;">${t.description || '-'}</td>
                                <td style="padding: 12px;" class="${t.type === 'DEBIT' ? 'text-debit' : 'text-credit'}">
                                    ${t.type === 'DEBIT' ? '-' : '+'}₹${t.amount.toLocaleString()}
                                </td>
                            </tr>
                        `).join('');
                    }
                } else {
                    showToast('Failed to load history', 'error');
                }
            } catch (err) {
                showToast('Connection error', 'error');
            }
        });

        closeHistory.addEventListener('click', () => {
            historySection.style.display = 'none';
        });

        // --- RECEIVE / QR LOGIC ---
        const receiveBtn = document.getElementById('receive-btn');
        const receiveModal = document.getElementById('receive-modal');
        const closeReceive = document.getElementById('close-receive');
        const qrImage = document.getElementById('qr-image');
        const qrUserSpan = document.getElementById('qr-username');

        receiveBtn.addEventListener('click', () => {
            receiveModal.style.display = 'flex';
            if (window.gsap) {
                gsap.from("#receive-modal .modal-content", { duration: 0.5, scale: 0.8, opacity: 0, ease: "back.out(1.7)" });
            }
        });

        closeReceive.addEventListener('click', () => {
            receiveModal.style.display = 'none';
        });

        // --- USER INFO MODAL LOGIC ---
        const userWelcome = document.getElementById('user-welcome');
        const userInfoModal = document.getElementById('user-info-modal');
        const closeInfo = document.getElementById('close-info');

        userWelcome.addEventListener('click', () => {
            if (!currentUser) {
                showToast('Failed to load user details', 'error');
                return;
            }

            document.getElementById('info-fullname').textContent = currentUser.fullname || 'Not Provided';
            document.getElementById('info-username').textContent = currentUser.username;
            document.getElementById('info-email').textContent = currentUser.email;
            document.getElementById('info-phone').textContent = currentUser.phone || 'Not Provided';

            userInfoModal.style.display = 'flex';
            if (window.gsap) {
                gsap.from("#user-info-modal .modal-content", { duration: 0.5, scale: 0.8, opacity: 0, ease: "back.out(1.7)" });
            }
        });

        closeInfo.addEventListener('click', () => {
            userInfoModal.style.display = 'none';
        });

        // Sidebar Navigation Links
        const sidebarProfileBtn = document.getElementById('sidebar-profile-btn');
        if (sidebarProfileBtn) {
            sidebarProfileBtn.addEventListener('click', () => {
                userWelcome.click();
            });
        }

        const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
        if (sidebarLogoutBtn) {
            sidebarLogoutBtn.addEventListener('click', () => {
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) logoutBtn.click();
            });
        }

        // --- ADDITIONAL PAYMENT APP BUTTONS ---
        const comingSoonButtons = [
            'bank-transfer-btn',
            'self-transfer-btn'
        ];

        comingSoonButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    showToast('This payment feature is coming soon!', 'info');
                });
            }
        });

        const serviceItems = document.querySelectorAll('.service-item');
        serviceItems.forEach(item => {
            item.addEventListener('click', () => {
                const label = item.querySelector('.service-label').textContent;
                showToast(`${label} service will be available soon!`, 'info');
            });
        });
    }

    async function fetchUserInfo() {
        const usernameSpan = document.getElementById('display-username');
        if (!usernameSpan) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE}/api/dashboard/userinfo`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const user = await response.json();
                currentUser = user; // Store globally for profile modal
                usernameSpan.textContent = user.username;
            } else if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        } catch (err) {
            console.error('Failed to fetch user info:', err);
        }
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString('en-IN');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function triggerConfetti() {
        if (typeof confetti === 'undefined') {
            console.warn('Confetti library not loaded');
            return;
        }

        const scalar = 2;
        const triangle = confetti.shapeFromPath({ path: 'M0 10 L5 0 L10 10z' });

        confetti({
            shapes: [triangle],
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00d2ff', '#3a7bd5', '#ff007a']
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = 'login.html';
        });
    }

    // Toggle Password
    const togglePass = document.querySelector('.toggle-password');
    if (togglePass) {
        togglePass.addEventListener('click', () => {
            const input = document.getElementById('password');
            if (input.type === 'password') {
                input.type = 'text';
                togglePass.classList.replace('fa-eye-slash', 'fa-eye');
            } else {
                input.type = 'password';
                togglePass.classList.replace('fa-eye', 'fa-eye-slash');
            }
        });
    }
});
