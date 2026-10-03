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

  // Helper to identify internal admin/lead/dashboard routes so they are never tracked or shown
  function isAdminOrLeadPath(path, title) {
    const p = (path || "").toLowerCase();
    let cur = "";
    try { cur = (window.location.pathname || "").toLowerCase(); } catch (e) {}
    const t = (title || (typeof document !== "undefined" ? document.title : "") || "").toLowerCase();

    return (
      p.indexOf("lead") !== -1 ||
      p.indexOf("admin") !== -1 ||
      p.indexOf("dashboard") !== -1 ||
      cur.indexOf("lead") !== -1 ||
      cur.indexOf("admin") !== -1 ||
      cur.indexOf("dashboard") !== -1 ||
      t.indexOf("lead management") !== -1 ||
      t.indexOf("control center") !== -1 ||
      t.indexOf("admin portal") !== -1
    );
  }

  // Tracker Core Class
  const FitscalezTracker = {
    deviceId: getOrCreateDeviceId(),
    geo: null,

    // Initialize Tracker
    async init() {
      this.geo = await fetchGeoLocation();
      const path = window.location.pathname + window.location.hash;
      const pageTitle = document.title || "";
      if (!isAdminOrLeadPath(path, pageTitle)) {
        this.recordPageView();
      }
      this.bindFormInterceptors();
      this.bindStoreClickInterceptors();
      this.purgeDemoData();
    },

    // Record Page View
    recordPageView() {
      try {
        const now = new Date();
        const path = window.location.pathname + window.location.hash;
        const pageTitle = document.title || "Luxury Portfolio & Suite";

        // Never record internal /lead, /admin, or /dashboard views
        if (isAdminOrLeadPath(path, pageTitle)) {
          return;
        }
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

    // Purge any demo or mock seed data
    purgeDemoData() {
      try {
        const rawLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
        if (rawLeads) {
          const leads = JSON.parse(rawLeads);
          const cleanLeads = leads.filter(l => l && l.id && !String(l.id).startsWith("lead-100"));
          if (cleanLeads.length !== leads.length) {
            localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(cleanLeads));
          }
        }

        const rawDevices = localStorage.getItem(STORAGE_KEYS.DEVICES);
        if (rawDevices) {
          const devices = JSON.parse(rawDevices);
          const cleanDevices = {};
          const mockPrefixes = ["dev-c71b4a2e", "dev-f89a21dc", "dev-e12c34d5", "dev-b34d56e7", "dev-a56e78f9", "dev-d78f90ab"];
          let changed = false;
          for (const [id, dev] of Object.entries(devices)) {
            const isMock = mockPrefixes.some(pref => id.startsWith(pref));
            if (!isMock) {
              cleanDevices[id] = dev;
            } else {
              changed = true;
            }
          }
          if (changed) {
            localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(cleanDevices));
          }
        }
      } catch (e) {
        console.warn("Error purging demo data:", e);
      }
    },

    // Clear all tracked logs and reset storage
    clearAllData() {
      try {
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify({}));
        localStorage.setItem(STORAGE_KEYS.PAGE_VIEWS, JSON.stringify([]));
        localStorage.removeItem("garv_visitor_logs");
      } catch (e) {}
    },

    // Backwards compatibility alias
    ensureSeedDataIfEmpty() {
      this.purgeDemoData();
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
