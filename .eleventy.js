module.exports = function(eleventyConfig) {
  // Pass existing root pages and static assets straight through to _site
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("data");

  // Look up product details by gearKey from products.json
  eleventyConfig.addFilter("getProduct", function(products, gearKey) {
    if (!products || !gearKey) return null;
    return products[gearKey] || null;
  });

  // Look up a specific campground object by id from campgrounds.json
  eleventyConfig.addFilter("findCampground", function(campgrounds, id) {
    if (!Array.isArray(campgrounds) || !id) return null;
    return campgrounds.find(c => c.id === id) || null;
  });

  // Get sorted list of unique 2-letter state codes from campgrounds.json
  eleventyConfig.addFilter("uniqueStates", function(campgrounds) {
    if (!Array.isArray(campgrounds)) return [];
    const states = [...new Set(campgrounds.map(c => c.state).filter(Boolean))];
    return states.sort();
  });

  // Filter campgrounds belonging to a specific state code
  eleventyConfig.addFilter("byState", function(campgrounds, stateCode) {
    if (!Array.isArray(campgrounds)) return [];
    return campgrounds.filter(c => c.state === stateCode);
  });

  // Convert state code to lowercase for clean URLs (e.g., PA -> pa)
  eleventyConfig.addFilter("lower", function(str) {
    return str ? String(str).toLowerCase() : "";
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "../data",
      output: "_site"
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk"
  };
};
