document.addEventListener('DOMContentLoaded', () => {
  const pageId = document.body.getAttribute('data-campground-id');
  if (!pageId) return;

  // Fetch both campgrounds and the central products catalog simultaneously
  Promise.all([
    fetch('../data/campgrounds.json').then(res => res.json()),
    fetch('../data/products.json').then(res => res.json())
  ])
    .then(([campgrounds, productsCatalog]) => {
      const data = campgrounds.find(c => c.id === pageId);
      if (!data) return;

      // Populate Head Title & Description
      document.title = `${data.name} RV Guide - RigFitRV`;

      // Populate Header & Info Table
      const pageTitle = document.getElementById('camp-title');
      if (pageTitle) pageTitle.textContent = `${data.name} RV Guide: Rig Clearance, Loop Fit & Toad Maneuverability`;

      const infoTable = document.getElementById('camp-info-table');
      if (infoTable) {
        infoTable.innerHTML = `
          <tr><td>🏷️ Ownership Type</td><td><strong>${data.ownertype || 'Public / State Park'}</strong></td></tr>
          <tr><td>📍 Physical Address</td><td>${data.address || ''}</td></tr>
          <tr><td>🌐 GPS Coordinates</td><td><code>${data.gps || ''}</code></td></tr>
          <tr><td>📞 Phone Number</td><td><a href="tel:${(data.phone || '').replace(/[^0-9]/g, '')}">${data.phone || ''}</a></td></tr>
          <tr><td>🔗 Official Website</td><td><a href="${data.website || '#'}" target="_blank" rel="noopener">${data.websiteLabel || data.name}</a></td></tr>
        `;
      }

      // Populate Rig-Fit Scorecard
      const scorecard = document.getElementById('camp-scorecard');
      if (scorecard && data.scorecard) {
        scorecard.innerHTML = `
          <ul>
            <li><strong>Recommended Max Rig Length:</strong> ${data.scorecard.maxRigLength || 'N/A'}</li>
            <li><strong>Toad / Towed Vehicle Friendliness:</strong> ${data.scorecard.toadFriendliness || 'N/A'}</li>
            <li><strong>Tree Clearance Warning:</strong> ${data.scorecard.treeClearance || 'N/A'}</li>
            <li><strong>Best Loops for Big Rigs:</strong> ${data.scorecard.bestBigRigLoops || 'N/A'}</li>
            <li><strong>Best Loops for Smaller Units:</strong> ${data.scorecard.bestSmallRigLoops || 'N/A'}</li>
          </ul>
        `;
      }

      // Reusable Affiliate Box Generator Helper (combines catalog product info with campground-specific reason)
      function createAffiliateBox(recommendedGearObj) {
        if (!recommendedGearObj || !recommendedGearObj.gearKey) return '';
        const catalogItem = productsCatalog[recommendedGearObj.gearKey];
        if (!catalogItem) return '';

        return `
          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 1.25rem; border-radius: 6px; margin: 1.25rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <h4 style="margin: 0 0 0.5rem 0; color: #0f172a; font-size: 1.01rem;">⚙️ ${catalogItem.title || 'Recommended Gear'}</h4>
            <p style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #334155; line-height: 1.5;">
              <strong>Recommended Setup:</strong> <a href="${catalogItem.affiliateUrl}" target="_blank" rel="nofollow noopener" style="color: #2563eb; font-weight: bold; text-decoration: underline;">${catalogItem.productName}</a> — ${recommendedGearObj.reason}
            </p>
            <span style="font-size: 0.78rem; color: #64748b; font-style: italic;">RigFitRV is reader-supported. We may earn an affiliate commission from qualifying purchases made through our links.</span>
          </div>
        `;
      }

      // 1. Populate Approach & Routing Section
      const approachSection = document.getElementById('camp-approach-section');
      if (approachSection && data.approach) {
        const approachGearHtml = createAffiliateBox(data.approach.recommendedGear);
        approachSection.innerHTML = `
          <h2>🚧 Approach & Routing Warning</h2>
          <p>${data.approach.text}</p>
          ${approachGearHtml}
        `;
      }

      // 2. Populate Toad Unhook Strategy Section
      const toadStrategyEl = document.getElementById('camp-toad-strategy');
      if (toadStrategyEl && data.toadStrategy) {
        const toadText = typeof data.toadStrategy === 'object' ? data.toadStrategy.text : data.toadStrategy;
        const toadGearHtml = typeof data.toadStrategy === 'object' ? createAffiliateBox(data.toadStrategy.recommendedGear) : '';
        toadStrategyEl.innerHTML = `
          <p>${toadText}</p>
          ${toadGearHtml}
        `;
      }

      // 3. Populate Overview & Campsite Details
      const overview = document.getElementById('camp-overview');
      if (overview && data.content) {
        const overviewGearHtml = createAffiliateBox(data.content.recommendedGear);

        overview.innerHTML = `
          ${data.image ? `<img src="${data.image}" alt="${data.name} Campsite" style="max-height: 380px; object-fit: cover; width: 100%; border-radius: 8px; margin-bottom: 1.5rem;">` : ''}
          <p>${data.content.overview || ''}</p>
          ${overviewGearHtml}
          
          <h3>Big-Rig & Loop Guidance</h3>
          <p>${data.content.loopC || ''}</p>
          
          <h3>Tight Turns & Small Unit Loops</h3>
          <p>${data.content.loopsAB || ''}</p>

          ${data.mapImage ? `
            <hr>
            <h2>🗺️ Official Campground Layout Map</h2>
            <img src="${data.mapImage}" alt="${data.name} Map" style="width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 1rem;">
          ` : ''}
        `;
      }

      // INJECT JSON-LD SCHEMA FOR GOOGLE RICH RESULTS
      injectCampgroundSchema(data);

      // RENDER NEARBY CAMPGROUND CARDS (Distance-based)
      renderRelatedCampgrounds(data, campgrounds);

    })
    .catch(err => console.error('Error loading campground or product data:', err));
});

