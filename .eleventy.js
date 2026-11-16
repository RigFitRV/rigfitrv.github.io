module.exports = function(eleventyConfig) {
  // Pass static assets directly through to the final build (_site)
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("data");

  // Helper filter to look up product details by gearKey from products.json
  eleventyConfig.addFilter("getProduct", function(products, gearKey) {
    if (!products || !gearKey) return null;
    return products[gearKey] || null;
  });

  // Helper filter to group campgrounds by state for static state pages
  eleventyConfig.addFilter("uniqueStates", function(campgrounds) {
    if (!Array.isArray(campgrounds)) return [];
    const states = [...new Set(campgrounds.map(c => c.state).filter(Boolean))];
    return states.sort();
  });

  // Helper filter to filter campgrounds belonging to a specific state
  eleventyConfig.addFilter("byState", function(campgrounds, stateCode) {
    if (!Array.isArray(campgrounds)) return [];
    return campgrounds.filter(c => c.state === stateCode);
  });

  return {
    dir: {
      input: "src",          // Where your master templates live
      includes: "_includes", // Where header.html and footer.html live (never published standalone!)
      data: "../data",       // Points directly to your existing /data/ folder!
      output: "_site"        // Compiled static HTML output ready for Cloudflare
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk"
  };
};
