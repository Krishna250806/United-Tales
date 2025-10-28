// Main JavaScript for StoryCollab

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Auto-hide flash messages
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateX(100%)';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });

    // Character counter for textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        if (maxLength) {
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.style.cssText = 'text-align: right; font-size: 0.875rem; color: #666; margin-top: 0.5rem;';
            textarea.parentNode.appendChild(counter);
            
            function updateCounter() {
                const remaining = maxLength - textarea.value.length;
                counter.textContent = `${textarea.value.length}/${maxLength} characters`;
                counter.style.color = remaining < 50 ? '#dc3545' : '#666';
            }
            
            textarea.addEventListener('input', updateCounter);
            updateCounter();
        }
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#dc3545';
                    
                    // Remove error styling on input
                    field.addEventListener('input', function() {
                        this.style.borderColor = '#e1e5e9';
                    });
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Please fill in all required fields', 'error');
            }
        });
    });

    // Story contribution form toggle
    window.toggleContributionForm = function() {
        const form = document.getElementById('contribution-form');
        if (form) {
            const isVisible = form.style.display !== 'none';
            form.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                form.scrollIntoView({ behavior: 'smooth' });
                const textarea = form.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                }
            }
        }
    };

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Loading states for buttons
    const buttons = document.querySelectorAll('button[type="submit"], .btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.type === 'submit') {
                this.style.opacity = '0.7';
                this.style.cursor = 'not-allowed';
                
                // Re-enable after 3 seconds (in case of errors)
                setTimeout(() => {
                    this.style.opacity = '1';
                    this.style.cursor = 'pointer';
                }, 3000);
            }
        });
    });

    // Story card hover effects
    const storyCards = document.querySelectorAll('.story-card, .story-preview');
    storyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Search functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                // Auto-submit search after 1 second of no typing
                if (this.value.length > 2 || this.value.length === 0) {
                    this.form.submit();
                }
            }, 1000);
        });
    }

    // Genre filter enhancement
    const genreSelect = document.getElementById('genre');
    if (genreSelect) {
        genreSelect.addEventListener('change', function() {
            this.form.submit();
        });
    }

    // Story content preview truncation
    const storyPreviews = document.querySelectorAll('.story-preview p, .story-card-content p');
    storyPreviews.forEach(preview => {
        const text = preview.textContent;
        if (text.length > 200) {
            preview.textContent = text.substring(0, 200) + '...';
        }
    });

    // Admin table sorting (basic implementation)
    const tableHeaders = document.querySelectorAll('.admin-table th');
    tableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const table = this.closest('table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const columnIndex = Array.from(this.parentNode.children).indexOf(this);
            
            // Simple sorting (you might want to implement more sophisticated sorting)
            rows.sort((a, b) => {
                const aText = a.children[columnIndex].textContent.trim();
                const bText = b.children[columnIndex].textContent.trim();
                return aText.localeCompare(bText);
            });
            
            rows.forEach(row => tbody.appendChild(row));                    
        });
    });

    // Contribution status indicators
    const statusBadges = document.querySelectorAll('.status');
    statusBadges.forEach(badge => {
        const status = badge.textContent.toLowerCase();
        badge.className = `status status-${status}`;
    });

    // Auto-save for story creation (localStorage)
    const storyForm = document.querySelector('.create-story-form');
    if (storyForm) {
        const titleInput = storyForm.querySelector('input[name="title"]');
        const contentTextarea = storyForm.querySelector('textarea[name="content"]');
        
        // Load saved data
        if (titleInput) {
            titleInput.value = localStorage.getItem('story_title') || '';
        }
        if (contentTextarea) {
            contentTextarea.value = localStorage.getItem('story_content') || '';
        }
        
        // Save data on input
        if (titleInput) {
            titleInput.addEventListener('input', function() {
                localStorage.setItem('story_title', this.value);
            });
        }
        if (contentTextarea) {
            contentTextarea.addEventListener('input', function() {
                localStorage.setItem('story_content', this.value);
            });
        }
        
        // Clear saved data on successful submit
        storyForm.addEventListener('submit', function() {
            localStorage.removeItem('story_title');
            localStorage.removeItem('story_content');
        });
    }

    // Notification system
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Lazy loading for images (if any are added later)
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('search');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to close modals/forms
        if (e.key === 'Escape') {
            const contributionForm = document.getElementById('contribution-form');
            if (contributionForm && contributionForm.style.display !== 'none') {
                contributionForm.style.display = 'none';
            }
        }
    });

    // Initialize tooltips (if any are added)
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 0.875rem;
                z-index: 1000;
                pointer-events: none;
            `;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });

    // Enhanced delete confirmation
    const deleteButtons = document.querySelectorAll('a[href*="delete-story"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const storyTitle = this.closest('.story-item, .story-header')?.querySelector('h3 a, h1')?.textContent || 'this story';
            
            if (confirm(`Are you sure you want to delete "${storyTitle}"?\n\nThis action cannot be undone and will permanently remove:\n• The story and all its content\n• All contributions to this story\n• All associated data\n\nClick OK to confirm deletion.`)) {
                window.location.href = this.href;
            }
        });
    });

    console.log('UnitedTales JavaScript loaded successfully!');
});