// Automatically inject JSON-LD Schema for Google Rich Snippets
function injectCampgroundSchema(data) {
  const lat = parseFloat(data.lat || data.latitude);
  const lng = parseFloat(data.lng || data.longitude);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Campground",
    "name": data.name,
    "description": data.summary || "",
    "url": window.location.href,
    "telephone": data.phone || "",
    "additionalType": data.ownertype === "State Park" 
      ? "https://schema.org/GovernmentPermit" 
      : "https://schema.org/LocalBusiness",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.address || "",
      "addressLocality": data.city || "",
      "addressRegion": data.state || "",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": isNaN(lat) ? "" : lat,
      "longitude": isNaN(lng) ? "" : lng
    },
    "image": data.image ? `https://rigfitrv.com${data.image}` : "",
    "sameAs": data.website || ""
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Calculates straight-line distance in miles between two coordinates (Haversine Formula)
 */
function getDistanceInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Renders the 3 physically closest campgrounds with "miles away" badges
 * @param {Object} currentCampground - The currently displayed park object
 * @param {Array} allCampgrounds - Full list of campgrounds from campgrounds.json
 */
function renderRelatedCampgrounds(currentCampground, allCampgrounds) {
  const container = document.getElementById('related-campgrounds');
  const grid = document.getElementById('related-cards-grid');

  if (!container || !grid) return;

  const currentLat = parseFloat(currentCampground.lat || currentCampground.latitude);
  const currentLng = parseFloat(currentCampground.lng || currentCampground.longitude);

  if (isNaN(currentLat) || isNaN(currentLng)) {
    console.warn('Current campground missing valid coordinates for distance calculation');
    return;
  }

  const nearbyList = allCampgrounds
    .filter(park => {
      if (park.id === currentCampground.id) return false;
      const pLat = parseFloat(park.lat || park.latitude);
      const pLng = parseFloat(park.lng || park.longitude);
      return !isNaN(pLat) && !isNaN(pLng);
    })
    .map(park => {
      const pLat = parseFloat(park.lat || park.latitude);
      const pLng = parseFloat(park.lng || park.longitude);
      const miles = getDistanceInMiles(currentLat, currentLng, pLat, pLng);
      return { ...park, distanceMiles: Math.round(miles) };
    })
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, 2);

  if (nearbyList.length === 0) return;

  grid.innerHTML = nearbyList.map(park => `
    <div class="campground-card">
      <div class="card-badge distance-badge">${park.distanceMiles} miles away</div>
      <img src="${park.image || '/images/placeholder.jpg'}" alt="${park.name}" class="card-image" loading="lazy">
      <div class="card-content">
        <h3 class="card-title">${park.name}</h3>
        <p class="card-location"><i class="fas fa-map-marker-alt"></i> ${park.city || ''}, ${park.state || ''}</p>
        <div class="card-meta">
          <span><strong>Max Length:</strong> ${park.scorecard?.maxRigLength || 'See Guide'}</span>
        </div>
        <a href="/c/${park.id}.html" class="btn btn-outline">View Rig-Fit Guide</a>
      </div>
    </div>
  `).join('');

  container.classList.remove('hidden');
}

