/**
 * GARV JAIN OFFICIAL LUXURY PORTFOLIO
 * Public Interactive Logic & Dynamic Renderer
 */

// Global State Initializer for Profile & Content
const DEFAULT_PROFILE = {
  name: "Garv Jain",
  hindiName: "(गर्व जैन)",
  age: 14,
  grade: "Class 9",
  email: "garvjain1217@gmail.com",
  phone: "+91 9691947952",
  address: "7CX4+9C4, Shiv Nagar Colony, Housing Board Colony, Bhanpur, Karod, Bhopal, Madhya Pradesh 462038",
  city: "Karod, Bhopal",
  instagram: "@garv__x420",
  instagramUrl: "https://www.instagram.com/garv__x420/",
  badgeText: "Class 9 Scholar & Digital Creator • India 🇮🇳",
  bio: "Welcome to my official digital sanctuary. Driven by technology, sleek aesthetics, and relentless curiosity. Exploring the realms of modern code, media creation, and digital innovation.",
  avatarImg: "assets/images/avatar.jpg?v=real"
};

const DEFAULT_CARDS = [
  // Showcase Items
  {
    id: "showcase-insta",
    type: "showcase",
    title: "Golden Hour Skyline & Streetwear",
    category: "Instagram Drop (@garv__x420)",
    image: "assets/images/insta1.jpg",
    link: "https://www.instagram.com/garv__x420/",
    description: "Twilight city views, bespoke denim aesthetic, and authentic golden hour moods straight from Garv's official Instagram feed."
  },
  {
    id: "showcase-1",
    type: "showcase",
    title: "Luxury Velocity & Architecture",
    category: "Aesthetic / Lifestyle",
    image: "assets/images/lifestyle.jpg",
    link: "https://www.instagram.com/garv__x420/",
    description: "Sleek automotive design and futuristic glass architecture captured through cinematic photography and rich ambient lighting."
  },
  {
    id: "showcase-3",
    type: "showcase",
    title: "Editorial Digital Identity",
    category: "Personal Brand",
    image: "assets/images/avatar.jpg?v=real",
    link: "https://www.instagram.com/garv__x420/",
    description: "Signature gold and obsidian visual language crafted to symbolize ambition, youthful leadership, and creative mastery."
  },
  // Project Items
  {
    id: "project-1",
    type: "project",
    title: "Official Luxury Web Suite",
    category: "Web Development",
    icon: "fa-code",
    link: "#hero",
    tags: ["HTML5", "CSS3", "JavaScript", "Glassmorphism"],
    description: "Custom-engineered personal portfolio with an embedded realtime analytics engine, live CMS, and secure owner portal."
  },
  {
    id: "project-2",
    type: "project",
    title: "Creator Curation @garv__x420",
    category: "Social Media & Visuals",
    icon: "fa-camera-retro",
    link: "https://www.instagram.com/garv__x420/",
    tags: ["Photography", "Color Grading", "Brand Curation"],
    description: "Curating a distinctive visual lifestyle brand on Instagram featuring modern architecture, cars, and creative storytelling."
  },
  {
    id: "project-3",
    type: "project",
    title: "Class 9 Science & Tech Fair",
    category: "Academic Innovation",
    icon: "fa-microchip",
    link: "#contact",
    tags: ["Science", "Physics", "Computer Science"],
    description: "Interactive STEM prototype model demonstrating computing principles, automation concepts, and logical problem solving."
  }
];

// Load or initialize Data
function getStoredProfile() {
  const saved = localStorage.getItem("garv_profile_data");
  if (!saved) {
    localStorage.setItem("garv_profile_data", JSON.stringify(DEFAULT_PROFILE));
    return DEFAULT_PROFILE;
  }
  try {
    const parsed = JSON.parse(saved);
    // Ensure age, address, and latest avatar exist
    if (!parsed.age) parsed.age = DEFAULT_PROFILE.age;
    if (!parsed.address) parsed.address = DEFAULT_PROFILE.address;
    parsed.avatarImg = DEFAULT_PROFILE.avatarImg;
    return parsed;
  } catch (e) {
    return DEFAULT_PROFILE;
  }
}

