// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle.classList.contains('active')) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    });

    // 2. Navbar Background on Scroll
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 14, 23, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(10, 14, 23, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });

    // 3. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Account for fixed navbar height
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Number Counter Animation
    const animateValue = (obj, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    animateValue(stat, 0, target, 2000); // 2 seconds duration
                });
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // 5. Fetch Medium Articles
    const mediumArticlesContainer = document.getElementById('medium-articles');
    if (mediumArticlesContainer) {
        const mediumFeedUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@janith.chandula';
        
        fetch(mediumFeedUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok' && data.items.length > 0) {
                    mediumArticlesContainer.innerHTML = ''; // Clear loading state
                    
                    // Show up to 3 articles
                    const articles = data.items.slice(0, 3);
                    
                    articles.forEach(item => {
                        // Extract first paragraph for excerpt
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = item.description;
                        const firstParagraph = tempDiv.querySelector('p') ? tempDiv.querySelector('p').textContent : tempDiv.textContent.substring(0, 150) + '...';
                        
                        // Format date
                        const pubDate = new Date(item.pubDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                        
                        // Extract image
                        let imageUrl = item.thumbnail;
                        if (!imageUrl) {
                            const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                            imageUrl = imgMatch ? imgMatch[1] : 'assets/hero.png';
                        }

                        const articleCard = `
                            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="blog-card">
                                <img src="${imageUrl}" alt="${item.title}" class="blog-image">
                                <div class="blog-content">
                                    <span class="blog-date">${pubDate}</span>
                                    <h3 class="blog-title">${item.title}</h3>
                                    <p class="blog-excerpt">${firstParagraph}</p>
                                    <span class="blog-read-more">Read Article <i class="ph ph-arrow-right"></i></span>
                                </div>
                            </a>
                        `;
                        mediumArticlesContainer.innerHTML += articleCard;
                    });
                } else {
                    mediumArticlesContainer.innerHTML = '<p class="blog-loading">No articles found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching Medium articles:', error);
                mediumArticlesContainer.innerHTML = '<p class="blog-loading">Failed to load articles. Please visit Medium to read my latest posts.</p>';
            });
    }

});
