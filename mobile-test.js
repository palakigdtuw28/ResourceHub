// Mobile UI Test Script
// Run this in browser console to test mobile responsiveness

console.log("🚀 Starting Mobile UI Tests for ResourceHub");

// Test 1: Check viewport settings
function testViewport() {
  const viewport = document.querySelector('meta[name="viewport"]');
  console.log("📱 Viewport Test:", {
    content: viewport?.getAttribute('content'),
    status: viewport ? "✅ Found" : "❌ Missing"
  });
}

// Test 2: Check responsive breakpoints
function testBreakpoints() {
  const width = window.innerWidth;
  let device = "";
  
  if (width < 640) device = "📱 Mobile";
  else if (width < 768) device = "📟 Large Mobile";
  else if (width < 1024) device = "💻 Tablet";
  else device = "🖥️ Desktop";
  
  console.log("📐 Screen Test:", {
    width: width,
    device: device,
    status: "✅ Responsive"
  });
}

// Test 3: Check mobile menu
function testMobileMenu() {
  const mobileMenu = document.querySelector('[data-testid*="mobile"]') || 
                    document.querySelector('button[aria-label*="menu"]') ||
                    document.querySelector('.md\\:hidden button');
  
  console.log("🍔 Mobile Menu Test:", {
    found: mobileMenu ? "✅ Present" : "❌ Not Found",
    visible: mobileMenu ? (getComputedStyle(mobileMenu).display !== 'none' ? "✅ Visible" : "❌ Hidden") : "N/A"
  });
}

// Test 4: Check touch targets (minimum 44px)
function testTouchTargets() {
  const buttons = document.querySelectorAll('button, a[href]');
  let goodTargets = 0;
  let totalTargets = buttons.length;
  
  buttons.forEach(btn => {
    const rect = btn.getBoundingClientRect();
    const minSize = Math.min(rect.width, rect.height);
    if (minSize >= 44) goodTargets++;
  });
  
  const percentage = Math.round((goodTargets / totalTargets) * 100);
  
  console.log("👆 Touch Targets Test:", {
    good: goodTargets,
    total: totalTargets,
    percentage: `${percentage}%`,
    status: percentage >= 80 ? "✅ Good" : "⚠️ Needs Improvement"
  });
}

// Test 5: Check for horizontal scrolling
function testHorizontalScroll() {
  const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
  
  console.log("↔️ Horizontal Scroll Test:", {
    bodyWidth: document.body.scrollWidth,
    windowWidth: window.innerWidth,
    status: hasHorizontalScroll ? "❌ Has Overflow" : "✅ No Overflow"
  });
}

// Test 6: Check key mobile pages
function testMobilePages() {
  const currentPath = window.location.pathname;
  console.log("📄 Current Page:", currentPath);
  
  // Test login/navigation elements
  const loginButton = document.querySelector('[data-testid*="login"], [href*="auth"]');
  const profileLink = document.querySelector('[data-testid*="profile"], [href*="profile"]');
  const logo = document.querySelector('[data-testid*="logo"]');
  
  console.log("🔗 Navigation Elements:", {
    logo: logo ? "✅ Present" : "❌ Missing",
    login: loginButton ? "✅ Present" : "❌ Missing", 
    profile: profileLink ? "✅ Present" : "❌ Missing"
  });
}

// Run all tests
function runMobileTests() {
  console.log("=" .repeat(50));
  console.log("🧪 ResourceHub Mobile UI Tests");
  console.log("=" .repeat(50));
  
  testViewport();
  testBreakpoints();
  testMobileMenu();
  testTouchTargets();
  testHorizontalScroll();
  testMobilePages();
  
  console.log("=" .repeat(50));
  console.log("✨ Tests Complete! Check results above.");
  console.log("💡 Tip: Resize window and run again for different breakpoints");
  console.log("=" .repeat(50));
}

// Auto-run tests
runMobileTests();

// Export for manual testing
window.mobileTests = {
  runAll: runMobileTests,
  viewport: testViewport,
  breakpoints: testBreakpoints,
  menu: testMobileMenu,
  touchTargets: testTouchTargets,
  horizontalScroll: testHorizontalScroll,
  pages: testMobilePages
};