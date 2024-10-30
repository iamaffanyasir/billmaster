document.addEventListener('DOMContentLoaded', () => {
    console.log('Theme script loaded');
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme');
    console.log('Current theme:', currentTheme);
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Theme switch handler
    themeToggle.addEventListener('click', function() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        console.log('Switching theme. isDark:', isDark);
        
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}); 