function getStoredCards() {
  const saved = localStorage.getItem("garv_cards_data");
  if (!saved) {
    localStorage.setItem("garv_cards_data", JSON.stringify(DEFAULT_CARDS));
    return DEFAULT_CARDS;
  }
  try {
    let list = JSON.parse(saved);
    // Purge removed showcase-2
    list = list.filter(c => c.id !== "showcase-2");

    // Ensure new insta showcase is present
    if (!list.find(c => c.id === "showcase-insta")) {
      list.unshift(DEFAULT_CARDS[0]);
    }
    const avatarCard = list.find(c => c.id === "showcase-3");
    if (avatarCard) {
      avatarCard.image = "assets/images/avatar.jpg?v=real";
    }
    localStorage.setItem("garv_cards_data", JSON.stringify(list));
    return list;
  } catch (e) {
    return DEFAULT_CARDS;
  }
}

// Render dynamic profile content into public DOM
function renderPublicProfile() {
  const profile = getStoredProfile();

  // Name & badge
  const nameEl = document.getElementById("profileNameDisplay");
  if (nameEl) nameEl.textContent = profile.name;

  const badgeEl = document.getElementById("heroBadgeText");
  if (badgeEl) badgeEl.textContent = profile.badgeText;

  // Dynamic Age
  const ageEl = document.getElementById("profileAgeDisplay");
  if (ageEl) ageEl.textContent = profile.age || 14;

  const bioEl = document.getElementById("profileBioDisplay");
  if (bioEl) bioEl.textContent = profile.bio;

  const avatarEl = document.getElementById("profileAvatarImg");
  if (avatarEl && profile.avatarImg) avatarEl.src = profile.avatarImg;

  // Contact items & Address
  const emailEl = document.getElementById("displayContactEmail");
  if (emailEl) emailEl.textContent = profile.email;

  const emailLink = document.getElementById("contactEmailLink");
  if (emailLink) emailLink.href = `mailto:${profile.email}`;

  const phoneEl = document.getElementById("displayContactPhone");
  if (phoneEl) phoneEl.textContent = profile.phone;

  const phoneLink = document.getElementById("contactPhoneLink");
  if (phoneLink) phoneLink.href = `tel:${profile.phone.replace(/\s+/g, '')}`;

  const addrEl = document.getElementById("displayContactAddress");
  if (addrEl && profile.address) addrEl.textContent = profile.address;

  const fullAddrEl = document.getElementById("displayFullAddress");
  if (fullAddrEl && profile.address) {
    fullAddrEl.innerHTML = `<i class="fa-solid fa-location-pin gold-icon"></i> ${escapeHtml(profile.address)}`;
  }

  const mapFrame = document.getElementById("googleMapFrame");
  if (mapFrame && profile.address) {
    mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(profile.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  const tagLocation = document.getElementById("tagLocationDisplay");
  if (tagLocation) {
    tagLocation.textContent = (profile.city || "Karod, Bhopal") + " 🇮🇳";
  }

  const instaCta = document.getElementById("heroInstagramCta");
  if (instaCta) {
    instaCta.href = profile.instagramUrl || "https://www.instagram.com/garv__x420/";
    const span = instaCta.querySelector("span");
    if (span) span.textContent = profile.instagram;
  }

  // Contact Us dynamic title & subtitle
  const contactTitleEl = document.getElementById("contactSectionTitle");
  if (contactTitleEl && profile.contactTitle) {
    contactTitleEl.innerHTML = escapeHtml(profile.contactTitle);
  }

  const contactDescEl = document.getElementById("contactSectionDesc");
  if (contactDescEl && profile.contactSubtitle) {
    contactDescEl.textContent = profile.contactSubtitle;
  }
}

// Render showcase & project cards
function renderPublicCards() {
  const cards = getStoredCards();
  const showcaseGrid = document.getElementById("showcaseGalleryGrid");
  const projectsGrid = document.getElementById("projectsListGrid");

  if (showcaseGrid) {
    const showcases = cards.filter(c => c.type === "showcase");
    showcaseGrid.innerHTML = showcases.map(item => `
      <div class="showcase-card" data-tilt-3d="true">
        <div class="showcase-thumb-wrap">
          <img src="${item.image}" alt="${escapeHtml(item.title)}" class="showcase-img" loading="lazy">
          <span class="showcase-tag-pill">${escapeHtml(item.category)}</span>
        </div>
        <div class="showcase-content">
          <h3 class="showcase-title">${escapeHtml(item.title)}</h3>
          <p class="showcase-desc">${escapeHtml(item.description)}</p>
          <div class="showcase-footer">
            <span class="text-dim text-xs"><i class="fa-brands fa-instagram"></i> @garv__x420</span>
            <a href="${item.link || 'https://www.instagram.com/garv__x420/'}" target="_blank" rel="noopener noreferrer" class="showcase-link">
              <span>View Detail</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        </div>
      </div>
    `).join("");
  }

  if (projectsGrid) {
    const projects = cards.filter(c => c.type === "project");
    projectsGrid.innerHTML = projects.map(item => `
      <div class="project-card" data-tilt-3d="true">
        <div class="project-icon">
          <i class="fa-solid ${item.icon || 'fa-layer-group'}"></i>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        <div class="project-tags">
          ${(item.tags || [item.category]).map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join("")}
        </div>
        <div class="showcase-footer mt-auto">
          <a href="${item.link || '#contact'}" class="btn btn-xs btn-glass-secondary">
            <span>Learn More</span> <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `).join("");
  }

  // Re-attach 3D tilt engine to newly rendered cards
  initTiltEffect();
}

// Utility: escape HTML
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Toast System
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "fa-circle-info";
  if (type === "success") icon = "fa-circle-check";
  if (type === "error") icon = "fa-circle-exclamation";

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

// Typing Effect
function initTypingEffect() {
  const textElement = document.getElementById("typingText");
  if (!textElement) return;

  const roles = [
    "Class 9 Student & Scholar",
    "Digital Creator (@garv__x420)",
    "Tech & Web Enthusiast",
    "Future Software Innovator",
    "Visual Aesthetics Curationist"
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function type() {
    const current = roles[roleIdx];

    if (isDeleting) {
      textElement.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 45;
    } else {
      textElement.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIdx === current.length) {
      typingSpeed = 1800; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingSpeed = 400; // Pause before typing next word
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

// High-Performance 3D Tilt Engine for All Interactive Cards & Displays (Lag-Free & Optimized)
function initTiltEffect() {
  // Disable completely on touch devices to ensure native silky-smooth scrolling
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const tiltElements = document.querySelectorAll(
    '[data-tilt-3d="true"], .about-card, .skill-card, .contact-info-card, .contact-form-card'
  );

  tiltElements.forEach(el => {
    if (el.dataset.tiltAttached === "true") return;
    el.dataset.tiltAttached = "true";

    let rect = null;
    let ticking = false;

    el.addEventListener("mouseenter", () => {
      rect = el.getBoundingClientRect();
      el.style.transition = "transform 0.08s ease-out";
    });

    el.addEventListener("mousemove", (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!rect) return;
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -10;
          const rotateY = ((x - centerX) / centerX) * 10;

          el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) scale3d(1.02, 1.02, 1.02)`;
          ticking = false;
        });
        ticking = true;
      }
    });

    el.addEventListener("mouseleave", () => {
      rect = null;
      el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    });
  });
}

// Custom Cursor Glow Follower - Hardware Accelerated
function initCursorGlow() {
  const glow = document.getElementById("cursorGlow");
  if (!glow) return;

  // Disable on touch devices
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    glow.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let isMoving = false;
  let moveTimeout;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(animate);
    }
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
      isMoving = false;
    }, 1500);
  }, { passive: true });

  function animate() {
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;

    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

    const dist = Math.abs(mouseX - currentX) + Math.abs(mouseY - currentY);
    if (isMoving || dist > 0.5) {
      requestAnimationFrame(animate);
    }
  }
}

// Header Scroll & Nav Active Tracker
function initHeaderAndNav() {
  const header = document.getElementById("siteHeader");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Scroll spy
    let current = "";
    const scrollPos = window.scrollY + 200;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // Mobile menu toggle
  const mobileBtn = document.getElementById("mobileMenuToggle");
  const navMenu = document.getElementById("navMenu");
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener("click", () => {
      navMenu.classList.toggle("open");
      const icon = mobileBtn.querySelector("i");
      if (navMenu.classList.contains("open")) {
        icon.className = "fa-solid fa-xmark";
      } else {
        icon.className = "fa-solid fa-bars-staggered";
      }
    });

    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        const icon = mobileBtn.querySelector("i");
        if (icon) icon.className = "fa-solid fa-bars-staggered";
      });
    });
  }
}

// Contact Form Handler
function initContactForm() {
  const form = document.getElementById("contactUsForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("contactSubmitBtn");
    const btnText = submitBtn.querySelector(".btn-text");
    const spinner = submitBtn.querySelector(".spinner-icon");

    const name = document.getElementById("senderName").value.trim();
    const email = document.getElementById("senderEmail").value.trim();
    const phone = document.getElementById("senderPhone").value.trim();
    const subject = document.getElementById("msgSubject").value.trim();
    const message = document.getElementById("senderMessage").value.trim();

    if (!name || !email || !message) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    // Show sending state
    btnText.classList.add("d-none");
    spinner.classList.remove("d-none");
    submitBtn.disabled = true;

    // Simulate sending delay for high luxury feel
    setTimeout(() => {
      const newMsg = {
        id: "msg_" + Date.now(),
        name,
        email,
        phone: phone || "Not provided",
        subject,
        message,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Store in messages DB
      const existingMsgs = JSON.parse(localStorage.getItem("garv_messages") || "[]");
      existingMsgs.unshift(newMsg);
      localStorage.setItem("garv_messages", JSON.stringify(existingMsgs));

      // Trigger visitor telemetry logging
      if (window.GarvAdmin && typeof window.GarvAdmin.logVisitorAction === "function") {
        window.GarvAdmin.logVisitorAction(`Submitted Inquiry: "${subject}" by ${name}`);
        window.GarvAdmin.refreshDashboardStats();
      }

      // Reset form
      form.reset();
      btnText.classList.remove("d-none");
      spinner.classList.add("d-none");
      submitBtn.disabled = false;

      showToast(`Thank you, ${name}! Your message has reached Garv's inbox.`, "success");
    }, 800);
  });
}

// Set Current Year in Footer
function setYear() {
  const el = document.getElementById("currentYear");
  if (el) el.textContent = new Date().getFullYear();
}

// ================= ID STORE DATA & PUBLIC RENDERER =================
const DEFAULT_STORE_ITEMS = [
  {
    id: "id_bgmi_01",
    category: "bgmi",
    badge: "BGMI Mobile",
    icon: "fa-crosshairs gold-icon",
    title: "BGMI Glacier M416 Max (Lvl 7) • 3 X-Suits • Ace Dominator",
    specs: ["Glacier M416 Max", "Pharaoh X-Suit", "Mythic Fashion", "KD 5.2 • Ace Dom"],
    price: 5999,
    status: "available",
    image: "assets/images/bgmi.jpg",
    loginType: "Twitter / Play Games Handover",
    description: "Elite competitive BGMI account with full Glacier kill message, on-hit effect, crate loot box, and high tier lobby skins."
  },
  {
    id: "id_gmail_01",
    category: "gmail",
    badge: "Vintage Gmail",
    icon: "fa-envelope gold-icon",
    title: "Vintage 2011 Aged Gmail ID • High Trust Score • Clean History",
    specs: ["Aged 2011 Account", "Zero Strikes", "OG Security Setup", "Google Play Tier"],
    price: 1499,
    status: "available",
    image: "assets/images/gmail.jpg",
    loginType: "Full Email & Recovery Number Handover",
    description: "15+ years vintage aged Gmail account. Perfect for developers, high deliverability marketing, AdSense, or premium personal handle."
  },
  {
    id: "id_freefire_01",
    category: "freefire",
    badge: "Free Fire Max",
    icon: "fa-fire text-rose",
    title: "Free Fire Level 74 • Sakura Bundle + 7 EVO Guns Max",
    specs: ["Lvl 74", "Sakura & Hip Hop", "7 EVO Guns Max", "Master Rank"],
    price: 3499,
    status: "available",
    image: "assets/images/freefire.jpg",
    loginType: "Google / FB Bound",
    description: "Ultra-rare collector account with Sakura bundle, 7 Max EVO guns (AK, MP40, M1014), exclusive emotes, and safe transfer guarantee."
  },
  {
    id: "id_insta_01",
    category: "instagram",
    badge: "Instagram Account",
    icon: "fa-brands fa-instagram text-purple",
    title: "Aesthetic Luxury Lifestyle Niche • 18.5K Followers",
    specs: ["18.5K Followers", "9.2% Engagement", "Clean History", "OGE Included"],
    price: 2199,
    status: "available",
    image: "assets/images/insta1.jpg",
    loginType: "Original Email Handover",
    description: "High-engagement aesthetic photography and reels account. Ready for monetization, sponsorships, or personal rebranding."
  },
  {
    id: "id_coc_01",
    category: "coc",
    badge: "Clash of Clans",
    icon: "fa-shield-halved text-cyan",
    title: "Town Hall 16 Near Max • Level 240+ with 6500 Gems",
    specs: ["TH16", "Heroes 90/90/65/40", "6,500+ Gems", "6 Builders"],
    price: 4499,
    status: "available",
    image: "assets/images/coc.jpg",
    loginType: "Supercell ID Direct Transfer",
    description: "Max defense, high-level heroes, champion league war stars, and free name change available. Instant Supercell ID email handover."
  }
];

function getStoredStoreItems() {
  const deletedIds = JSON.parse(localStorage.getItem("garv_deleted_store_ids") || "[]");
  // Blacklist any deleted IDs plus the duplicate secondary BGMI & Gmail accounts
  const blacklist = new Set([...deletedIds, "id_bgmi_02", "id_gmail_02"]);

  const saved = localStorage.getItem("garv_store_items");
  if (!saved) {
    const initial = DEFAULT_STORE_ITEMS.filter(it => !blacklist.has(it.id));
    localStorage.setItem("garv_store_items", JSON.stringify(initial));
    return initial;
  }
  try {
    let list = JSON.parse(saved);
    // Purge any blacklisted or deleted IDs immediately
    list = list.filter(it => !blacklist.has(it.id));

    // Ensure default items exist ONLY if they were never deleted
    DEFAULT_STORE_ITEMS.forEach(def => {
      if (blacklist.has(def.id)) return;
      const existing = list.find(it => it.id === def.id);
      if (!existing) {
        list.push(def);
      } else {
        if (def.image && existing.image === "assets/images/setup.jpg" && def.category === "bgmi") {
          existing.image = def.image;
        }
      }
    });

    localStorage.setItem("garv_store_items", JSON.stringify(list));
    return list;
  } catch (e) {
    return DEFAULT_STORE_ITEMS.filter(it => !blacklist.has(it.id));
  }
}

function renderPublicStore(filter = "all") {
  const grid = document.getElementById("idStoreGrid");
  if (!grid) return;

  const items = getStoredStoreItems();
  const filtered = filter === "all" ? items : items.filter(it => it.category === filter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-ghost"></i>
        <h4>No Accounts Listed in this Category</h4>
        <p>Check back soon or request an account directly on WhatsApp at +91 9691947952.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const isAvailable = item.status === "available";
    const statusText = item.status === "available" ? "AVAILABLE" : (item.status === "reserved" ? "RESERVED" : "SOLD OUT");
    const waUrl = `https://wa.me/919691947952?text=Hi%20Garv,%20I%20want%20to%20buy%20the%20${encodeURIComponent(item.title)}%20(Price:%20₹${item.price}).%20Please%20share%20payment%20and%20transfer%20details.`;

    return `
      <div class="id-card" data-tilt-3d="true">
        <div class="id-thumb-wrapper">
          <img src="${item.image || 'assets/images/freefire.jpg'}" alt="${escapeHtml(item.title)}" class="id-thumb-img" loading="lazy">
          <span class="id-platform-tag">
            <i class="fa-solid ${item.icon || 'fa-gamepad'}"></i> ${escapeHtml(item.badge || item.category.toUpperCase())}
          </span>
          <span class="id-status-badge ${item.status}">
            ${statusText}
          </span>
        </div>

        <div class="id-card-body">
          <h3 class="id-title">${escapeHtml(item.title)}</h3>
          
          <div class="id-specs-bar">
            ${(item.specs || []).map(s => `<span class="id-spec-chip"><i class="fa-solid fa-check gold-icon"></i> ${escapeHtml(s)}</span>`).join("")}
          </div>

          <p class="id-description">${escapeHtml(item.description)}</p>

          <div class="id-pricing-row">
            <div class="id-price-box">
              <span class="price-label">Price</span>
              <span class="price-amount">₹${Number(item.price).toLocaleString('en-IN')}</span>
            </div>

            ${isAvailable ? `
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-buy-wa">
                <i class="fa-brands fa-whatsapp"></i> Buy on WhatsApp
              </a>
            ` : `
              <button class="btn btn-buy-wa disabled">
                <i class="fa-solid fa-lock"></i> ${statusText}
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Re-attach 3D tilt
  if (typeof initTiltEffect === "function") initTiltEffect();
}

function initStoreFilters() {
  const filterBtns = document.querySelectorAll(".store-filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter") || "all";
      renderPublicStore(filter);
    });
  });
}

window.renderPublicStore = renderPublicStore;
window.getStoredStoreItems = getStoredStoreItems;

// Document Ready Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderPublicProfile();
  renderPublicCards();
  renderPublicStore();
  initStoreFilters();
  initTypingEffect();
  initTiltEffect();
  initCursorGlow();
  initHeaderAndNav();
  initContactForm();
  setYear();
});
