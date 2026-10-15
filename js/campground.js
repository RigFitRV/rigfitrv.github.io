document.addEventListener('DOMContentLoaded', () => {
  const pageId = document.body.getAttribute('data-campground-id');
  if (!pageId) return;

  fetch('../data/campgrounds.json')
    .then(response => response.json())
    .then(campgrounds => {
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

      // Reusable Affiliate Box Generator Helper
      function createAffiliateBox(gear) {
        return `
          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 1.25rem; border-radius: 6px; margin: 1.25rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <h4 style="margin: 0 0 0.5rem 0; color: #0f172a; font-size: 1.01rem;">⚙️ ${gear.title || 'Recommended Gear'}</h4>
            <p style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #334155; line-height: 1.5;">
              <strong>Recommended Setup:</strong> <a href="${gear.affiliateUrl}" target="_blank" rel="nofollow noopener" style="color: #2563eb; font-weight: bold; text-decoration: underline;">${gear.productName}</a> — ${gear.reason}
            </p>
            <span style="font-size: 0.78rem; color: #64748b; font-style: italic;">RigFitRV is reader-supported. We may earn an affiliate commission from qualifying purchases made through our links.</span>
          </div>
        `;
      }

      // 1. Populate Approach & Routing Section (GPS Ads)
      const approachSection = document.getElementById('camp-approach-section');
      if (approachSection && data.approach) {
        let approachGearHtml = '';
        if (data.approach.recommendedGear) {
          approachGearHtml = createAffiliateBox(data.approach.recommendedGear);
        }
        approachSection.innerHTML = `
          <h2>🚧 Approach & Routing Warning</h2>
          <p>${data.approach.text}</p>
          ${approachGearHtml}
        `;
      }

      // 2. Populate Toad Unhook Strategy Section (Towing/Tow Bar/Hitch Ads ONLY)
      const toadStrategyEl = document.getElementById('camp-toad-strategy');
      if (toadStrategyEl && data.toadStrategy) {
        let toadGearHtml = '';
        if (data.recommendedGear && 
           (data.recommendedGear.title.toLowerCase().includes('towing') || 
            data.recommendedGear.title.toLowerCase().includes('tow bar') || 
            data.recommendedGear.title.toLowerCase().includes('hitch'))) {
          toadGearHtml = createAffiliateBox(data.recommendedGear);
        }
        toadStrategyEl.innerHTML = `
          <p>${data.toadStrategy}</p>
          ${toadGearHtml}
        `;
      }

      // 3. Populate Overview & Campsite Details (Leveling Blocks & Wheel Chocks Ads)
      const overview = document.getElementById('camp-overview');
      if (overview && data.content) {
        let overviewGearHtml = '';
        
        const overviewGear = data.content.recommendedGear || 
          (data.recommendedGear && 
           (data.recommendedGear.title.toLowerCase().includes('leveling') || 
            data.recommendedGear.title.toLowerCase().includes('chock') || 
            data.recommendedGear.title.toLowerCase().includes('stabilization')) 
           ? data.recommendedGear : null);

        if (overviewGear) {
          overviewGearHtml = createAffiliateBox(overviewGear);
        }

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
    .catch(err => console.error('Error loading campground data:', err));
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

  // Extract latitude & longitude safely (supports lat/lng OR latitude/longitude, string or number)
  const currentLat = parseFloat(currentCampground.lat || currentCampground.latitude);
  const currentLng = parseFloat(currentCampground.lng || currentCampground.longitude);

  if (isNaN(currentLat) || isNaN(currentLng)) {
    console.warn('Current campground missing valid coordinates for distance calculation');
    return;
  }

  // 1. Exclude current park & calculate distance for all remaining parks
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
    .sort((a, b) => a.distanceMiles - b.distanceMiles) // Sort closest first
    .slice(0, 3); // Pick top 3 closest

  if (nearbyList.length === 0) return;

  // 2. Build HTML cards with distance badge
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

  // 3. Reveal section
  container.classList.remove('hidden');
}
