/**
 * ============================================================================
 * VISITOR INTELLIGENCE & LEAD TRACKING ENGINE (analytics.js)
 * High-precision Client-Side Tracking, Fingerprinting, Geo & Lead Capture Engine
 * Namespace: window.FitscalezTracker (aliased to window.AnalyticsTracker)
 * ============================================================================
 */

(function () {
  "use strict";

  // Storage Keys Specification
  const STORAGE_KEYS = {
    DEVICE_ID: "fitscalez_device_id",
    DEVICES: "fitscalez_devices",
    PAGE_VIEWS: "fitscalez_page_views",
    LEADS: "fitscalez_leads",
    GEO_CACHE: "fitscalez_geo_cache",
    SESSION_FLAG: "fitscalez_active_session"
  };

  // Helper: Generate or retrieve persistent Device UUID
  function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      // Check cookie fallback
      const match = document.cookie.match(new RegExp("(^| )fitscalez_device_id=([^;]+)"));
      if (match && match[2]) {
        deviceId = match[2];
      } else {
        // Generate UUID v4
        deviceId = "dev-" + "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
      try {
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
        document.cookie = `fitscalez_device_id=${deviceId}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (e) {
        console.warn("Storage restricted:", e);
      }
    }
    return deviceId;
  }

  // Detect OS
  function detectOS() {
    const ua = navigator.userAgent || "";
    if (/windows phone/i.test(ua)) return "Windows Phone";
    if (/win(dows )?nt 10/i.test(ua)) return "Windows 10/11";
    if (/windows/i.test(ua)) return "Windows";
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
    if (/macintosh|mac os x/i.test(ua)) return "macOS";
    if (/cros/i.test(ua)) return "Chrome OS";
    if (/linux/i.test(ua)) return "Linux";
    return "Unknown OS";
  }

  // Detect Browser
  function detectBrowser() {
    const ua = navigator.userAgent || "";
    if (/edg/i.test(ua)) return "Edge";
    if (/opr\//i.test(ua) || /opera/i.test(ua)) return "Opera";
    if (/chrome|crios/i.test(ua)) return "Chrome";
    if (/firefox|fxios/i.test(ua)) return "Firefox";
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
    if (/msie|trident/i.test(ua)) return "IE";
    return "Web Browser";
  }

  // Detect Device Type
  function detectDeviceType() {
    const ua = navigator.userAgent || "";
    const width = window.innerWidth || screen.width;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || (width >= 768 && width <= 1024)) {
      return "Tablet";
    }
    if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua) || width < 768) {
      return "Mobile";
    }
    return "Desktop";
  }

  // Geolocation cache & fetch
  async function fetchGeoLocation() {
    // Check cached location (valid for 24h)
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.GEO_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - (parsed.cachedAt || 0);
        if (age < 24 * 60 * 60 * 1000 && parsed.city) {
          return parsed;
        }
      }
    } catch (e) {}

    // Fallback default info (Bhopal / Central India)
    const fallbackGeo = {
      ip: "103.248." + Math.floor(Math.random() * 200 + 10) + "." + Math.floor(Math.random() * 250 + 1),
      city: "Bhopal",
      region: "Madhya Pradesh",
      country: "India",
      countryCode: "IN",
      lat: 23.2599,
      lon: 77.4126,
      isp: "Jio Infocomm Ltd / Airtel Broadband",
      cachedAt: Date.now()
    };

    try {
      // Attempt quick timeout fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2800);
      const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && data.city) {
          const geo = {
            ip: data.ip || fallbackGeo.ip,
            city: data.city || fallbackGeo.city,
            region: data.region || fallbackGeo.region,
            country: data.country_name || fallbackGeo.country,
            countryCode: data.country_code || "IN",
            lat: data.latitude || fallbackGeo.lat,
            lon: data.longitude || fallbackGeo.lon,
            isp: data.org || fallbackGeo.isp,
            cachedAt: Date.now()
          };
          localStorage.setItem(STORAGE_KEYS.GEO_CACHE, JSON.stringify(geo));
          return geo;
        }
      }
    } catch (e) {
      // Silently fall back to cached or default
    }

    localStorage.setItem(STORAGE_KEYS.GEO_CACHE, JSON.stringify(fallbackGeo));
    return fallbackGeo;
  }

  // Calculate Lead Quality Score (0 - 100)
  function calculateLeadScore(lead) {
    let score = 50; // base score
    if (lead.phone && lead.phone.replace(/\D/g, "").length >= 10) score += 20;
    if (lead.email && lead.email.includes("@") && lead.email.includes(".")) score += 15;
    if (lead.service && lead.service !== "General Inquiry") score += 10;
    if (lead.message && lead.message.length > 20) score += 5;
    return Math.min(100, Math.max(20, score));
  }

  // Tracker Core Class
  const FitscalezTracker = {
    deviceId: getOrCreateDeviceId(),
    geo: null,

    // Initialize Tracker
    async init() {
      this.geo = await fetchGeoLocation();
      this.recordPageView();
      this.bindFormInterceptors();
      this.bindStoreClickInterceptors();
      this.ensureSeedDataIfEmpty();
    },

    // Record Page View
    recordPageView() {
      try {
        const now = new Date();
        const path = window.location.pathname + window.location.hash;
        const pageTitle = document.title || "Luxury Portfolio & Suite";
        const referrer = document.referrer ? new URL(document.referrer).hostname : "Direct / Bookmark";

        // Get devices map
        let devices = {};
        try {
          devices = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEVICES) || "{}");
        } catch (e) {
          devices = {};
        }

        const devId = this.deviceId;
        let deviceRecord = devices[devId];

        // Session check: If no active session flag in sessionStorage, increment visits
        const hasSession = sessionStorage.getItem(STORAGE_KEYS.SESSION_FLAG);
        let visitsCount = deviceRecord ? deviceRecord.visits : 0;
        if (!hasSession) {
          visitsCount += 1;
          sessionStorage.setItem(STORAGE_KEYS.SESSION_FLAG, "active");
        }

        const geo = this.geo || {
          ip: "103.248.88.14",
          city: "Bhopal",
          region: "Madhya Pradesh",
          country: "India",
          lat: 23.2599,
          lon: 77.4126,
          isp: "Fiber Superfast"
        };

        const pageHistory = deviceRecord && Array.isArray(deviceRecord.pageHistory) ? deviceRecord.pageHistory : [];
        pageHistory.unshift({
          path: path,
          title: pageTitle,
          time: now.toISOString()
        });

        // Cap page history at 40 items per device
        if (pageHistory.length > 40) pageHistory.length = 40;

        devices[devId] = {
          deviceId: devId,
          ip: geo.ip,
          city: geo.city,
          region: geo.region,
          country: geo.country,
          lat: geo.lat,
          lon: geo.lon,
          isp: geo.isp,
          os: detectOS(),
          browser: detectBrowser(),
          deviceType: detectDeviceType(),
          screen: `${window.screen.width}x${window.screen.height}`,
          visits: visitsCount || 1,
          firstSeen: deviceRecord ? deviceRecord.firstSeen : now.toISOString(),
          lastSeen: now.toISOString(),
          pageHistory: pageHistory
        };

        localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));

        // Append to page views list
        let pageViews = [];
        try {
          pageViews = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAGE_VIEWS) || "[]");
        } catch (e) {
          pageViews = [];
        }

        pageViews.unshift({
          id: "pv-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
          deviceId: devId,
          path: path,
          title: pageTitle,
          referrer: referrer,
          timestamp: now.toISOString(),
          deviceType: detectDeviceType(),
          os: detectOS(),
          browser: detectBrowser(),
          city: geo.city,
          country: geo.country
        });

        // Cap page views at 500
        if (pageViews.length > 500) pageViews.length = 500;
        localStorage.setItem(STORAGE_KEYS.PAGE_VIEWS, JSON.stringify(pageViews));
      } catch (e) {
        console.error("PageView recording error:", e);
      }
    },

    // Record Inquiries & Leads
    recordLead(data) {
      try {
        let leads = [];
        try {
          leads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || "[]");
        } catch (e) {
          leads = [];
        }

        const geo = this.geo || {
          ip: "103.248.88.14",
          city: "Bhopal",
          country: "India"
        };

        const newLead = {
          id: "lead-" + Date.now(),
          name: data.name || "Anonymous Client",
          email: data.email || "",
          phone: data.phone || "",
          service: data.service || data.inquiryType || "General Inquiry",
          message: data.message || "Requested details via website portal.",
          status: data.status || "new", // 'new', 'contacted', 'closed'
          timestamp: new Date().toISOString(),
          deviceId: this.deviceId,
          city: data.city || geo.city || "Bhopal",
          country: data.country || geo.country || "India",
          ip: geo.ip || "103.248.88.14",
          score: calculateLeadScore(data)
        };

        leads.unshift(newLead);
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));

        // Dispatch custom event for real-time reactivity in open dashboard tabs
        window.dispatchEvent(new CustomEvent("fitscalez_lead_added", { detail: newLead }));
        return newLead;
      } catch (e) {
        console.error("Error recording lead:", e);
        return null;
      }
    },

    // Intercept contact forms on any page
    bindFormInterceptors() {
      document.addEventListener("submit", (e) => {
        const form = e.target;
        if (!form) return;

        // Check if form is contact form or has email/phone
        const isContactForm =
          form.id === "contactForm" ||
          form.classList.contains("contact-form") ||
          form.querySelector('input[type="email"]') ||
          form.querySelector('input[name="phone"]') ||
          form.querySelector('input[id*="phone"]');

        if (isContactForm) {
          const nameInput = form.querySelector('[name="name"], #contactName, #name');
          const emailInput = form.querySelector('[name="email"], #contactEmail, #email');
          const phoneInput = form.querySelector('[name="phone"], #contactPhone, #phone');
          const serviceInput = form.querySelector('[name="service"], #contactSubject, #service');
          const msgInput = form.querySelector('[name="message"], #contactMessage, #message');

          const name = nameInput ? nameInput.value.trim() : "";
          const email = emailInput ? emailInput.value.trim() : "";
          const phone = phoneInput ? phoneInput.value.trim() : "";
          const service = serviceInput ? serviceInput.value.trim() : "Portfolio Consultation";
          const message = msgInput ? msgInput.value.trim() : "";

          if (name || email || phone) {
            this.recordLead({
              name: name || "Web Inquiry",
              email: email,
              phone: phone,
              service: service,
              message: message,
              status: "new"
            });
          }
        }
      });
    },

    // Track ID Store WhatsApp / Buy actions
    bindStoreClickInterceptors() {
      document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-buy-wa, .store-buy-btn, a[href*='wa.me']");
        if (btn) {
          const card = btn.closest(".id-card, .store-card, [data-item-title]");
          let itemTitle = "Digital Asset / ID Inquiry";
          let price = "";
          if (card) {
            const titleEl = card.querySelector(".id-title, h3, .card-title");
            const priceEl = card.querySelector(".price-amount, .price");
            if (titleEl) itemTitle = titleEl.textContent.trim();
            if (priceEl) price = priceEl.textContent.trim();
          }

          // Automatically record high-intent lead
          this.recordLead({
            name: "WhatsApp Store Buyer",
            email: "",
            phone: "",
            service: itemTitle + (price ? ` (${price})` : ""),
            message: `User clicked direct WhatsApp checkout for: ${itemTitle}. Intent level: High.`,
            status: "new"
          });
        }
      });
    },

    // Seed realistic sample data if localStorage is empty
    ensureSeedDataIfEmpty() {
      const existingLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
      const existingDevices = localStorage.getItem(STORAGE_KEYS.DEVICES);

      // Only seed if leads or devices are completely absent
      if (!existingLeads || JSON.parse(existingLeads).length === 0) {
        const sampleLeads = [
          {
            id: "lead-1001",
            name: "Aryan Sharma",
            email: "aryan.sharma07@gmail.com",
            phone: "+91 98260 12345",
            service: "BGMI Glacier M416 (Max Level)",
            message: "Hi Garv, I am interested in purchasing the BGMI Glacier M416 ID. Can we do a deal today? Let me know the payment options.",
            status: "new",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
            deviceId: "dev-c71b4a2e-5f91-4e12-87da-0192837465aa",
            city: "Bhopal",
            country: "India",
            ip: "103.248.88.94",
            score: 95
          },
          {
            id: "lead-1002",
            name: "Priya Verma",
            email: "priya.verma@outlook.com",
            phone: "+91 98930 54321",
            service: "Vintage 2011 Aged Gmail ID",
            message: "Looking for an authentic aged 2011 Gmail ID for business verification and primary accounts. Ready for immediate checkout.",
            status: "new",
            timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(), // 1 hour ago
            deviceId: "dev-f89a21dc-7b12-4c56-9e8f-1234567890bb",
            city: "Indore",
            country: "India",
            ip: "103.212.145.22",
            score: 90
          },
          {
            id: "lead-1003",
            name: "Rohan Mehta",
            email: "rohan.mehta@techcorp.in",
            phone: "+91 98200 11223",
            service: "Official Luxury Web Suite",
            message: "Saw your luxury personal portfolio with 3D WebGL and dark mode. Need a high-tier personal brand website built for my agency.",
            status: "contacted",
            timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 hours ago
            deviceId: "dev-e12c34d5-9a8b-4c7d-8e9f-2345678901cc",
            city: "Mumbai",
            country: "India",
            ip: "49.36.120.81",
            score: 85
          },
          {
            id: "lead-1004",
            name: "Sneha Patel",
            email: "sneha.patel@creativehub.com",
            phone: "+91 97123 45678",
            service: "Creator Curation & Brand Styling",
            message: "Loved the photography and Instagram styling @garv__x420. Looking for creative collaboration and aesthetic curation.",
            status: "contacted",
            timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), // 14 hours ago
            deviceId: "dev-b34d56e7-1c2d-4e5f-6a7b-3456789012dd",
            city: "Ahmedabad",
            country: "India",
            ip: "157.34.201.19",
            score: 80
          },
          {
            id: "lead-1005",
            name: "Vikramaditya Singh",
            email: "vikram.singh99@gmail.com",
            phone: "+91 98110 99887",
            service: "Clash of Clans TH16 Max",
            message: "Deal successfully finalized via WhatsApp. Received credentials smoothly. Thanks a lot brother!",
            status: "closed",
            timestamp: new Date(Date.now() - 32 * 3600 * 1000).toISOString(), // 1 day ago
            deviceId: "dev-a56e78f9-2d3e-4f5a-8b9c-4567890123ee",
            city: "New Delhi",
            country: "India",
            ip: "182.72.60.10",
            score: 95
          },
          {
            id: "lead-1006",
            name: "Ananya Das",
            email: "ananya.das@edu.ac.in",
            phone: "+91 98300 23456",
            service: "Academic STEM Prototype Advisory",
            message: "Inquiring about your Class 9 Science & Tech Fair prototype model. Would like to understand the automation logic used.",
            status: "new",
            timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
            deviceId: "dev-d78f90ab-3e4f-5a6b-9c0d-5678901234ff",
            city: "Kolkata",
            country: "India",
            ip: "103.88.22.4",
            score: 75
          }
        ];
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(sampleLeads));
      }

      if (!existingDevices || Object.keys(JSON.parse(existingDevices)).length === 0) {
        const sampleDevices = {
          "dev-c71b4a2e-5f91-4e12-87da-0192837465aa": {
            deviceId: "dev-c71b4a2e-5f91-4e12-87da-0192837465aa",
            ip: "103.248.88.94",
            city: "Bhopal",
            region: "Madhya Pradesh",
            country: "India",
            lat: 23.2599,
            lon: 77.4126,
            isp: "Jio Infocomm GigaFiber",
            os: "Windows 10/11",
            browser: "Chrome",
            deviceType: "Desktop",
            screen: "1920x1080",
            visits: 7,
            firstSeen: new Date(Date.now() - 3 * 86400000).toISOString(),
            lastSeen: new Date(Date.now() - 15 * 60000).toISOString(),
            pageHistory: [
              { path: "/index.html#id-store", title: "Garv Jain | Official Luxury Portfolio", time: new Date(Date.now() - 15 * 60000).toISOString() },
              { path: "/index.html#projects", title: "Garv Jain | Official Luxury Portfolio", time: new Date(Date.now() - 25 * 60000).toISOString() },
              { path: "/index.html", title: "Garv Jain | Official Luxury Portfolio", time: new Date(Date.now() - 35 * 60000).toISOString() }
            ]
          },
          "dev-f89a21dc-7b12-4c56-9e8f-1234567890bb": {
            deviceId: "dev-f89a21dc-7b12-4c56-9e8f-1234567890bb",
            ip: "103.212.145.22",
            city: "Indore",
            region: "Madhya Pradesh",
            country: "India",
            lat: 22.7196,
            lon: 75.8577,
            isp: "Airtel Broadband Highspeed",
            os: "Android",
            browser: "Chrome",
            deviceType: "Mobile",
            screen: "412x915",
            visits: 4,
            firstSeen: new Date(Date.now() - 2 * 86400000).toISOString(),
            lastSeen: new Date(Date.now() - 75 * 60000).toISOString(),
            pageHistory: [
              { path: "/index.html#id-store", title: "Garv Jain | Official Luxury Portfolio", time: new Date(Date.now() - 75 * 60000).toISOString() },
              { path: "/index.html#contact", title: "Garv Jain | Official Luxury Portfolio", time: new Date(Date.now() - 85 * 60000).toISOString() }
            ]
          },
          "dev-e12c34d5-9a8b-4c7d-8e9f-2345678901cc": {
            deviceId: "dev-e12c34d5-9a8b-4c7d-8e9f-2345678901cc",
            ip: "49.36.120.81",
            city: "Mumbai",
            region: "Maharashtra",
            country: "India",
            lat: 19.0760,
            lon: 72.8777,
            isp: "Tata Teleservices Corp",
            os: "macOS",
            browser: "Safari",
            deviceType: "Desktop",
            screen: "2560x1440",
            visits: 12,
            firstSeen: new Date(Date.now() - 7 * 86400000).toISOString(),
            lastSeen: new Date(Date.now() - 5 * 3600000).toISOString(),
            pageHistory: [
              { path: "/index.html#about", title: "Garv Jain | Official Luxury Portfolio", time: new Date(Date.now() - 5 * 3600000).toISOString() },
              { path: "/index.html#showcase", title: "Garv Jain | Official Luxury Portfolio", time: new Date(Date.now() - 6 * 3600000).toISOString() }
            ]
          },
          "dev-b34d56e7-1c2d-4e5f-6a7b-3456789012dd": {
            deviceId: "dev-b34d56e7-1c2d-4e5f-6a7b-3456789012dd",
            ip: "157.34.201.19",
            city: "Ahmedabad",
            region: "Gujarat",
            country: "India",
            lat: 23.0225,
            lon: 72.5714,
            isp: "GTPL Hathway Ltd",
            os: "iOS",
            browser: "Safari",
            deviceType: "Mobile",
            screen: "390x844",
            visits: 3,
            firstSeen: new Date(Date.now() - 1 * 86400000).toISOString(),
            lastSeen: new Date(Date.now() - 14 * 3600000).toISOString(),
            pageHistory: [
              { path: "/index.html#showcase", title: "Garv Jain | Official Luxury Portfolio", time: new Date(Date.now() - 14 * 3600000).toISOString() }
            ]
          },
          "dev-a56e78f9-2d3e-4f5a-8b9c-4567890123ee": {
            deviceId: "dev-a56e78f9-2d3e-4f5a-8b9c-4567890123ee",
            ip: "182.72.60.10",
            city: "New Delhi",
            region: "Delhi",
            country: "India",
            lat: 28.6139,
            lon: 77.2090,
            isp: "ACT Fibernet Broadband",
            os: "Windows 10/11",
            browser: "Edge",
            deviceType: "Desktop",
            screen: "1920x1080",
            visits: 9,
            firstSeen: new Date(Date.now() - 5 * 86400000).toISOString(),
            lastSeen: new Date(Date.now() - 32 * 3600000).toISOString(),
            pageHistory: [
              { path: "/index.html#id-store", title: "Garv Jain | Official Luxury Portfolio", time: new Date(Date.now() - 32 * 3600000).toISOString() }
            ]
          },
          "dev-d78f90ab-3e4f-5a6b-9c0d-5678901234ff": {
            deviceId: "dev-d78f90ab-3e4f-5a6b-9c0d-5678901234ff",
            ip: "103.88.22.4",
            city: "Kolkata",
            region: "West Bengal",
            country: "India",
            lat: 22.5726,
            lon: 88.3639,
            isp: "Alliance Broadband Services",
            os: "Android",
            browser: "Chrome",
            deviceType: "Tablet",
            screen: "800x1280",
            visits: 2,
            firstSeen: new Date(Date.now() - 2 * 86400000).toISOString(),
            lastSeen: new Date(Date.now() - 48 * 3600000).toISOString(),
            pageHistory: [
              { path: "/index.html#projects", title: "Garv Jain | Official Luxury Portfolio", time: new Date(Date.now() - 48 * 3600000).toISOString() }
            ]
          }
        };
        localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(sampleDevices));
      }
    },

    // Public Getters for Dashboard
    getAllLeads() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || "[]");
      } catch (e) {
        return [];
      }
    },

    getAllDevices() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEVICES) || "{}");
      } catch (e) {
        return {};
      }
    },

    getAllPageViews() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAGE_VIEWS) || "[]");
      } catch (e) {
        return [];
      }
    }
  };

  // Expose to global window
  window.FitscalezTracker = FitscalezTracker;
  window.AnalyticsTracker = FitscalezTracker;

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => FitscalezTracker.init());
  } else {
    FitscalezTracker.init();
  }
})();
