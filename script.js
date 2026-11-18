document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const siteHeader = document.querySelector('.site-header');
    const certificateDialog = document.getElementById('certificate-dialog');
    const projectDialog = document.getElementById('project-dialog');
    const dialogImage = document.getElementById('dialog-image');
    const dialogCertTitle = document.getElementById('dialog-cert-title');
    const dialogCertIssuer = document.getElementById('dialog-cert-issuer');
    const dialogCertDate = document.getElementById('dialog-cert-date');
    const dialogDocLink = document.getElementById('dialog-doc-link');
    const projectModalContent = document.getElementById('project-modal-content');
    const projectModalTitle = document.getElementById('project-modal-title');
    const projectModalCategory = document.getElementById('project-modal-category');
    const contactForm = document.getElementById('contact-form');
    const toastNotice = document.getElementById('toast-notice');
    const toastMessage = document.getElementById('toast-message');
    const navLinkAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = document.querySelectorAll('main > section[id]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Toast Notification Helper
    let toastTimeout;
    const showToast = (message, duration = 4000) => {
        if (!toastNotice) return;
        toastMessage.textContent = message;
        toastNotice.classList.add('is-active');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastNotice.classList.remove('is-active');
        }, duration);
    };

    // Mobile Navigation Toggle
    const setMenuOpen = (isOpen) => {
        if (!menuToggle || !navLinks) return;
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        navLinks.classList.toggle('is-open', isOpen);
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
            setMenuOpen(!isOpen);
        });
    }

    if (navLinks) {
        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMenuOpen(false));
        });
    }

    // Header Scroll Effect & Scrollspy
    const updateHeaderAndScrollspy = () => {
        if (siteHeader) {
            siteHeader.classList.toggle('scrolled', window.scrollY > 15);
        }

        // Active Navigation Scrollspy
        const scrollPosition = window.scrollY + 120;
        let currentSectionId = '';

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinkAnchors.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentSectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    updateHeaderAndScrollspy();
    window.addEventListener('scroll', updateHeaderAndScrollspy, { passive: true });

    // Intersection Observer for Reveal Elements
    const revealElements = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach((element) => element.classList.add('is-visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealElements.forEach((element) => revealObserver.observe(element));
    }

    // Certificate Category Filtering
    const certFilterContainer = document.querySelector('.filter-container');
    if (certFilterContainer) {
        const filterButtons = certFilterContainer.querySelectorAll('.filter-btn');
        const certCards = document.querySelectorAll('.certificate-card');

        filterButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                filterButtons.forEach((b) => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                const filterValue = btn.dataset.filter;

                certCards.forEach((card) => {
                    const categories = (card.dataset.category || '').split(' ');
                    if (filterValue === 'all' || categories.includes(filterValue)) {
                        card.classList.remove('is-hidden');
                    } else {
                        card.classList.add('is-hidden');
                    }
                });
            });
        });
    }

    // Universal Lightbox Image Viewer (Certificates & Project Screenshots)
    const openLightbox = ({ image, alt, title, issuer, date, doc }) => {
        if (!certificateDialog) return;

        const docFile = doc || image;
        dialogImage.src = image;
        dialogImage.alt = alt || title || 'Full resolution view';
        dialogCertTitle.textContent = title || 'Preview';
        dialogCertIssuer.textContent = issuer || '';
        dialogCertDate.innerHTML = date ? `<i class="fa-regular fa-calendar" aria-hidden="true"></i> ${date}` : '';
        dialogDocLink.href = docFile;

        if (docFile && docFile.toLowerCase().endsWith('.pdf')) {
            dialogDocLink.innerHTML = `<i class="fa-regular fa-file-pdf" aria-hidden="true"></i> Open Original PDF`;
        } else {
            dialogDocLink.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> View Full Resolution Image`;
        }

        certificateDialog.showModal();
    };

    // Certificate Lightbox Click Handlers
    document.querySelectorAll('.certificate-image-button').forEach((button) => {
        button.addEventListener('click', () => {
            openLightbox({
                image: button.dataset.certificateImage || '',
                alt: button.dataset.certificateAlt || 'Certificate preview',
                title: button.dataset.certificateTitle || 'Certificate',
                issuer: button.dataset.certificateIssuer || '',
                date: button.dataset.certificateDate || '',
                doc: button.dataset.certificateDoc || button.dataset.certificateImage
            });
        });
    });

    // Project Screenshot Lightbox Click Handlers (Delegated for cards and modals)
    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('.image-lightbox-trigger');
        if (trigger) {
            event.preventDefault();
            openLightbox({
                image: trigger.dataset.lightboxImage || '',
                alt: trigger.dataset.lightboxAlt || trigger.dataset.lightboxTitle || 'Project screenshot',
                title: trigger.dataset.lightboxTitle || 'Project Screenshot',
                issuer: trigger.dataset.lightboxIssuer || '',
                date: trigger.dataset.lightboxDate || '',
                doc: trigger.dataset.lightboxDoc || trigger.dataset.lightboxImage
            });
        }
    });

    if (certificateDialog) {
        certificateDialog.addEventListener('close', () => {
            dialogImage.removeAttribute('src');
            dialogImage.alt = '';
        });

        certificateDialog.addEventListener('click', (event) => {
            if (event.target === certificateDialog) certificateDialog.close();
        });
    }

    // Authentic Project Case Studies Data (Strictly from user CV)
    const projectCaseStudies = {
        'hr-analytics': {
            title: 'HR Analytics Project',
            category: 'POWER BI · EXCEL',
            primaryImage: 'HR.1.png',
            secondaryImage: 'HR.2.png',
            objective: 'Identify key factors affecting employee attrition and workforce performance to support HR decision-making and workforce planning.',
            workPerformed: [
                'Cleaned raw employee data and prepared structured datasets in Excel and Power BI.',
                'Performed exploratory data analysis (EDA) to examine workforce distributions, demographics, and turnover patterns across departments.',
                'Identified turnover and department performance patterns through trend analysis.',
                'Built interactive dashboards visualizing HR KPIs such as attrition rate and employee distribution.',
                'Delivered insights to support HR decision-making and workforce planning.'
            ],
            tools: 'Power BI, Microsoft Excel'
        },
        'freelance-client': {
            title: 'Freelance Data Analysis Project',
            category: 'EXCEL · SQL · POWER BI',
            primaryImage: 'Telecommunications Call Center.1.png',
            secondaryImage: null,
            objective: 'Analyze company operational and performance datasets to identify business trends, calculate key metrics, and provide clear reporting for decision-making.',
            workPerformed: [
                'Cleaned and structured client company datasets for analysis.',
                'Formulated SQL queries for data extraction, filtering, and validation.',
                'Identified business trends and key performance indicators (KPIs).',
                'Delivered analytical reports with actionable insights.',
                'Provided insights that supported client decision-making and business performance.'
            ],
            tools: 'SQL, Microsoft Excel, Power BI'
        },
        'sales-analysis': {
            title: 'Sales Analysis Project',
            category: 'EXCEL · POWER BI',
            primaryImage: null,
            secondaryImage: null,
            objective: 'Evaluate sales performance data to calculate key revenue indicators, monitor product trends, and support commercial planning.',
            workPerformed: [
                'Cleaned and prepared sales data for analysis.',
                'Calculated KPIs including revenue trends and product performance.',
                'Structured pivot tables and summary aggregations in Excel.',
                'Built dashboards to visualize sales insights and support business decisions.'
            ],
            tools: 'Microsoft Excel, Power BI'
        }
    };

    // Project Case Study Modal Handler
    document.querySelectorAll('.btn-detail').forEach((button) => {
        button.addEventListener('click', () => {
            const projectId = button.dataset.targetModal;
            const project = projectCaseStudies[projectId];
            if (!project || !projectDialog) return;

            projectModalTitle.textContent = project.title;
            projectModalCategory.textContent = project.category;

            const workItemsHtml = project.workPerformed.map((item) => `<li>${item}</li>`).join('');

            let mediaHtml = '';
            if (project.primaryImage) {
                mediaHtml = `
                    <div class="project-modal-preview">
                        <button class="modal-preview-btn image-lightbox-trigger" type="button"
                            data-lightbox-image="${project.primaryImage}"
                            data-lightbox-title="${project.title} — Primary Dashboard View"
                            data-lightbox-issuer="${project.category}"
                            data-lightbox-date="Power BI Dashboard"
                            data-lightbox-doc="${project.primaryImage}"
                            data-lightbox-alt="${project.title} - Primary View"
                            aria-label="Click to enlarge ${project.title} screenshot">
                            <img src="${project.primaryImage}" alt="${project.title} - View 1">
                            <span class="image-open"><i class="fa-solid fa-expand" aria-hidden="true"></i> View Full Size</span>
                        </button>
                    </div>
                `;
                if (project.secondaryImage) {
                    mediaHtml += `
                        <div class="modal-secondary-preview">
                            <h5>Secondary Dashboard View</h5>
                            <div class="project-modal-preview">
                                <button class="modal-preview-btn image-lightbox-trigger" type="button"
                                    data-lightbox-image="${project.secondaryImage}"
                                    data-lightbox-title="${project.title} — Secondary Dashboard View"
                                    data-lightbox-issuer="${project.category}"
                                    data-lightbox-date="Power BI Dashboard"
                                    data-lightbox-doc="${project.secondaryImage}"
                                    data-lightbox-alt="${project.title} - Secondary View"
                                    aria-label="Click to enlarge secondary view">
                                    <img src="${project.secondaryImage}" alt="${project.title} - View 2">
                                    <span class="image-open"><i class="fa-solid fa-expand" aria-hidden="true"></i> View Full Size</span>
                                </button>
                            </div>
                        </div>
                    `;
                }
            }

            if (mediaHtml) {
                projectModalContent.innerHTML = `
                    <div class="project-dialog-grid">
                        <div>
                            ${mediaHtml}
                        </div>
                        <div>
                            <div class="case-study-section">
                                <h4>Business Objective</h4>
                                <p>${project.objective}</p>
                            </div>
                            <div class="case-study-section">
                                <h4>Work Performed &amp; Analysis</h4>
                                <ul>${workItemsHtml}</ul>
                            </div>
                            <div class="case-study-section">
                                <h4>Tools &amp; Technologies</h4>
                                <p><strong>${project.tools}</strong></p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                projectModalContent.innerHTML = `
                    <div class="case-study-section">
                        <h4>Business Objective</h4>
                        <p>${project.objective}</p>
                    </div>
                    <div class="case-study-section">
                        <h4>Work Performed &amp; Analysis</h4>
                        <ul>${workItemsHtml}</ul>
                    </div>
                    <div class="case-study-section">
                        <h4>Tools &amp; Technologies</h4>
                        <p><strong>${project.tools}</strong></p>
                    </div>
                `;
            }

            projectDialog.showModal();
        });
    });

    if (projectDialog) {
        projectDialog.addEventListener('click', (event) => {
            if (event.target === projectDialog) projectDialog.close();
        });
    }

    // Keyboard ESC listener
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setMenuOpen(false);
            if (certificateDialog && certificateDialog.open) certificateDialog.close();
            if (projectDialog && projectDialog.open) projectDialog.close();
        }
    });

    // Contact Form Submission Handling
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!contactForm.reportValidity()) return;

            const formData = new FormData(contactForm);
            const name = formData.get('name') || '';
            const email = formData.get('email') || '';
            const subjectInput = formData.get('subject') || 'Portfolio Inquiry';
            const message = formData.get('message') || '';

            const subject = `${subjectInput} - from ${name}`;
            const body = `${message}\n\n---\nSender: ${name}\nEmail: ${email}`;

            showToast('Opening your email client to send message...');

            setTimeout(() => {
                window.location.href = `mailto:abdoanwar5252@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }, 300);
        });
    }
});