// Ensure Canonical Link points cleanly to HTTPS canonical URL
let canonicalLink = document.querySelector("link[rel='canonical']");
if (!canonicalLink) {
  canonicalLink = document.createElement('link');
  canonicalLink.setAttribute('rel', 'canonical');
  document.head.appendChild(canonicalLink);
}
canonicalLink.setAttribute('href', `https://rigfitrv.com/c/${pageId}.html`);

// Append technical pillar cross-links directly into the approach container
const approachSection = document.getElementById('camp-approach-section');
if (approachSection) {
  const techLinkBlock = document.createElement('div');
  techLinkBlock.className = 'tech-pillar-callout';
  techLinkBlock.style.cssText = 'margin-top: 1rem; padding: 0.75rem; background: #f1f5f9; border-left: 4px solid #0066cc; border-radius: 0 4px 4px 0; font-size: 0.9rem;';
  techLinkBlock.innerHTML = `
    <strong>Planning Your Setup?</strong> Check our technical deep dives for 
    <a href="../g/rv-towing-routing.html" style="color: #0066cc; font-weight: bold;">Towing Clearance</a>, 
    <a href="../g/rv-electrical-power-management.html" style="color: #0066cc; font-weight: bold;">Electrical EMS Protection</a>, and 
    <a href="../g/rv-water-plumbing-management.html" style="color: #0066cc; font-weight: bold;">Water Pressure Regulation</a>.
  `;
  approachSection.appendChild(techLinkBlock);
}

// Dynamic Technical Pillar Callout Injector
document.addEventListener('DOMContentLoaded', () => {
  const approachContainer = document.getElementById('camp-approach-section') || document.getElementById('camp-scorecard');
  
  if (approachContainer && !document.getElementById('tech-pillar-callout-box')) {
    const techBox = document.createElement('div');
    techBox.id = 'tech-pillar-callout-box';
    techBox.style.cssText = 'margin: 1.5rem 0; padding: 1.25rem; background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 5px solid #0066cc; border-radius: 6px;';
    
    techBox.innerHTML = `
      <h3 style="margin-top: 0; font-size: 1.1rem; color: #1e293b; display: flex; align-items: center; gap: 0.5rem;">
        🛠️ Verified Rig-Fit Utility & Systems Check
      </h3>
      <p style="font-size: 0.9rem; color: #475569; margin: 0.4rem 0 0.8rem 0; line-height: 1.4;">
        Ensure your rig is prepped for regional access roads, electrical grid demands, and water connections before arrival:
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.85rem; font-weight: bold;">
        <a href="../g/rv-towing-routing.html" style="color: #0066cc; text-decoration: none; background: #ffffff; border: 1px solid #cbd5e1; padding: 0.4rem 0.75rem; border-radius: 4px;">
          🚛 Clearance & Towing Guide →
        </a>
        <a href="../g/rv-electrical-power-management.html" style="color: #d97706; text-decoration: none; background: #ffffff; border: 1px solid #cbd5e1; padding: 0.4rem 0.75rem; border-radius: 4px;">
          ⚡ Power & Surge Protection →
        </a>
        <a href="../g/rv-water-plumbing-management.html" style="color: #059669; text-decoration: none; background: #ffffff; border: 1px solid #cbd5e1; padding: 0.4rem 0.75rem; border-radius: 4px;">
          💧 Water Pressure & Plumbing →
        </a>
      </div>
    `;
    
    approachContainer.parentNode.insertBefore(techBox, approachContainer.nextSibling);
  }
});
