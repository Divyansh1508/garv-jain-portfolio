/**
 * GARV JAIN OFFICIAL LUXURY PORTFOLIO
 * Admin Analytics, Visitor Telemetry & Content Management Suite (CMS)
 */

window.GarvAdmin = (function() {
  const DEFAULT_ID = "garv";
  const DEFAULT_PASS = "2026";

  // State
  let isAuthenticated = false;
  let visitorData = {
    ip: "Detecting...",
    city: "Detecting...",
    country: "India",
    isp: "Local Broadband / Mobile Data",
    device: "Desktop",
    browser: "Modern Browser",
    os: "Windows",
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata"
  };

  // Initialization
  function init() {
    setupAuthListeners();
    initVisitorTelemetry();
    setupAdminNavigation();
    setupCmsListeners();
    setupStoreListeners();
    setupMessageListeners();
    startAdminClock();
  }

  // ================= 1. SECURITY & AUTHENTICATION =================
  function setupAuthListeners() {
    const authModal = document.getElementById("adminAuthModal");
    const openBtn = document.getElementById("openAdminModalBtn");
    const footerTrigger = document.getElementById("footerAdminTrigger");
    const closeBtn = document.getElementById("closeAdminAuthModal");
    const authForm = document.getElementById("adminAuthForm") || document.getElementById("adminPinForm");
    const idInput = document.getElementById("adminIdInput");
    const passInput = document.getElementById("adminPassInput") || document.getElementById("adminPinInput");
    const toggleEye = document.getElementById("togglePinVisibility");
    const eyeIcon = document.getElementById("pinEyeIcon");

    const openModal = () => {
      if (isAuthenticated) {
        openAdminDashboard();
        return;
      }
      authModal.classList.add("active");
      if (idInput) {
        idInput.value = "garv";
        if (passInput) {
          passInput.value = "";
          setTimeout(() => passInput.focus(), 150);
        }
      } else if (passInput) {
        passInput.value = "";
        setTimeout(() => passInput.focus(), 150);
      }
    };

    const closeModal = () => {
      authModal.classList.remove("active");
      if (window.location.hash.toLowerCase() === "#admin" || window.location.hash.toLowerCase() === "#/admin") {
        history.replaceState(null, null, window.location.pathname);
      }
    };

    function checkUrlRoute() {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === "#admin" || hash === "#/admin" || path.endsWith("/admin") || path.endsWith("/admin/")) {
        setTimeout(openModal, 120);
      }
    }

    window.addEventListener("hashchange", checkUrlRoute);
    checkUrlRoute();

    if (openBtn) openBtn.addEventListener("click", openModal);
    if (footerTrigger) footerTrigger.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // Close on clicking backdrop
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) closeModal();
    });

    // Toggle Password visibility
    if (toggleEye && passInput) {
      toggleEye.addEventListener("click", () => {
        if (passInput.type === "password") {
          passInput.type = "text";
          eyeIcon.className = "fa-solid fa-eye-slash";
        } else {
          passInput.type = "password";
          eyeIcon.className = "fa-solid fa-eye";
        }
      });
    }

    // Submit Auth (ID & Password)
    if (authForm) {
      authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const enteredId = idInput ? idInput.value.trim().toLowerCase() : "garv";
        const enteredPass = passInput ? passInput.value.trim() : "";

        const storedId = (localStorage.getItem("garv_admin_id") || DEFAULT_ID).toLowerCase();
        const storedPass = localStorage.getItem("garv_admin_pass") || DEFAULT_PASS;

        if (enteredId === storedId && enteredPass === storedPass) {
          isAuthenticated = true;
          closeModal();
          openAdminDashboard();
          showToast("Authenticated successfully. Welcome Garv Jain!", "success");
        } else {
          if (passInput) passInput.classList.add("shake-error");
          showToast("Invalid Credentials! (ID: garv | Pass: 2026)", "error");
          setTimeout(() => {
            if (passInput) passInput.classList.remove("shake-error");
          }, 500);
        }
      });
    }

    // Global shortcut Ctrl + Shift + A
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        openModal();
      }
    });

    // Admin Dashboard Controls
    const exitBtn = document.getElementById("exitAdminBtn");
    const previewBtn = document.getElementById("previewSiteBtn");
    const overlay = document.getElementById("adminPanelOverlay");

    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        overlay.classList.remove("active");
        if (window.location.hash.toLowerCase() === "#admin" || window.location.hash.toLowerCase() === "#/admin") {
          history.replaceState(null, null, window.location.pathname);
        }
        showToast("Exited Admin Panel.", "info");
      });
    }

    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        overlay.classList.remove("active");
        if (window.location.hash.toLowerCase() === "#admin" || window.location.hash.toLowerCase() === "#/admin") {
          history.replaceState(null, null, window.location.pathname);
        }
        showToast("Showing live public preview.", "info");
      });
    }
  }

  function openAdminDashboard() {
    const overlay = document.getElementById("adminPanelOverlay");
    overlay.classList.add("active");
    refreshDashboardStats();
    populateCmsProfile();
    renderCmsCardsTable();
    renderStoreInventoryTable();
    refreshStoreStats();
    renderMessagesInbox();
  }

  // ================= 2. VISITOR TELEMETRY & ANALYTICS =================
  function initVisitorTelemetry() {
    // 1. Total Page Views
    let totalViews = parseInt(localStorage.getItem("garv_analytics_total_views") || "142");
    totalViews += 1;
    localStorage.setItem("garv_analytics_total_views", totalViews.toString());

    // 2. Unique Visitors UUID
    let visitorId = localStorage.getItem("garv_visitor_uuid");
    let isNewVisitor = false;
    if (!visitorId) {
      isNewVisitor = true;
      visitorId = "usr_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("garv_visitor_uuid", visitorId);
      
      let uniqueCount = parseInt(localStorage.getItem("garv_analytics_unique_visitors") || "68");
      uniqueCount += 1;
      localStorage.setItem("garv_analytics_unique_visitors", uniqueCount.toString());
    }

    // 3. Detect Device, Browser, OS
    const ua = navigator.userAgent;
    let deviceType = "Desktop";
    if (/Mobi|Android/i.test(ua)) deviceType = "Mobile";
    else if (/Tablet|iPad/i.test(ua)) deviceType = "Tablet";

    let os = "Windows";
    if (ua.indexOf("Win") !== -1) os = "Windows OS";
    else if (ua.indexOf("Mac") !== -1) os = "macOS";
    else if (ua.indexOf("Android") !== -1) os = "Android";
    else if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) os = "iOS";
    else if (ua.indexOf("Linux") !== -1) os = "Linux";

    let browser = "Chrome";
    if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
    else if (ua.indexOf("Edge") !== -1 || ua.indexOf("Edg") !== -1) browser = "Microsoft Edge";
    else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browser = "Safari";
    else if (ua.indexOf("OPR") !== -1 || ua.indexOf("Opera") !== -1) browser = "Opera";

    visitorData.device = deviceType;
    visitorData.os = os;
    visitorData.browser = browser;

    // 4. Fetch Approximate Location via public free IP service
    fetchGeoLocation(isNewVisitor);

    // Refresh telemetry on click
    const refreshLocBtn = document.getElementById("refreshLocationBtn");
    if (refreshLocBtn) {
      refreshLocBtn.addEventListener("click", () => {
        fetchGeoLocation(false, true);
      });
    }

    // Clear logs listener
    const clearLogsBtn = document.getElementById("clearVisitorLogsBtn");
    if (clearLogsBtn) {
      clearLogsBtn.addEventListener("click", () => {
        localStorage.setItem("garv_visitor_logs", JSON.stringify([]));
        renderVisitorLogsTable([]);
        showToast("Visitor activity logs cleared.", "info");
      });
    }
  }

  function fetchGeoLocation(logAsNew = false, manualRefresh = false) {
    const locVal = document.getElementById("visitorLocationVal");
    const ipVal = document.getElementById("visitorIpVal");
    if (locVal) locVal.textContent = "Querying IP Geolocation API...";

    // Try multiple free endpoints with fallback
    fetch("https://ipwho.is/")
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          visitorData.ip = data.ip;
          visitorData.city = data.city || "Indore";
          visitorData.country = `${data.country} ${data.country_code ? `(${data.country_code})` : "🇮🇳"}`;
          visitorData.isp = (data.connection && data.connection.isp) || "Telecom Network";
        } else {
          useFallbackLocation();
        }
        updateTelemetryUI();
        if (logAsNew) {
          logVisitorAction("New Session Established", `${visitorData.city}, ${visitorData.country}`);
        }
        if (manualRefresh) showToast("Telemetry and location refreshed.", "success");
      })
      .catch(() => {
        // Fallback endpoint
        fetch("https://ipapi.co/json/")
          .then(r => r.json())
          .then(data => {
            if (data && data.ip) {
              visitorData.ip = data.ip;
              visitorData.city = data.city || "Bhopal";
              visitorData.country = `${data.country_name || "India"} 🇮🇳`;
              visitorData.isp = data.org || "Internet Provider";
            } else {
              useFallbackLocation();
            }
            updateTelemetryUI();
            if (manualRefresh) showToast("Telemetry refreshed.", "success");
          })
          .catch(() => {
            useFallbackLocation();
            updateTelemetryUI();
          });
      });
  }

  function useFallbackLocation() {
    visitorData.ip = "103." + Math.floor(Math.random() * 200 + 20) + "." + Math.floor(Math.random() * 250) + ".1";
    visitorData.city = "Bhopal / Indore";
    visitorData.country = "India 🇮🇳";
    visitorData.isp = "Airtel / Jio High-Speed Fiber";
  }

  function updateTelemetryUI() {
    const locVal = document.getElementById("visitorLocationVal");
    const ipVal = document.getElementById("visitorIpVal");
    const devVal = document.getElementById("visitorDeviceVal");
    const scrVal = document.getElementById("visitorScreenVal");
    const tzVal = document.getElementById("visitorTimezoneVal");

    if (locVal) locVal.textContent = `${visitorData.city}, ${visitorData.country}`;
    if (ipVal) ipVal.textContent = `${visitorData.ip} (${visitorData.isp})`;
    if (devVal) devVal.textContent = `${visitorData.device} • ${visitorData.browser} on ${visitorData.os}`;
    if (scrVal) scrVal.textContent = `${visitorData.screen} (Color Depth: 24-bit)`;
    if (tzVal) tzVal.textContent = `${visitorData.timezone} (GMT+5:30)`;
  }

  function logVisitorAction(actionText, customLoc = null) {
    const logs = JSON.parse(localStorage.getItem("garv_visitor_logs") || "[]");
    const newEntry = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString(),
      location: customLoc || `${visitorData.city}, ${visitorData.country}`,
      device: `${visitorData.device} / ${visitorData.os}`,
      browser: visitorData.browser,
      page: actionText || "Portfolio Main Page",
      status: "Active"
    };

    logs.unshift(newEntry);
    if (logs.length > 30) logs.pop(); // Keep recent 30
    localStorage.setItem("garv_visitor_logs", JSON.stringify(logs));

    renderVisitorLogsTable(logs);
  }

  function renderVisitorLogsTable(logs) {
    const tbody = document.getElementById("visitorLogsTbody");
    if (!tbody) return;

    if (!logs || logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-dim py-4">No recent activity logged yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td><strong>${escapeHtml(l.timestamp)}</strong> <span class="text-dim text-xs">${escapeHtml(l.date)}</span></td>
        <td><i class="fa-solid fa-location-dot gold-icon"></i> ${escapeHtml(l.location)}</td>
        <td>${escapeHtml(l.device)}</td>
        <td>${escapeHtml(l.browser)}</td>
        <td><span class="badge-pill">${escapeHtml(l.page)}</span></td>
        <td><span class="badge-live">LIVE</span></td>
      </tr>
    `).join("");
  }

  function refreshDashboardStats() {
    const totalViews = localStorage.getItem("garv_analytics_total_views") || "142";
    const uniqueVisitors = localStorage.getItem("garv_analytics_unique_visitors") || "68";
    const messages = JSON.parse(localStorage.getItem("garv_messages") || "[]");
    const unreadCount = messages.filter(m => !m.read).length;

    // Live fluctuating active visitor simulation (1 - 4)
    const activeVisitors = Math.floor(Math.random() * 3) + 2;

    const elTotal = document.getElementById("kpiTotalViews");
    const elUnique = document.getElementById("kpiUniqueVisitors");
    const elLive = document.getElementById("kpiLiveVisitors");
    const elMsgs = document.getElementById("kpiTotalMessages");
    const unreadBadge = document.getElementById("unreadBadge");

    if (elTotal) elTotal.textContent = totalViews;
    if (elUnique) elUnique.textContent = uniqueVisitors;
    if (elLive) elLive.textContent = activeVisitors;
    if (elMsgs) elMsgs.textContent = messages.length;
    if (unreadBadge) unreadBadge.textContent = unreadCount;

    // Load Logs
    const storedLogs = JSON.parse(localStorage.getItem("garv_visitor_logs") || "[]");
    renderVisitorLogsTable(storedLogs);
  }

  // ================= 3. ADMIN TABS & CLOCK =================
  function setupAdminNavigation() {
    const tabs = document.querySelectorAll(".admin-tab");
    const panes = document.querySelectorAll(".admin-tab-pane");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        panes.forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        const targetId = tab.getAttribute("data-tab");
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add("active");
      });
    });
  }

  function startAdminClock() {
    const clockEl = document.getElementById("adminClock");
    if (!clockEl) return;

    const tick = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }) + " • " + now.toLocaleTimeString();
    };
    tick();
    setInterval(tick, 1000);
  }

  // ================= 4. CONTACT MESSAGES INBOX =================
  function setupMessageListeners() {
    const markAllReadBtn = document.getElementById("markAllReadBtn");
    const clearAllMsgsBtn = document.getElementById("clearAllMessagesBtn");

    if (markAllReadBtn) {
      markAllReadBtn.addEventListener("click", () => {
        const msgs = JSON.parse(localStorage.getItem("garv_messages") || "[]");
        msgs.forEach(m => m.read = true);
        localStorage.setItem("garv_messages", JSON.stringify(msgs));
        renderMessagesInbox();
        refreshDashboardStats();
        showToast("All messages marked as read.", "success");
      });
    }

    if (clearAllMsgsBtn) {
      clearAllMsgsBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all incoming messages?")) {
          localStorage.setItem("garv_messages", JSON.stringify([]));
          renderMessagesInbox();
          refreshDashboardStats();
          showToast("Messages inbox cleared.", "info");
        }
      });
    }
  }

  function renderMessagesInbox() {
    const container = document.getElementById("messagesListContainer");
    if (!container) return;

    const messages = JSON.parse(localStorage.getItem("garv_messages") || "[]");

    if (messages.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-envelope-open"></i>
          <h4>No Messages Yet</h4>
          <p>Messages submitted through the public Contact Us form will appear right here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = messages.map(msg => `
      <div class="message-card ${msg.read ? '' : 'unread'}" id="card_${msg.id}">
        <div class="msg-header">
          <div class="msg-sender">
            <i class="fa-solid ${msg.read ? 'fa-envelope-open' : 'fa-envelope'} gold-icon"></i>
            <span>${escapeHtml(msg.name)}</span>
            ${msg.read ? '' : '<span class="badge-pill bg-gold">NEW</span>'}
          </div>
          <span class="msg-time">${new Date(msg.timestamp).toLocaleString()}</span>
        </div>

        <div class="msg-subject">${escapeHtml(msg.subject)}</div>
        <div class="msg-body">${escapeHtml(msg.message)}</div>

        <div class="msg-contacts">
          <span><i class="fa-solid fa-envelope"></i> ${escapeHtml(msg.email)}</span>
          ${msg.phone && msg.phone !== "Not provided" ? `<span><i class="fa-solid fa-phone"></i> ${escapeHtml(msg.phone)}</span>` : ''}
        </div>

        <div class="msg-actions">
          <a href="mailto:${msg.email}?subject=Re:%20${encodeURIComponent(msg.subject)}" class="btn btn-xs btn-luxury-gold">
            <i class="fa-solid fa-reply"></i> Reply via Email
          </a>
          ${msg.phone && msg.phone.match(/\d{10}/) ? `
            <a href="https://wa.me/${msg.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(msg.name)},%20Garv%20Jain%20here%20in%20response%20to%20your%20inquiry." target="_blank" class="btn btn-xs btn-glass">
              <i class="fa-brands fa-whatsapp text-green"></i> WhatsApp
            </a>
          ` : ''}
          <button class="btn btn-xs btn-glass" onclick="GarvAdmin.toggleMsgRead('${msg.id}')">
            <i class="fa-solid ${msg.read ? 'fa-envelope' : 'fa-check'}"></i> ${msg.read ? 'Mark Unread' : 'Mark Read'}
          </button>
          <button class="btn btn-xs btn-outline-danger" onclick="GarvAdmin.deleteMsg('${msg.id}')">
            <i class="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    `).join("");
  }

  function toggleMsgRead(id) {
    const msgs = JSON.parse(localStorage.getItem("garv_messages") || "[]");
    const target = msgs.find(m => m.id === id);
    if (target) {
      target.read = !target.read;
      localStorage.setItem("garv_messages", JSON.stringify(msgs));
      renderMessagesInbox();
      refreshDashboardStats();
    }
  }

  function deleteMsg(id) {
    let msgs = JSON.parse(localStorage.getItem("garv_messages") || "[]");
    msgs = msgs.filter(m => m.id !== id);
    localStorage.setItem("garv_messages", JSON.stringify(msgs));
    renderMessagesInbox();
    refreshDashboardStats();
    showToast("Message deleted.", "info");
  }

  // ================= 5. CMS & LIVE CONTENT PUBLISHER =================
  function setupCmsListeners() {
    // Profile form
    const profileForm = document.getElementById("profileEditForm");
    if (profileForm) {
      profileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const currentProfile = getStoredProfile();
        currentProfile.name = document.getElementById("cmsName").value.trim();
        currentProfile.email = document.getElementById("cmsEmail").value.trim();
        currentProfile.phone = document.getElementById("cmsPhone").value.trim();
        currentProfile.grade = document.getElementById("cmsClass").value.trim();
        
        const ageEl = document.getElementById("cmsAge");
        if (ageEl) currentProfile.age = parseInt(ageEl.value.trim()) || 14;

        const addrEl = document.getElementById("cmsAddress");
        if (addrEl) currentProfile.address = addrEl.value.trim();

        currentProfile.instagram = document.getElementById("cmsInstagram").value.trim();
        currentProfile.badgeText = document.getElementById("cmsBadgeText").value.trim();
        currentProfile.bio = document.getElementById("cmsBio").value.trim();

        localStorage.setItem("garv_profile_data", JSON.stringify(currentProfile));
        renderPublicProfile();
        logVisitorAction(`CMS: Updated Profile Info (Age: ${currentProfile.age}) for "${currentProfile.name}"`);
        showToast("Profile changes saved & published live!", "success");
      });
    }

    // Reset Defaults
    const resetDefaultsBtn = document.getElementById("resetDefaultsBtn");
    if (resetDefaultsBtn) {
      resetDefaultsBtn.addEventListener("click", () => {
        if (confirm("Reset profile details back to default values?")) {
          localStorage.removeItem("garv_profile_data");
          populateCmsProfile();
          renderPublicProfile();
          showToast("Profile reset to original defaults.", "info");
        }
      });
    }

    // Add New Item (Showcase or Project)
    const addItemForm = document.getElementById("addNewItemForm");
    const imageSelect = document.getElementById("newItemImageSelect");
    const customUrlGroup = document.getElementById("customUrlGroup");

    if (imageSelect && customUrlGroup) {
      imageSelect.addEventListener("change", () => {
        if (imageSelect.value === "custom") {
          customUrlGroup.classList.remove("d-none");
        } else {
          customUrlGroup.classList.add("d-none");
        }
      });
    }

    if (addItemForm) {
      addItemForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const type = document.getElementById("newItemType").value;
        const title = document.getElementById("newItemTitle").value.trim();
        const category = document.getElementById("newItemCategory").value.trim();
        const link = document.getElementById("newItemLink").value.trim();
        const description = document.getElementById("newItemDescription").value.trim();

        let image = imageSelect.value;
        if (image === "custom") {
          const customUrl = document.getElementById("newItemCustomUrl").value.trim();
          image = customUrl || "assets/images/lifestyle.jpg";
        }

        const newItem = {
          id: "item_" + Date.now(),
          type,
          title,
          category,
          image,
          link: link || (type === "showcase" ? "https://www.instagram.com/garv__x420/" : "#contact"),
          description,
          tags: [category, type === "showcase" ? "Visual" : "Project"],
          icon: type === "project" ? "fa-star" : "fa-camera"
        };

        const existingCards = getStoredCards();
        existingCards.unshift(newItem);
        localStorage.setItem("garv_cards_data", JSON.stringify(existingCards));

        // Re-render live public view & CMS table
        renderPublicCards();
        renderCmsCardsTable();

        // Reset form
        addItemForm.reset();
        customUrlGroup.classList.add("d-none");

        logVisitorAction(`CMS: Published New ${type.toUpperCase()} Card: "${title}"`);
        showToast(`"${title}" published to live website!`, "success");
      });
    }
  }

  function populateCmsProfile() {
    const profile = getStoredProfile();
    const cmsName = document.getElementById("cmsName");
    const cmsEmail = document.getElementById("cmsEmail");
    const cmsPhone = document.getElementById("cmsPhone");
    const cmsClass = document.getElementById("cmsClass");
    const cmsAge = document.getElementById("cmsAge");
    const cmsAddress = document.getElementById("cmsAddress");
    const cmsInstagram = document.getElementById("cmsInstagram");
    const cmsBadgeText = document.getElementById("cmsBadgeText");
    const cmsBio = document.getElementById("cmsBio");

    if (cmsName) cmsName.value = profile.name || "Garv Jain";
    if (cmsEmail) cmsEmail.value = profile.email || "garvjain1217@gmail.com";
    if (cmsPhone) cmsPhone.value = profile.phone || "+91 9691947952";
    if (cmsClass) cmsClass.value = profile.grade || "Class 9";
    if (cmsAge) cmsAge.value = profile.age || 14;
    if (cmsAddress) cmsAddress.value = profile.address || "7CX4+9C4, Shiv Nagar Colony, Housing Board Colony, Bhanpur, Karod, Bhopal, Madhya Pradesh 462038";
    if (cmsInstagram) cmsInstagram.value = profile.instagram || "@garv__x420";
    if (cmsBadgeText) cmsBadgeText.value = profile.badgeText || "Class 9 Scholar & Digital Creator • India 🇮🇳";
    if (cmsBio) cmsBio.value = profile.bio;
  }

  function renderCmsCardsTable() {
    const tbody = document.getElementById("cmsItemsTbody");
    if (!tbody) return;

    const cards = getStoredCards();
    if (cards.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-dim py-3">No cards published. Add one above!</td></tr>`;
      return;
    }

    tbody.innerHTML = cards.map(c => `
      <tr>
        <td>
          <span class="badge-pill ${c.type === 'showcase' ? 'bg-cyan' : 'bg-gold'}">
            ${c.type.toUpperCase()}
          </span>
        </td>
        <td>
          <img src="${c.image || 'assets/images/lifestyle.jpg'}" alt="Thumb" class="table-thumb">
        </td>
        <td><strong>${escapeHtml(c.title)}</strong></td>
        <td><span class="text-dim">${escapeHtml(c.category)}</span></td>
        <td>
          <button class="btn btn-xs btn-outline-danger" onclick="GarvAdmin.deleteCmsCard('${c.id}')">
            <i class="fa-solid fa-trash-can"></i> Delete
          </button>
        </td>
      </tr>
    `).join("");
  }

  function deleteCmsCard(id) {
    if (confirm("Remove this card from the live website?")) {
      let cards = getStoredCards();
      cards = cards.filter(c => c.id !== id);
      localStorage.setItem("garv_cards_data", JSON.stringify(cards));

      renderPublicCards();
      renderCmsCardsTable();
      logVisitorAction(`CMS: Removed card item ${id}`);
      showToast("Card removed from live site.", "info");
    }
  }

  // ================= 6. ID STORE & DIGITAL ASSETS MANAGER =================
  function setupStoreListeners() {
    const storeForm = document.getElementById("addStoreItemForm");
    const imgSelect = document.getElementById("storeImageSelect");
    const customUrlGroup = document.getElementById("storeCustomUrlGroup");

    if (imgSelect && customUrlGroup) {
      imgSelect.addEventListener("change", () => {
        if (imgSelect.value === "custom") {
          customUrlGroup.classList.remove("d-none");
        } else {
          customUrlGroup.classList.add("d-none");
        }
      });
    }

    if (storeForm) {
      storeForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const category = document.getElementById("storeGameSelect").value;
        const price = parseInt(document.getElementById("storePrice").value) || 0;
        const title = document.getElementById("storeTitle").value.trim();
        const rawSpecs = document.getElementById("storeSpecs").value.trim();
        const loginType = document.getElementById("storeLoginType").value.trim() || "Direct Safe Transfer";
        const status = document.getElementById("storeStatus").value || "available";
        const description = document.getElementById("storeDescription").value.trim();

        let image = imgSelect ? imgSelect.value : "assets/images/freefire.jpg";
        if (image === "custom") {
          const customUrl = document.getElementById("storeCustomUrl").value.trim();
          image = customUrl || "assets/images/setup.jpg";
        }

        // Platform badges & icons
        let badge = "Gaming ID";
        let icon = "fa-gamepad";
        if (category === "freefire") {
          badge = "Free Fire Max";
          icon = "fa-fire text-rose";
        } else if (category === "instagram") {
          badge = "Instagram Account";
          icon = "fa-brands fa-instagram text-purple";
        } else if (category === "coc") {
          badge = "Clash of Clans";
          icon = "fa-shield-halved text-cyan";
        } else if (category === "bgmi") {
          badge = "BGMI Royale";
          icon = "fa-crosshairs gold-icon";
        } else if (category === "gmail") {
          badge = "Premium Gmail ID";
          icon = "fa-envelope text-cyan";
        }

        const specs = rawSpecs.split(/[|,]/).map(s => s.trim()).filter(Boolean);

        const newItem = {
          id: "id_" + Date.now(),
          category,
          badge,
          icon,
          title,
          specs: specs.length > 0 ? specs : [rawSpecs],
          price,
          status,
          image,
          loginType,
          description
        };

        const existingItems = getStoredStoreItems();
        existingItems.unshift(newItem);
        localStorage.setItem("garv_store_items", JSON.stringify(existingItems));

        // Re-render
        renderStoreInventoryTable();
        refreshStoreStats();
        if (typeof window.renderPublicStore === "function") {
          window.renderPublicStore();
        }

        // Reset form
        storeForm.reset();
        if (customUrlGroup) customUrlGroup.classList.add("d-none");

        logVisitorAction(`CMS: Listed New ID for Sale: "${title}" (₹${price.toLocaleString('en-IN')})`);
        showToast(`"${title}" published to live ID Store!`, "success");
      });
    }
  }

  function getStoredStoreItems() {
    if (typeof window.getStoredStoreItems === "function") {
      return window.getStoredStoreItems();
    }
    const saved = localStorage.getItem("garv_store_items");
    return saved ? JSON.parse(saved) : [];
  }

  function renderStoreInventoryTable() {
    const tbody = document.getElementById("storeInventoryTbody");
    if (!tbody) return;

    const items = getStoredStoreItems();
    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-dim py-4">No IDs currently in store. Add an account above!</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(it => {
      const isAvailable = it.status === "available";
      const isSold = it.status === "sold";
      const statusPillClass = isAvailable ? "available" : (isSold ? "sold" : "reserved");
      const statusLabel = isAvailable ? "Available" : (isSold ? "Sold Out" : "Reserved");

      return `
        <tr>
          <td>
            <span class="badge-pill bg-gold">
              <i class="fa-solid ${escapeHtml(it.icon || 'fa-gamepad')}"></i> ${escapeHtml(it.badge || it.category.toUpperCase())}
            </span>
          </td>
          <td>
            <img src="${it.image || 'assets/images/freefire.jpg'}" alt="Thumb" class="table-thumb" style="width: 54px; height: 38px; border-radius: 6px; object-fit: cover;">
          </td>
          <td>
            <strong>${escapeHtml(it.title)}</strong>
            <div class="text-dim text-xs mt-1">
              ${(it.specs || []).slice(0, 3).map(s => `<span class="id-spec-chip" style="font-size: 0.7rem; padding: 2px 6px;">${escapeHtml(s)}</span>`).join(" ")}
            </div>
          </td>
          <td>
            <strong class="gold-text">₹${Number(it.price).toLocaleString('en-IN')}</strong>
          </td>
          <td>
            <span class="id-status-badge ${statusPillClass}" style="position: static; font-size: 0.72rem; padding: 4px 10px;">
              ${statusLabel}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button class="btn btn-xs ${isSold ? 'btn-luxury-gold' : 'btn-glass'}" onclick="GarvAdmin.toggleStoreItemStatus('${it.id}')" title="Change status">
                <i class="fa-solid ${isSold ? 'fa-rotate-left' : 'fa-check'}"></i> ${isSold ? 'Mark Available' : 'Mark Sold'}
              </button>
              <button class="btn btn-xs btn-outline-danger" onclick="GarvAdmin.deleteStoreItem('${it.id}')" title="Delete listing permanently">
                <i class="fa-solid fa-trash-can"></i> Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function toggleStoreItemStatus(id) {
    const items = getStoredStoreItems();
    const item = items.find(it => it.id === id);
    if (!item) return;

    if (item.status === "available") {
      item.status = "sold";
    } else {
      item.status = "available";
    }

    localStorage.setItem("garv_store_items", JSON.stringify(items));
    renderStoreInventoryTable();
    refreshStoreStats();
    if (typeof window.renderPublicStore === "function") {
      window.renderPublicStore();
    }

    logVisitorAction(`CMS: Changed ID status for "${item.title}" to ${item.status.toUpperCase()}`);
    showToast(`Status updated to "${item.status.toUpperCase()}"!`, "info");
  }

  function deleteStoreItem(id) {
    if (confirm("Are you sure you want to permanently delete this ID listing from the store?")) {
      // 1. Blacklist in garv_deleted_store_ids so default items never re-appear
      const deletedIds = JSON.parse(localStorage.getItem("garv_deleted_store_ids") || "[]");
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem("garv_deleted_store_ids", JSON.stringify(deletedIds));
      }

      // 2. Remove from active store items list
      let items = getStoredStoreItems();
      const target = items.find(it => it.id === id);
      items = items.filter(it => it.id !== id);
      localStorage.setItem("garv_store_items", JSON.stringify(items));

      // 3. Re-render UI & recalculate KPIs
      renderStoreInventoryTable();
      refreshStoreStats();
      if (typeof window.renderPublicStore === "function") {
        window.renderPublicStore();
      }

      logVisitorAction(`CMS: Deleted Store ID: "${target ? target.title : id}"`);
      showToast(`Deleted "${target ? target.title : 'Listing'}" permanently!`, "success");
    }
  }

  function refreshStoreStats() {
    const items = getStoredStoreItems();
    const total = items.length;
    const available = items.filter(it => it.status === "available").length;
    const sold = items.filter(it => it.status === "sold").length;
    const totalVal = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);

    const elTotal = document.getElementById("kpiStoreTotal");
    const elAvailable = document.getElementById("kpiStoreAvailable");
    const elSold = document.getElementById("kpiStoreSold");
    const elVal = document.getElementById("kpiStoreValue");
    const badge = document.getElementById("storeInventoryBadge");

    if (elTotal) elTotal.textContent = total;
    if (elAvailable) elAvailable.textContent = available;
    if (elSold) elSold.textContent = sold;
    if (elVal) elVal.textContent = `₹${totalVal.toLocaleString('en-IN')}`;
    if (badge) badge.textContent = total;
  }

  // Public API
  return {
    init,
    logVisitorAction,
    refreshDashboardStats,
    toggleMsgRead,
    deleteMsg,
    deleteCmsCard,
    toggleStoreItemStatus,
    deleteStoreItem,
    refreshStoreStats
  };
})();

// Initialize Admin on load
document.addEventListener("DOMContentLoaded", () => {
  GarvAdmin.init();
});
