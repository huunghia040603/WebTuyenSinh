// Debug script for tracking system
console.log('🔍 Debug Tracking System');

// Test tracking endpoint
async function testTrackingEndpoint() {
    console.log('🧪 Testing tracking endpoint...');
    
    try {
        const response = await fetch('https://timtruonghoc.pythonanywhere.com/tracking/increment-major-view/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                major_id: 1 // Test with ID 1
            })
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', response.headers);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Tracking successful:', result);
        } else {
            const errorText = await response.text();
            console.error('❌ Tracking failed:', errorText);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

// Test statistics endpoint
async function testStatisticsEndpoint() {
    console.log('🧪 Testing statistics endpoint...');
    
    try {
        const response = await fetch('https://timtruonghoc.pythonanywhere.com/tracking/statistics/');
        
        console.log('📊 Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Statistics loaded:', result);
        } else {
            const errorText = await response.text();
            console.error('❌ Statistics failed:', errorText);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

// Test top majors endpoint
async function testTopMajorsEndpoint() {
    console.log('🧪 Testing top majors endpoint...');
    
    try {
        const response = await fetch('https://timtruonghoc.pythonanywhere.com/tracking/top-majors/?limit=5');
        
        console.log('📊 Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Top majors loaded:', result);
        } else {
            const errorText = await response.text();
            console.error('❌ Top majors failed:', errorText);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running all tracking tests...');
    
    await testTrackingEndpoint();
    await testStatisticsEndpoint();
    await testTopMajorsEndpoint();
    
    console.log('✅ All tests completed');
}

// Auto-run tests if this script is loaded
if (typeof window !== 'undefined') {
    // Wait a bit for page to load
    setTimeout(runAllTests, 2000);
}

// Export functions for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testTrackingEndpoint,
        testStatisticsEndpoint,
        testTopMajorsEndpoint,
        runAllTests
    };
} 